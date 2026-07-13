from collections.abc import Generator
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import Base, SessionLocal, engine
from app.models import Creator


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Creator Platform API",
    version="0.1.0",
    lifespan=lifespan,
)


class CreatorCreate(BaseModel):
    display_name: str = Field(min_length=1, max_length=100)


class CreatorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    display_name: str


def get_database() -> Generator[Session, None, None]:
    database = SessionLocal()

    try:
        yield database
    finally:
        database.close()


@app.get("/api/health")
def health() -> dict[str, str]:
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected",
        }
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable",
        ) from exc


@app.post(
    "/api/creators",
    response_model=CreatorResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_creator(
    request: CreatorCreate,
    database: Session = Depends(get_database),
) -> Creator:
    creator = Creator(display_name=request.display_name)

    database.add(creator)
    database.commit()
    database.refresh(creator)

    return creator


@app.get(
    "/api/creators",
    response_model=list[CreatorResponse],
)
def list_creators(
    database: Session = Depends(get_database),
) -> list[Creator]:
    statement = select(Creator).order_by(Creator.id.desc())
    return list(database.scalars(statement))

import { useEffect, useState } from "react";
import "./App.css";

interface HealthResponse {
  status: string;
  database: string;
}

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHealth(): Promise<void> {
      try {
        const response = await fetch("/api/health");

        if (!response.ok) {
          throw new Error(`API returned HTTP ${response.status}`);
        }

        const data = (await response.json()) as HealthResponse;
        setHealth(data);
      } catch (requestError: unknown) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unknown request error",
        );
      }
    }

    void loadHealth();
  }, []);

  return (
    <main>
      <h1>Creator Platform</h1>

      {health && (
        <section>
          <p>API: {health.status}</p>
          <p>Database: {health.database}</p>
        </section>
      )}

      {error && <p>Unable to reach API: {error}</p>}
    </main>
  );
}

export default App;

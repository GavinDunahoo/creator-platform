import { useEffect, useState, type MouseEvent } from "react";
import "./App.css";

type Guess = "location" | "year" | "agency";

const agencies = ["Seattle Police", "King County Sheriff", "Washington State Patrol"];
const rounds = [
  { region: "Pacific Northwest", timestamp: "2021-07-14  16:42:08", camera: "AXON BODY 3  X83039472", scene: "scene-one", answerColumn: 2, answerRow: 2, correctYear: "2021", distance: "18 mi", answerLocation: "Seattle, WA", correctAgency: "Seattle Police" },
  { region: "Mountain West", timestamp: "2019-10-03  08:17:41", camera: "BODYCAM 2  M44182910", scene: "scene-two", answerColumn: 4, answerRow: 1, correctYear: "2019", distance: "42 mi", answerLocation: "Boise, ID", correctAgency: "Ada County Sheriff" },
  { region: "Gulf Coast", timestamp: "2020-06-22  22:05:16", camera: "AXON FLEX  X72910481", scene: "scene-three", answerColumn: 3, answerRow: 3, correctYear: "2020", distance: "27 mi", answerLocation: "Houston, TX", correctAgency: "Houston Police" },
  { region: "Midwest", timestamp: "2018-03-11  13:29:52", camera: "BODYCAM 4  C61830277", scene: "scene-four", answerColumn: 1, answerRow: 2, correctYear: "2018", distance: "64 mi", answerLocation: "Chicago, IL", correctAgency: "Chicago Police" },
  { region: "Southwest", timestamp: "2022-11-08  19:54:03", camera: "AXON BODY 3  A90177382", scene: "scene-five", answerColumn: 5, answerRow: 3, correctYear: "2022", distance: "11 mi", answerLocation: "Phoenix, AZ", correctAgency: "Phoenix Police" },
];

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.5 20 6v5.7c0 4.8-3.1 8.3-8 10.3-4.9-2-8-5.5-8-10.3V6l8-3.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="m8.5 12 2.1 2.1 4.8-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function GamePage() {
  const [selection, setSelection] = useState<Record<Guess, string>>({
    location: "",
    year: "",
    agency: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);
  const [pin, setPin] = useState<{ column: number; row: number } | null>(null);
  const round = rounds[roundNumber - 1];
  const complete = Boolean(pin) && selection.year !== "" && selection.agency !== "";
  const pinPoint = (column: number, row: number) => ({ x: 17 + (column - 1) * 16.5, y: 20 + (row - 1) * 20 });

  function selectGuess(category: Guess, value: string) {
    if (!submitted) setSelection((current) => ({ ...current, [category]: value }));
  }

  function newRound() {
    setSelection({ location: "", year: "", agency: "" });
    setPin(null);
    setSubmitted(false);
    setRoundNumber((current) => current === rounds.length ? 1 : current + 1);
  }

  function dropPin(event: MouseEvent<HTMLElement>) {
    if (submitted) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const column = Math.min(5, Math.max(1, Math.floor(((event.clientX - bounds.left) / bounds.width) * 6) + 1));
    const row = Math.min(4, Math.max(1, Math.floor(((event.clientY - bounds.top) / bounds.height) * 5) + 1));
    setPin({ column, row });
  }

  return (
    <main className="game-shell">
      <header className="game-header">
        <a className="brand" href="/" aria-label="CamGuessr home">
          <span className="brand-mark"><ShieldIcon /></span>
          <span>CAM<span>GUESSR</span></span>
        </a>
        <div className="round-progress" aria-label="Round 3 of 5">
          <span>ROUND</span>
          <strong>{String(roundNumber).padStart(2, "0")} <i>/</i> 05</strong>
          <div className="progress-track"><span className={`progress-fill progress-${roundNumber}`} /></div>
        </div>
        <button className="how-to-play" type="button">How to play <span>?</span></button>
      </header>

      <section className="round-layout">
        <div className="video-panel">
          <div className="footage-frame">
            <div className="media-player-placeholder">
              <span className="media-placeholder-kicker">MEDIA PLAYER PLACEHOLDER</span>
              <strong>Drop your bodycam footage here</strong>
              <span className="media-placeholder-detail">Connect your preferred video provider to begin playback.</span>
              <div className="media-placeholder-icon">▶</div>
            </div>
            <div className="camera-overlay">
              <span className="recording-indicator"><i /> REC</span>
              <span className="camera-time">{round.timestamp}</span>
            </div>
            <div className="camera-readout">{round.camera}</div>
            <button className="play-control" type="button" aria-label="Play footage"><span /></button>
            <div className="footage-caption">Bodycam footage — identity removed</div>
          </div>
          <div className="clip-meta">
            <span><i className="status-dot" /> Clip playing</span>
            <span>00:18 <i>/</i> 01:32</span>
            <button type="button">Replay clip</button>
          </div>
        </div>

        <aside className="guess-card">
          <div className="guess-heading">
            <p>YOUR CASE NOTES</p>
          </div>

          <fieldset className="guess-group map-group">
            <legend><b>01</b> Drop your pin</legend>
            <div className="map-canvas" aria-label="Google map for dropping a location pin">
              <iframe title="Google Maps location map" src="https://www.google.com/maps?q=Seattle%2C%20Washington&output=embed" loading="lazy" />
              <button className="map-click-layer" type="button" onClick={dropPin} aria-label="Click the map to drop your location pin" />
              {submitted && pin ? <svg className="answer-connector" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line x1={pinPoint(pin.column, pin.row).x} y1={pinPoint(pin.column, pin.row).y} x2={pinPoint(round.answerColumn, round.answerRow).x} y2={pinPoint(round.answerColumn, round.answerRow).y} /></svg> : null}
              {pin ? <span className={`dropped-pin pin-column-${pin.column} pin-row-${pin.row}`}><i /></span> : null}
              {submitted ? <span className={`answer-pin pin-column-${round.answerColumn} pin-row-${round.answerRow}`}><i /></span> : null}
              <span className="map-provider">Google Maps</span>
            </div>
            <p className="map-hint">{submitted ? `Answer: ${round.answerLocation}` : pin ? "Pin dropped — click anywhere to reposition" : "Click the map to place your best guess"}</p>
          </fieldset>
          <fieldset className="guess-group year-group">
            <legend><b>02</b> Year <strong>{selection.year || "2021"}</strong></legend>
            <div className="year-slider-wrap">
              <div className="year-track"><span className={`year-track-fill year-fill-${Math.round(((Number(selection.year || "2021") - 1990) / 34) * 10)}`} /></div>
              <input className="year-slider" type="range" min="1990" max="2024" value={selection.year || "2021"} onChange={(event) => selectGuess("year", event.target.value)} disabled={submitted} aria-label="Select the year" />
              <div className="year-range-labels"><span>1990</span><span>2024</span></div>
            </div>
          </fieldset>
          <fieldset className="guess-group">
            <legend><b>03</b> Agency</legend>
            <div className="agency-select-wrap">
              <select className="agency-select" value={selection.agency} onChange={(event) => selectGuess("agency", event.target.value)} disabled={submitted} aria-label="Select the agency">
                <option value="" disabled>Select an agency</option>
                {agencies.map((item) => <option value={item} key={item}>{item}</option>)}
              </select>
              <span className="select-chevron">⌄</span>
            </div>
          </fieldset>

          {submitted ? (
            <div className="result-panel"><div className="result-title"><strong>Round {String(roundNumber).padStart(2, "0")} results</strong><span>{round.distance} from the answer</span></div><div className="result-details"><span><b>ANSWER</b>{round.answerLocation}</span><span><b>YEAR</b>{selection.year} <i>→</i> {round.correctYear}</span><span><b>AGENCY</b>{selection.agency} <i>→</i> {round.correctAgency}</span></div></div>
          ) : null}
          <button className="submit-guess" type="button" disabled={!complete} onClick={() => setSubmitted(true)}>{submitted ? "Guess submitted" : "Lock in guess"}<span>→</span></button>
          {submitted ? <button className="next-round" type="button" onClick={newRound}>Start next round</button> : null}
        </aside>
      </section>

      <footer className="game-footer">
        <span>CAMGUESSR <i>—</i> Train your eye. Test your instincts.</span>
        <span>Round {String(roundNumber).padStart(2, "0")} <i>·</i> {round.region}</span>
      </footer>
    </main>
  );
}

function LandingPage() {
  const [snapshot, setSnapshot] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setSnapshot((current) => (current + 1) % 3), 4200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="landing-shell">
      <header className="landing-header">
        <a className="brand" href="/" aria-label="CamGuessr home">
          <span className="brand-mark"><ShieldIcon /></span>
          <span>CAM<span>GUESSR</span></span>
        </a>
        <span className="landing-edition">FIELD EDITION / 001</span>
      </header>
      <section className="landing-hero">
        <div className="landing-copy">
          <p className="eyebrow">THE BODYCAM LOCATION GAME</p>
          <h1>Read the scene.<br /><em>Find the story.</em></h1>
          <p className="landing-intro">Put your instincts to the test. Watch real-world bodycam footage, study the details, and pin down where and when it happened.</p>
          <a className="landing-play" href="/play">Play CamGuessr <span>→</span></a>
          <p className="landing-note"><span className="live-mark" /> Five rounds. One perfect read.</p>
        </div>
        <div className={`landing-visual snapshot-${snapshot + 1}`} aria-label="CamGuessr bodycam preview">
          <div className="landing-grid" />
          <div className="landing-scene">
            <div className="landing-building landing-building-one" /><div className="landing-building landing-building-two" /><div className="landing-road" /><div className="landing-lamp" /><div className="landing-person" />
          </div>
          <div className="landing-stamp">{snapshot === 0 ? "PNW" : snapshot === 1 ? "MTN" : "GULF"}<br /><strong>0{snapshot + 1}</strong></div>
          <div className="landing-rec"><i /> BODYCAM / {snapshot === 0 ? "16:42:08" : snapshot === 1 ? "08:17:41" : "22:05:16"}</div>
          <div className="landing-caption">EVERY FRAME<br /><span>IS A CLUE</span></div>
        </div>
      </section>
      <section className="landing-details">
        <div><strong>01</strong><p><b>Watch closely</b><br />Every visual detail matters.</p></div>
        <div><strong>02</strong><p><b>Make your call</b><br />Pin a place, set a year, name the agency.</p></div>
        <div><strong>03</strong><p><b>Trust your read</b><br />See how close you got.</p></div>
      </section>
      <footer className="landing-footer"><span>CAMGUESSR <i>—</i> Train your eye. Test your instincts.</span><span>Built for the curious.</span></footer>
    </main>
  );
}

function App() {
  return window.location.pathname === "/play" ? <GamePage /> : <LandingPage />;
}

export default App;

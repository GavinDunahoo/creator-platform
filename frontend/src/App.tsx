import { useState, type MouseEvent } from "react";
import "./App.css";

type Guess = "location" | "year" | "agency";

const years = ["2017", "2019", "2021"];
const agencies = ["Seattle Police", "King County Sheriff", "Washington State Patrol"];

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.5 20 6v5.7c0 4.8-3.1 8.3-8 10.3-4.9-2-8-5.5-8-10.3V6l8-3.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="m8.5 12 2.1 2.1 4.8-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function App() {
  const [selection, setSelection] = useState<Record<Guess, string>>({
    location: "",
    year: "",
    agency: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [pin, setPin] = useState<{ column: number; row: number } | null>(null);
  const complete = Boolean(pin) && selection.year !== "" && selection.agency !== "";

  function selectGuess(category: Guess, value: string) {
    if (!submitted) setSelection((current) => ({ ...current, [category]: value }));
  }

  function newRound() {
    setSelection({ location: "", year: "", agency: "" });
    setPin(null);
    setSubmitted(false);
  }

  function dropPin(event: MouseEvent<HTMLButtonElement>) {
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
          <strong>03 <i>/</i> 05</strong>
          <div className="progress-track"><span /></div>
        </div>
        <button className="how-to-play" type="button">How to play <span>?</span></button>
      </header>

      <section className="round-layout">
        <div className="video-panel">
          <div className="footage-frame">
            <div className="street-scene">
              <div className="building building-left" />
              <div className="building building-right" />
              <div className="street-sign" />
              <div className="car car-one" />
              <div className="car car-two" />
              <div className="road-marking" />
            </div>
            <div className="camera-overlay">
              <span className="recording-indicator"><i /> REC</span>
              <span className="camera-time">2021-07-14&nbsp;&nbsp; 16:42:08</span>
            </div>
            <div className="camera-readout">AXON BODY 3&nbsp;&nbsp; X83039472</div>
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
            <h1>Where and when<br />was this filmed?</h1>
            <span>Use the visual details to make your best call.</span>
          </div>

          <fieldset className="guess-group map-group">
            <legend><b>01</b> Drop your pin</legend>
            <button className="map-canvas" type="button" onClick={dropPin} aria-label="Click the map to drop your location pin">
              <span className="map-water" />
              <span className="map-road map-road-one" />
              <span className="map-road map-road-two" />
              <span className="map-road map-road-three" />
              <span className="map-road map-road-four" />
              <span className="map-label map-label-one">Seattle</span>
              <span className="map-label map-label-two">Lake Washington</span>
              <span className="map-label map-label-three">Bellevue</span>
              <span className="map-control map-plus">+</span>
              <span className="map-control map-minus">−</span>
              {pin ? <span className={`dropped-pin pin-column-${pin.column} pin-row-${pin.row}`}><i /></span> : null}
              <span className="map-provider">Google Maps</span>
            </button>
            <p className="map-hint">{pin ? "Pin dropped — click anywhere to reposition" : "Click the map to place your best guess"}</p>
          </fieldset>
          <fieldset className="guess-group">
            <legend><b>02</b> Year</legend>
            <div className="guess-options compact-options">
              {years.map((item) => <button className={selection.year === item ? "option-button selected" : "option-button"} onClick={() => selectGuess("year", item)} type="button" key={item}>{item}</button>)}
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
            <div className="result-panel"><strong>Case submitted.</strong><span>Your deductions have been logged.</span></div>
          ) : null}
          <button className="submit-guess" type="button" disabled={!complete} onClick={() => setSubmitted(true)}>{submitted ? "Guess submitted" : "Lock in guess"}<span>→</span></button>
          {submitted ? <button className="next-round" type="button" onClick={newRound}>Start next round</button> : null}
        </aside>
      </section>

      <footer className="game-footer">
        <span>CAMGUESSR <i>—</i> Train your eye. Test your instincts.</span>
        <span>Round 03 <i>·</i> Pacific Northwest</span>
      </footer>
    </main>
  );
}

export default App;

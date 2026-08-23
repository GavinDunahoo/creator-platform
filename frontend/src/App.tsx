import { useState } from "react";
import "./App.css";

type Guess = "location" | "year" | "agency";

const locations = ["Downtown Seattle", "Tacoma, WA", "Portland, OR"];
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
  const complete = Object.values(selection).every(Boolean);

  function selectGuess(category: Guess, value: string) {
    if (!submitted) setSelection((current) => ({ ...current, [category]: value }));
  }

  function newRound() {
    setSelection({ location: "", year: "", agency: "" });
    setSubmitted(false);
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

          <fieldset className="guess-group">
            <legend><b>01</b> Location</legend>
            <div className="guess-options">
              {locations.map((item) => <button className={selection.location === item ? "option-button selected" : "option-button"} onClick={() => selectGuess("location", item)} type="button" key={item}>{item}</button>)}
            </div>
          </fieldset>
          <fieldset className="guess-group">
            <legend><b>02</b> Year</legend>
            <div className="guess-options compact-options">
              {years.map((item) => <button className={selection.year === item ? "option-button selected" : "option-button"} onClick={() => selectGuess("year", item)} type="button" key={item}>{item}</button>)}
            </div>
          </fieldset>
          <fieldset className="guess-group">
            <legend><b>03</b> Agency</legend>
            <div className="guess-options">
              {agencies.map((item) => <button className={selection.agency === item ? "option-button selected" : "option-button"} onClick={() => selectGuess("agency", item)} type="button" key={item}>{item}</button>)}
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

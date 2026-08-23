import { useEffect, useRef, useState } from "react";
import "./App.css";

type Guess = "location" | "year" | "agency";

declare global {
  interface Window { google?: any; }
}

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
  const [mapZoom, setMapZoom] = useState(11);
  const mapElement = useRef<HTMLDivElement>(null);
  const googleMap = useRef<any>(null);
  const guessMarker = useRef<any>(null);
  const round = rounds[roundNumber - 1];
  const complete = Boolean(pin) && selection.year !== "" && selection.agency !== "";
  const pinPoint = (column: number, row: number) => ({ x: 17 + (column - 1) * 16.5, y: 20 + (row - 1) * 20 });

  function selectGuess(category: Guess, value: string) {
    if (!submitted) setSelection((current) => ({ ...current, [category]: value }));
  }

  function newRound() {
    setSelection({ location: "", year: "", agency: "" });
    guessMarker.current?.setMap(null);
    guessMarker.current = null;
    setPin(null);
    setMapZoom(11);
    setSubmitted(false);
    setRoundNumber((current) => current === rounds.length ? 1 : current + 1);
  }

  useEffect(() => {
    const initializeMap = () => {
      if (!mapElement.current || !window.google) return;
      const map = new window.google.maps.Map(mapElement.current, { center: { lat: 47.6062, lng: -122.3321 }, zoom: mapZoom, gestureHandling: "greedy", mapTypeControl: false, streetViewControl: false, fullscreenControl: false });
      googleMap.current = map;
      map.addListener("zoom_changed", () => setMapZoom(map.getZoom() ?? 11));
      map.addListener("click", (event: any) => {
        if (submitted || !event.latLng) return;
        const bounds = mapElement.current?.getBoundingClientRect();
        if (!bounds) return;
        const domEvent = event.domEvent as globalThis.MouseEvent;
        setPin({ column: Math.min(5, Math.max(1, Math.floor(((domEvent.clientX - bounds.left) / bounds.width) * 6) + 1)), row: Math.min(4, Math.max(1, Math.floor(((domEvent.clientY - bounds.top) / bounds.height) * 5) + 1)) });
        if (guessMarker.current) guessMarker.current.setPosition(event.latLng);
        else guessMarker.current = new window.google.maps.Marker({ map, position: event.latLng, title: "Your guess" });
      });
    };
    if (window.google) initializeMap();
    else {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    }
  }, []);


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
        <button className="how-to-play" type="button" aria-label="How to play">
          How to play <span>?</span>
          <span className="how-to-tooltip" role="tooltip">
            <strong>How to play</strong>
            <span>Watch the footage, drop a map pin, choose the year and agency, then lock in your guess.</span>
          </span>
        </button>
      </header>

      <section className="round-layout">
        <div className="video-panel">
          <div className="footage-frame">
            <video
              className="game-video"
              src="/media/bodycam1.mp4"
              controls
              playsInline
              preload="metadata"
            />
          </div>
        </div>

        <aside className="guess-card">
          <div className="guess-heading">
            <p>YOUR CASE NOTES</p>
          </div>

          <fieldset className="guess-group map-group">
            <legend><b>01</b> Drop your pin</legend>
            <div className="map-canvas" aria-label="Google map for dropping a location pin">
              <div className="google-map" ref={mapElement} />
              {submitted && pin ? <svg className="answer-connector" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line x1={pinPoint(pin.column, pin.row).x} y1={pinPoint(pin.column, pin.row).y} x2={pinPoint(round.answerColumn, round.answerRow).x} y2={pinPoint(round.answerColumn, round.answerRow).y} /></svg> : null}
              {submitted ? <span className={`answer-pin pin-column-${round.answerColumn} pin-row-${round.answerRow}`}><i /></span> : null}
              <div className="map-zoom-controls"><button type="button" onClick={() => googleMap.current?.setZoom(Math.min(19, (googleMap.current.getZoom() ?? mapZoom) + 1))} aria-label="Zoom in">+</button><button type="button" onClick={() => googleMap.current?.setZoom(Math.max(1, (googleMap.current.getZoom() ?? mapZoom) - 1))} aria-label="Zoom out">−</button></div>
              <span className="map-provider">Google Maps</span>
            </div>
            <p className="map-hint">{submitted ? `Answer: ${round.answerLocation}` : pin ? "Pin placed · drag or scroll to explore" : "Click and hold to drag · scroll to zoom · click to pin"}</p>
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
        <a className="brand" href="/" aria-label="CamGuessr home"><span className="brand-mark"><ShieldIcon /></span><span>CAM<span>GUESSR</span></span></a>
        <nav className="landing-nav"><a href="#how-it-works">How it works</a><a href="#modes">Game modes</a><a className="nav-play" href="/play">Play now <span>→</span></a></nav>
      </header>
      <section className="landing-hero">
        <div className="landing-copy"><h1>Where did this footage happen?</h1><a className="landing-play" href="/play">Play CamGuessr <span>→</span></a></div>
        <div className={`landing-visual snapshot-${snapshot + 1}`} aria-label="CamGuessr gameplay preview">
          <div className="preview-video"><span className="preview-video-top"><i /> LIVE FOOTAGE <b>00:18</b></span><div className="preview-road" /><div className="preview-window preview-window-one" /><div className="preview-window preview-window-two" /><span className="preview-video-bottom">BODYCAM FOOTAGE · 00:18</span></div>
          <div className="preview-map"><div className="preview-map-lines" /><span className="preview-map-label">SEATTLE</span><span className="preview-pin"><i /></span><span className="preview-map-tag">YOUR GUESS</span><div className="preview-map-footer">MAP VIEW <b>+</b></div></div>
          <div className="preview-step"><span>WATCH</span><i>→</i><span>PIN</span><i>→</i><span>SCORE</span></div>
        </div>
      </section>
      <section className="landing-details" id="how-it-works"><div className="section-heading"><p className="eyebrow">HOW IT WORKS</p><h2>How to play.</h2></div><div className="detail-card"><strong>01</strong><span className="detail-icon">◉</span><p><b>Watch the footage</b><br />Look for signs, businesses, road markings, architecture, and other location clues.</p></div><div className="detail-card"><strong>02</strong><span className="detail-icon">⌖</span><p><b>Make your guess</b><br />Drop a pin, set the year, and choose the agency.</p></div><div className="detail-card"><strong>03</strong><span className="detail-icon">↗</span><p><b>See how close you were</b><br />Reveal the answer and earn points based on distance.</p></div></section>
      <section className="mode-section" id="modes"><div className="section-heading"><p className="eyebrow">CHOOSE YOUR RUN</p><h2>Pick a way to play.</h2></div><div className="mode-grid"><a className="mode-card mode-featured" href="/play"><span className="mode-number">01</span><span className="mode-arrow">↗</span><h3>Classic</h3><p>Five random bodycam locations. How sharp is your eye?</p><span className="mode-link">PLAY NOW</span></a><a className="mode-card" href="/play"><span className="mode-number">02</span><span className="mode-arrow">↗</span><h3>Daily Challenge</h3><p>Everyone gets the same locations. Compare your score.</p><span className="mode-link">COMING SOON</span></a><a className="mode-card" href="/play"><span className="mode-number">03</span><span className="mode-arrow">↗</span><h3>Multiplayer</h3><p>Challenge friends and see who can read the scene fastest.</p><span className="mode-link">COMING SOON</span></a></div></section>
    </main>
  );
}

function App() {
  return window.location.pathname === "/play" ? <GamePage /> : <LandingPage />;
}

export default App;

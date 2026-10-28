import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  AudioLines,
  BadgeCheck,
  Camera,
  Check,
  CheckCheck,
  Droplets,
  Hand,
  Maximize2,
  Pause,
  Play,
  Radio,
  RotateCcw,
  ScanLine,
  Sparkles,
  Volume2,
  VolumeX,
  Wind,
} from 'lucide-react';
import CameraPanel, { type TrackingFrame } from '../components/CameraPanel';
import { observePresence } from '../cv/handPresence';
import { KioskScene, HandGuide } from './KioskScene';
import {
  accepts,
  CAMERA_FRESHNESS_MS,
  HAND_ACQUISITION_SECONDS,
  begin,
  initialState,
  stepsFor,
  tick,
  type Method,
  type Observation,
} from './protocol';

export default function KioskSimulation() {
  const [state, setState] = useState(initialState),
    [observation, setObservation] = useState<Observation | null>(null),
    [voice, setVoice] = useState(false);
  const latest = useRef<Observation | null>(null),
    shell = useRef<HTMLDivElement>(null);
  const [fullscreenError, setFullscreenError] = useState('');
  const steps = state.method ? stepsFor(state.method) : [],
    step = steps[state.index];
  const intro = state.phase === 'approach' || state.phase === 'rfid';
  const running = state.phase === 'session';
  const completed = state.phase === 'completed';
  const progress = step ? Math.min(100, (state.progress / step.seconds) * 100) : 0;
  const fresh =
    observation && performance.now() - observation.at <= CAMERA_FRESHNESS_MS ? observation : null;
  const matched = state.source === 'demo' || !!(step && accepts(step, fresh, performance.now()));
  const onFrame = useCallback((frame: TrackingFrame | null) => {
    const next = frame ? observePresence(frame.result, frame.timestamp) : null;
    latest.current = next;
    setObservation(next);
  }, []);
  useEffect(() => {
    let last = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now(),
        delta = (now - last) / 1000;
      last = now;
      if (!document.hidden) setState((s) => tick(s, delta, now, latest.current));
    }, 50);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    latest.current = null;
    setObservation(null);
  }, [state.phase, state.paused]);
  useEffect(() => {
    if (!voice || state.paused || !('speechSynthesis' in window)) return;
    const message = completed
      ? 'Process completed. Thank you, Doctor Maha.'
      : state.phase === 'welcome'
        ? 'Hello, Doctor Maha. Choose your hand hygiene method.'
        : running
          ? `${step.title}. ${step.instruction}`
          : '';
    if (message) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
    return () => window.speechSynthesis.cancel();
  }, [
    voice,
    state.paused,
    state.phase,
    state.index,
    completed,
    running,
    step?.title,
    step?.instruction,
  ]);
  function reset() {
    latest.current = null;
    setObservation(null);
    setState(initialState(state.source));
  }
  function select(method: Method) {
    latest.current = null;
    setState((s) => begin(s, method));
  }
  const status = state.paused
    ? 'Simulation paused'
    : state.source === 'demo'
      ? 'Doctor movement · simulated'
      : !fresh || fresh.hands !== 2
        ? 'Bring both hands into view'
        : fresh.quality < 0.85
          ? 'Keep both hands fully in frame'
          : !state.handsVerified
            ? `Verifying both hands · ${Math.min(100, Math.round((state.stable / HAND_ACQUISITION_SECONDS) * 100))}%`
            : 'Both hands verified · auto-guiding';
  const chapters = ['Arrival', 'Identification', 'Hand hygiene', 'Complete'];
  const chapter =
    state.phase === 'approach'
      ? 0
      : state.phase === 'rfid' || state.phase === 'welcome'
        ? 1
        : completed
          ? 3
          : 2;
  return (
    <div className={`simulation ${intro ? 'is-arrival' : ''}`} ref={shell}>
      <header className="simulation-header">
        <a className="wordmark" href="/" aria-label="Hygienex simulation">
          <span className="brand-symbol">
            <Hand size={22} />
          </span>
          hygienex
          <span className="wordmark-divider" />
          <small>THE HYGIENE SIMULATION</small>
        </a>
        <div className="simulation-controls">
          <span className="scene-live">
            <i /> INTERACTIVE 3D
          </span>
          <button
            aria-label={voice ? 'Mute voice guidance' : 'Enable voice guidance'}
            title="Voice guidance"
            onClick={() => setVoice(!voice)}
          >
            {voice ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button
            aria-label={state.paused ? 'Resume simulation' : 'Pause simulation'}
            title={state.paused ? 'Resume' : 'Pause'}
            onClick={() =>
              setState((s) => ({
                ...s,
                paused: !s.paused,
                stable: 0,
                handsVerified: false,
                trackingGap: 0,
              }))
            }
          >
            {state.paused ? <Play size={18} /> : <Pause size={18} />}
          </button>
          <button aria-label="Restart simulation" title="Restart from arrival" onClick={reset}>
            <RotateCcw size={18} />
          </button>
          <button
            className="fullscreen-button"
            aria-label="Toggle fullscreen"
            onClick={() => {
              setFullscreenError('');
              const action = document.fullscreenElement
                ? document.exitFullscreen()
                : shell.current?.requestFullscreen?.();
              action?.catch(() => setFullscreenError('Fullscreen is unavailable in this browser.'));
            }}
          >
            <Maximize2 size={17} />
          </button>
        </div>
      </header>

      <div className="scene-area">
        <KioskScene
          state={{
            ...state,
            paused:
              state.paused ||
              (running && state.source === 'camera' && (!matched || !state.handsVerified)),
          }}
        />
      </div>
      <div className="scene-annotation">
        <span className="annotation-line" />
        <div>
          <span className="eyebrow">HYGIENEX / HX–01</span>
          <p>One station. Every step.</p>
        </div>
      </div>
      <div className={`identity-card ${state.phase === 'approach' ? 'is-pending' : ''}`}>
        <span className="identity-avatar">M</span>
        <div>
          <strong>
            {state.phase === 'approach' ? 'Dr. Maha is approaching' : 'Dr. Maha'}
            <BadgeCheck size={15} />
          </strong>
          <span>
            {state.phase === 'approach'
              ? 'Presenting staff RFID card'
              : 'Staff 042 · RFID recognized'}
          </span>
        </div>
        <Radio size={19} />
      </div>

      <main className="display-panel" aria-label="Hand hygiene station display">
        <div className="display-topline">
          <span>
            <span className="tiny-square" /> STATION DISPLAY
          </span>
          <span className="display-serial">
            HX–01 <i />
          </span>
        </div>
        {intro ? (
          <section className="arrival-content">
            <div className="arrival-icon">
              <Radio size={34} strokeWidth={1.3} />
              <span className="scan-ring" />
              <span className="scan-ring second" />
            </div>
            <span className="eyebrow">
              {state.phase === 'rfid' ? 'IDENTITY RECOGNIZED' : 'A LITTLE CARE BEFORE CARE'}
            </span>
            <h1>
              {state.phase === 'rfid' ? (
                <>
                  Hello, Dr. Maha<span className="mint">.</span>
                </>
              ) : (
                <>
                  Better care
                  <br />
                  starts with
                  <br />
                  <em>clean hands.</em>
                </>
              )}
            </h1>
            <p>
              {state.phase === 'rfid'
                ? 'Your personal hygiene session is ready. Let’s begin.'
                : 'Walk up. Tap in. Follow along. A touchless journey from the first drop to the final check.'}
            </p>
            <div className="arrival-status">
              <span className="pulse-dot" />
              {state.phase === 'rfid'
                ? 'RFID card matched · preparing display'
                : 'Waiting for Dr. Maha’s RFID card'}
              <span>{Math.min(100, Math.round((state.clock / 8) * 100))}%</span>
            </div>
            <div className="arrival-track">
              <i style={{ width: `${(state.clock / 8) * 100}%` }} />
            </div>
          </section>
        ) : state.phase === 'welcome' ? (
          <section className="welcome-content">
            <div className="welcome-badge">
              <CheckCheck size={16} /> RFID VERIFIED <span>· SIMULATED</span>
            </div>
            <h1>
              Hello, Dr. Maha<span className="mint">.</span>
            </h1>
            <p className="welcome-subtitle">
              A moment for your hands.
              <br />A difference for every patient.
            </p>
            <div className="method-heading">
              <h2>Choose your hygiene method</h2>
              <span>01 / 02</span>
            </div>
            <button className="method-card wash" onClick={() => select('handwash')}>
              <span className="method-icon">
                <Droplets size={27} strokeWidth={1.5} />
              </span>
              <span>
                <strong>Handwash</strong>
                <small>Water, soap & warm air</small>
                <span className="method-duration">
                  ~53 SEC DEMO <span>10 STEPS</span>
                </span>
              </span>
              <ArrowRight size={21} />
            </button>
            <button className="method-card sanitize" onClick={() => select('sanitizer')}>
              <span className="method-icon">
                <Sparkles size={27} strokeWidth={1.5} />
              </span>
              <span>
                <strong>Sanitizer</strong>
                <small>Apply, rub & dry naturally</small>
                <span className="method-duration">
                  ~26 SEC DEMO <span>8 STEPS</span>
                </span>
              </span>
              <ArrowRight size={21} />
            </button>
            <div className="input-source" role="group" aria-label="Movement source">
              <button
                aria-pressed={state.source === 'camera'}
                onClick={() => setState((s) => ({ ...s, source: 'camera' }))}
              >
                <Camera size={16} /> My hands
              </button>
              <button
                aria-pressed={state.source === 'demo'}
                onClick={() => setState((s) => ({ ...s, source: 'demo' }))}
              >
                <Play size={15} /> Doctor demo
              </button>
            </div>
            <p className="source-caption">
              {state.source === 'camera'
                ? 'Show both hands to begin. The routine advances automatically and pauses when a hand leaves the camera.'
                : 'Watch the doctor complete the entire routine automatically. All movement evidence is simulated.'}
            </p>
          </section>
        ) : completed ? (
          <section className="completed-content" aria-live="polite">
            <div className="completion-orbit">
              <div className="completion-ripples" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <div className="completion-motes" aria-hidden="true">
                {Array.from({ length: 8 }, (_, i) => (
                  <i key={i} style={{ rotate: `${i * 45}deg`, animationDelay: `${i * 0.07}s` }} />
                ))}
              </div>
              <span className="completion-check">
                <Check size={80} strokeWidth={2.3} />
              </span>
            </div>
            <span className="eyebrow">EVERY STEP. COMPLETE.</span>
            <h1>
              All done,
              <br />
              Dr. Maha<span className="mint">.</span>
            </h1>
            <p className="complete-message">Hand hygiene process completed.</p>
            <div className="completion-details">
              <span>
                {state.method === 'handwash' ? <Droplets size={19} /> : <Sparkles size={19} />}
                {state.method === 'handwash' ? 'Handwash' : 'Sanitizer'}
              </span>
              <span>
                {steps.length} / {steps.length} steps
              </span>
              <span>{Math.round(state.elapsed)} sec</span>
            </div>
            <p className="completion-note">
              {state.source === 'demo'
                ? 'The animated doctor completed the simulated routine.'
                : 'Camera hand-presence checks and all guided simulation steps completed. Rubbing technique was not verified.'}
              <br />
              Completion does not prove sterility or physical dryness.
            </p>
            <button className="primary-button" onClick={reset}>
              Replay the experience <RotateCcw size={16} />
            </button>
          </section>
        ) : (
          <section className="session-content">
            <div className="session-meta">
              <span>
                {state.method === 'handwash' ? <Droplets size={15} /> : <Sparkles size={15} />}
                {state.method === 'handwash' ? 'HANDWASH' : 'SANITIZER'}
              </span>
              <span>
                STEP {String(state.index + 1).padStart(2, '0')}{' '}
                <span className="muted">/ {steps.length}</span>
              </span>
            </div>
            <div className="step-copy" aria-live="polite">
              <h1>
                {step.title}
                <span className="mint">.</span>
              </h1>
              <p>{step.instruction}</p>
            </div>
            <div className="movement-displays">
              <div className="guide-panel">
                <div className="panel-heading">
                  <span>
                    <Hand size={13} /> 3D GUIDE
                  </span>
                  <span className="guide-live">{state.paused ? 'PAUSED' : 'FOLLOW ALONG'}</span>
                </div>
                <div className="guide-view">
                  <HandGuide
                    technique={step.technique}
                    paused={state.paused}
                    seconds={step.seconds}
                  />
                  <span className="guide-floor" />
                  <div className="guide-caption">
                    {step.technique < 0
                      ? 'Position both hands'
                      : step.bilateral
                        ? 'Both hands · alternate sides'
                        : 'Repeat this movement'}
                  </div>
                </div>
              </div>
              {state.source === 'camera' ? (
                <CameraPanel onFrame={onFrame} autoStart />
              ) : (
                <div className="demo-panel">
                  <div className="panel-heading">
                    <span>
                      <ScanLine size={13} /> DOCTOR’S HANDS
                    </span>
                    <span className="demo-label">SIMULATED</span>
                  </div>
                  <div className="guide-view">
                    <HandGuide
                      technique={step.technique}
                      paused={state.paused}
                      seconds={step.seconds}
                      detected
                    />
                    <div className="tracking-bracket tl" />
                    <div className="tracking-bracket br" />
                    <div className="guide-caption">
                      <span className="pulse-dot" /> Animated movement
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div
              className={`verification-status ${matched && (state.source === 'demo' || state.handsVerified) && !state.paused ? 'matching' : ''}`}
            >
              <span className="verification-icon">
                {matched && (state.source === 'demo' || state.handsVerified) ? (
                  <Check size={17} />
                ) : (
                  <ScanLine size={17} />
                )}
              </span>
              <div>
                <strong>{status}</strong>
                <small>
                  {state.source === 'demo'
                    ? 'Automatic progression · simulated evidence'
                    : 'Hand-presence check · timed guidance, not technique verification'}
                </small>
              </div>
              {state.paused ? <Pause size={15} /> : <AudioLines size={19} />}
            </div>
            {step.bilateral && (
              <div className="bilateral-status">
                {['Left hand guide', 'Right hand guide'].map((label, i) => (
                  <span
                    key={label}
                    className={state.sides[i] >= step.seconds / 2 - 0.01 ? 'side-done' : ''}
                  >
                    <Check size={13} />
                    {label}
                    <i
                      style={{
                        width: `${Math.min(100, (state.sides[i] / (step.seconds / 2)) * 100)}%`,
                      }}
                    />
                  </span>
                ))}
              </div>
            )}
            <div className="step-progress-heading">
              <span>
                {state.paused ? 'Paused' : progress >= 99 ? 'Step complete' : 'Step progress'}
              </span>
              <strong>
                {Math.round(progress)}
                <small>%</small>
              </strong>
            </div>
            <div
              className="step-progress"
              role="progressbar"
              aria-label="Current step progress"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <i style={{ width: `${progress}%` }} />
            </div>
            <div className="step-sequence" aria-label="Hygiene sequence">
              {steps.map((s, i) => (
                <div
                  key={s.id}
                  title={s.title}
                  className={i < state.index ? 'done' : i === state.index ? 'current' : ''}
                >
                  <span>{i < state.index ? <Check size={12} /> : i + 1}</span>
                  <small>
                    {s.id === 'natural'
                      ? 'Dry'
                      : s.id === 'dryer'
                        ? 'Air dry'
                        : s.title.split(' ')[0]}
                  </small>
                </div>
              ))}
            </div>
            <div className="next-step">
              <span>
                {state.source === 'camera' ? 'KEEP BOTH HANDS IN VIEW' : 'AUTOMATIC DEMONSTRATION'}
              </span>
              <span>
                {state.index < steps.length - 1 ? (
                  <>
                    Next: {steps[state.index + 1].title}
                    <ArrowRight size={13} />
                  </>
                ) : (
                  <>
                    Final step
                    <CheckCheck size={14} />
                  </>
                )}
              </span>
            </div>
          </section>
        )}
        <div className="display-bottomline">
          <span>
            <i />{' '}
            {running
              ? state.source === 'camera'
                ? 'LOCAL CAMERA · PRESENCE-GUIDED AUTO ADVANCE'
                : 'SIMULATED MOVEMENT · AUTO ADVANCE'
              : 'TOUCHLESS CARE, THOUGHTFULLY GUIDED'}
          </span>
          {running && step.effect === 'air' ? <Wind size={15} /> : <Hand size={15} />}
        </div>
      </main>
      <footer className="simulation-footer">
        <div className="chapter-timeline">
          {chapters.map((label, i) => (
            <div key={label} className={chapter === i ? 'active' : chapter > i ? 'passed' : ''}>
              <span>{chapter > i ? <Check size={11} /> : `0${i + 1}`}</span>
              <small>{label}</small>
              {i < 3 && <i />}
            </div>
          ))}
        </div>
        <p>
          {fullscreenError || '3D simulation · RFID & device flows are virtual'}
          <span>TECH WIZARDS</span>
        </p>
      </footer>
      {state.paused && (
        <div className="pause-indicator">
          <Pause size={14} /> PAUSED
        </div>
      )}
    </div>
  );
}

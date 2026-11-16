import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveMinigameReturn, getGameUrl } from "../lib/minigameNav";

// 50% positive · 25% neutral · 25% negative  (30 / 15 / 15 = 60 total)
const ANSWERS = [
  // — Positive (30) —
  "It is certain",
  "It is decidedly so",
  "Without a doubt",
  "Yes, definitely",
  "You may rely on it",
  "As I see it, yes",
  "Most likely",
  "Outlook good",
  "Signs point to yes",
  "Absolutely",
  "Count on it",
  "Of course",
  "Yes, without question",
  "All signs say yes",
  "The stars align",
  "Undoubtedly",
  "I'd bet on it",
  "Positively",
  "Definitely yes",
  "Go for it",
  "The universe says yes",
  "It shall be so",
  "Highly likely",
  "The odds are with you",
  "Trust your gut — yes",
  "Clear as day — yes",
  "No question about it",
  "You know the answer",
  "Yes, and then some",
  "Every sign says yes",
  // — Neutral (15) —
  "Reply hazy, try again",
  "Ask again later",
  "Better not tell you now",
  "Cannot predict now",
  "Concentrate and ask again",
  "The future is unclear",
  "My crystal ball is foggy",
  "Check back in a bit",
  "The answer eludes me",
  "Not sure — flip a coin",
  "The signs are mixed",
  "Too close to call",
  "Even I don't know",
  "Ask me after lunch",
  "The stars are silent",
  // — Negative (15) —
  "Don't count on it",
  "My reply is no",
  "My sources say no",
  "Outlook not so good",
  "Very doubtful",
  "I wouldn't bet on it",
  "The signs say no",
  "Unlikely",
  "Don't get your hopes up",
  "Hard pass",
  "Not looking good",
  "The universe is skeptical",
  "I see obstacles ahead",
  "Better luck next time",
  "That's a no from me",
];

const SHAKE_THRESHOLD = 14;
const SHAKE_COOLDOWN_MS = 1600;
const ANIM_MS = 700;

export function Magic8Ball() {
  const nav = useNavigate();
  const gameUrl = useRef(getGameUrl());
  useEffect(() => {
    document.title = "Magic 8 Ball · TripBored";
    return () => { document.title = "TripBored"; };
  }, []);
  const [answer, setAnswer] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);
  const [shakeEnabled, setShakeEnabled] = useState(false);
  const [iosPrompt, setIosPrompt] = useState(false);

  const shakingRef = useRef(false);
  const cooldown = useRef(false);
  const lastAnswer = useRef<string | null>(null);
  const lastAcc = useRef({ x: 0, y: 0, z: 0 });
  const motionListener = useRef<((e: DeviceMotionEvent) => void) | null>(null);

  function pickAnswer() {
    let pick: string;
    do {
      pick = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
    } while (pick === lastAnswer.current && ANSWERS.length > 1);
    return pick;
  }

  const doShake = useCallback(() => {
    if (shakingRef.current || cooldown.current) return;
    shakingRef.current = true;
    cooldown.current = true;
    setShaking(true);
    setTimeout(() => {
      const next = pickAnswer();
      lastAnswer.current = next;
      setAnswer(next);
      setShaking(false);
      shakingRef.current = false;
    }, Math.round(ANIM_MS * 0.6));
    setTimeout(() => { cooldown.current = false; }, SHAKE_COOLDOWN_MS);
  }, []);

  const handleMotion = useCallback((e: DeviceMotionEvent) => {
    const acc = e.accelerationIncludingGravity;
    if (!acc) return;
    const x = acc.x ?? 0, y = acc.y ?? 0, z = acc.z ?? 0;
    const delta =
      Math.abs(x - lastAcc.current.x) +
      Math.abs(y - lastAcc.current.y) +
      Math.abs(z - lastAcc.current.z);
    lastAcc.current = { x, y, z };
    if (delta > SHAKE_THRESHOLD) doShake();
  }, [doShake]);

  function addMotionListener() {
    const fn = (e: DeviceMotionEvent) => handleMotion(e);
    motionListener.current = fn;
    window.addEventListener("devicemotion", fn);
    setShakeEnabled(true);
  }

  function removeMotionListener() {
    if (motionListener.current) {
      window.removeEventListener("devicemotion", motionListener.current);
      motionListener.current = null;
    }
    setShakeEnabled(false);
  }

  function toggleShake() {
    if (shakeEnabled) {
      removeMotionListener();
    } else {
      addMotionListener();
    }
  }

  async function requestIosPermission() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (DeviceMotionEvent as any).requestPermission();
      if (result === "granted") {
        addMotionListener();
        setIosPrompt(false);
      }
    } catch {
      // user denied or API unavailable
    }
  }

  useEffect(() => {
    if (typeof DeviceMotionEvent === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (DeviceMotionEvent as any).requestPermission === "function") {
      setIosPrompt(true); // iOS 13+ needs a user gesture first
    } else {
      addMotionListener(); // Android / desktop
    }
    return () => {
      if (motionListener.current) {
        window.removeEventListener("devicemotion", motionListener.current);
      }
    };
  }, []);

  return (
    <div className="m8-page">
      <div className="cl-header">
        <button className="btn btn-secondary btn-sm" onClick={() => nav("/")}>Home</button>
        <h1 className="cl-title">Magic 8 Ball</h1>
        {gameUrl.current && (
          <div className="cl-header-right">
            <button className="btn btn-secondary btn-sm" onClick={() => {
              saveMinigameReturn("/magic-8", "Magic 8 Ball");
              nav(gameUrl.current!);
            }}>Board</button>
          </div>
        )}
      </div>

      <div className="m8-scene">
        <button
          className={shaking ? "m8-ball m8-shaking" : "m8-ball"}
          onClick={doShake}
          aria-label="Shake the Magic 8 Ball"
        >
          <div className="m8-window">
            <svg viewBox="0 0 128 128" className="m8-window-svg" aria-hidden="true">
              <defs>
                <radialGradient id="triGrad" cx="50%" cy="32%" r="60%">
                  <stop offset="0%" stopColor="#66aaff" />
                  <stop offset="55%" stopColor="#2255ee" />
                  <stop offset="100%" stopColor="#0a22aa" />
                </radialGradient>
                <radialGradient id="windowBg" cx="50%" cy="38%" r="54%">
                  <stop offset="0%" stopColor="#0c0c1e" />
                  <stop offset="100%" stopColor="#04040d" />
                </radialGradient>
                <filter id="triGlow">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* Deep background fills the whole circle */}
              <circle cx="64" cy="64" r="64" fill="url(#windowBg)" />
              {/* Inset ring — outer dark band */}
              <circle cx="64" cy="64" r="62" fill="none" stroke="rgba(0,0,0,0.85)" strokeWidth="7" />
              {/* Inset ring — inner highlight sliver */}
              <circle cx="64" cy="64" r="58.5" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
              {/* Downward-pointing triangle (wider base for more text room) */}
              <polygon
                points="64,108 7,26 121,26"
                fill="url(#triGrad)"
                filter="url(#triGlow)"
              />
            </svg>
            <div className={shaking ? "m8-answer m8-answer-hidden" : "m8-answer"}>
              {answer}
            </div>
          </div>
        </button>
      </div>

      <div className="m8-controls">
        <button className="btn btn-navy btn-md" onClick={doShake} disabled={shaking}>
          {shaking ? "Shaking…" : "Tap to shake"}
        </button>

        {iosPrompt && !shakeEnabled && (
          <button className="btn btn-navy btn-md m8-enable-btn" onClick={requestIosPermission}>
            Enable physical shake
          </button>
        )}

        {(shakeEnabled || (!iosPrompt && typeof DeviceMotionEvent !== "undefined")) && (
          <button className="m8-toggle-shake" onClick={toggleShake}>
            <span className={shakeEnabled ? "m8-toggle-dot m8-toggle-on" : "m8-toggle-dot"} />
            Physical shake {shakeEnabled ? "on" : "off"}
          </button>
        )}
      </div>

      {!answer && !shaking && (
        <p className="cl-instructions">Ask a question out loud, then shake</p>
      )}
    </div>
  );
}

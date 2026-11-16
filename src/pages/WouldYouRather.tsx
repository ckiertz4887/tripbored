import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QUESTIONS } from "../data/would-you-rather";
import { saveMinigameReturn, getGameUrl } from "../lib/minigameNav";

const STORAGE_KEY = "wyr_v1";

type State = { deck: number[]; pos: number };

function newDeck(avoid: number | null): number[] {
  const arr = Array.from({ length: QUESTIONS.length }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  if (avoid !== null && arr.length > 1 && arr[0] === avoid) {
    const j = 1 + Math.floor(Math.random() * (arr.length - 1));
    [arr[0], arr[j]] = [arr[j], arr[0]];
  }
  return arr;
}

function loadState(): State {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw) as Partial<State>;
      if (
        Array.isArray(s.deck) &&
        s.deck.length === QUESTIONS.length &&
        typeof s.pos === "number" &&
        s.pos >= 0 &&
        s.pos < s.deck.length
      ) {
        return s as State;
      }
    }
  } catch {}
  return { deck: newDeck(null), pos: 0 };
}

export function WouldYouRather() {
  const nav = useNavigate();
  const gameUrl = useRef(getGameUrl());
  const [state, setState] = useState<State>(loadState);
  const { deck, pos } = state;

  useEffect(() => {
    document.title = "Would You Rather · TripBored";
    return () => { document.title = "TripBored"; };
  }, []);

  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const question = QUESTIONS[deck[pos]];

  function goNext() {
    setState(prev => {
      const next = prev.pos + 1;
      if (next < prev.deck.length) return { ...prev, pos: next };
      return { deck: newDeck(prev.deck[prev.deck.length - 1]), pos: 0 };
    });
  }

  function goPrev() {
    setState(prev => ({ ...prev, pos: Math.max(0, prev.pos - 1) }));
  }

  return (
    <div className="wyr-page">
      <div className="cl-header">
        <button className="btn btn-secondary btn-sm" onClick={() => nav("/")}>Home</button>
        <h1 className="cl-title">Would You Rather</h1>
        {gameUrl.current && (
          <div className="cl-header-right">
            <button className="btn btn-secondary btn-sm" onClick={() => {
              saveMinigameReturn("/would-you-rather", "Would You Rather");
              nav(gameUrl.current!);
            }}>Board</button>
          </div>
        )}
      </div>

      <div className="wyr-card">
        <div key={pos} className="wyr-card-inner">
          <div className="wyr-prompt">Would you rather…</div>
          <button className="wyr-option wyr-option-a" onClick={goNext}>
            <span className="wyr-option-letter">A</span>
            <span className="wyr-option-text">{question[2]}</span>
          </button>
          <div className="wyr-or">OR</div>
          <button className="wyr-option wyr-option-b" onClick={goNext}>
            <span className="wyr-option-letter">B</span>
            <span className="wyr-option-text">{question[3]}</span>
          </button>
        </div>
      </div>

      <div className="wyr-nav">
        <button className="btn btn-navy btn-md" onClick={goPrev} disabled={pos === 0}>
          ← Back
        </button>
        <span className="wyr-progress">{pos + 1} / {deck.length}</span>
        <button className="btn btn-navy btn-md" onClick={goNext}>
          Next →
        </button>
      </div>
    </div>
  );
}

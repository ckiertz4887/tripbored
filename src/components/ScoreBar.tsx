import { useEffect, useRef, useState } from "react";

type Props = {
  score: number;
  possible: number;
  gameName: string;
  status: "active" | "finalized";
  onRename?: () => void;
  onShare: () => void;
  shareCopied: boolean;
  onHome: () => void;
};

/** Zero-padded LCD readout — the arcade hit counter. */
function Digits({ value, pad = 5 }: { value: number; pad?: number }) {
  return (
    <>
      {String(Math.max(0, value))
        .padStart(pad, "0")
        .split("")
        .map((d, i) => (
          <span className="digit" key={i}>
            {d}
          </span>
        ))}
    </>
  );
}

export function ScoreBar({ score, possible, gameName, status, onRename, onShare, shareCopied, onHome }: Props) {
  const [flash, setFlash] = useState(false);
  const prevScore = useRef(score);

  useEffect(() => {
    if (score !== prevScore.current) {
      prevScore.current = score;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 500);
      return () => clearTimeout(t);
    }
  }, [score]);

  return (
    <header className="scorebar">
      <div className="scorebar-left">
        <button className="scorebar-logo" onClick={onHome} aria-label="Go to home">
          Trip<span>Bored</span>
        </button>
        <span className="scorebar-divider" aria-hidden="true" />
        <button className="game-name" onClick={onRename} disabled={!onRename}>
          {gameName}
          {onRename && <span className="edit-hint">edit</span>}
        </button>
        {status === "finalized" && <span className="final-badge">Final</span>}
      </div>
      <div className="scorebar-right">
        <button className={shareCopied ? "share-btn copied" : "share-btn"} onClick={onShare}>
          {shareCopied ? "✓ Copied!" : "⬆ Share"}
        </button>
        <div className={flash ? "lcd lcd-flash" : "lcd"}>
          <div className="lcd-digits">
            <Digits value={score} />
          </div>
          <div className="lcd-max">of {possible.toLocaleString()} possible</div>
        </div>
      </div>
    </header>
  );
}

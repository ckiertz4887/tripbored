type Props = {
  score: number;
  possible: number;
  gameName: string;
  status: "active" | "finalized";
  onRename?: () => void;
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

export function ScoreBar({ score, possible, gameName, status, onRename }: Props) {
  return (
    <header className="scorebar">
      <div className="scorebar-left">
        <button className="game-name" onClick={onRename} disabled={!onRename}>
          {gameName}
          {onRename && <span className="edit-hint">edit</span>}
        </button>
        {status === "finalized" && <span className="final-badge">Final</span>}
      </div>
      <div className="lcd">
        <div className="lcd-digits">
          <Digits value={score} />
        </div>
        <div className="lcd-max">of {possible.toLocaleString()} possible</div>
      </div>
    </header>
  );
}

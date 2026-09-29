import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  WWW_CATEGORIES,
  VOTE_THRESHOLD,
  getAnimal,
  computedAdvantage,
  type WwwAnimal,
  type WwwCategory,
  type WwwMatchup,
} from "../data/who-would-win";
import {
  loadSeen,
  markSeen,
  clearSeen,
  castVote,
  totalVotes,
  percentA,
  type MatchupVotes,
} from "../lib/whoWouldWin";
import { saveMinigameReturn, getGameUrl } from "../lib/minigameNav";

type Screen = "pick-category" | "matchup" | "result";

function StatBar({ label, value, name }: { label: string; value: number; name?: string | null }) {
  return (
    <div className="www-stat">
      <div className="www-stat-header">
        <span className="www-stat-label">{label}</span>
        {name && <span className="www-stat-name">"{name}"</span>}
        <span className="www-stat-value">{value}/10</span>
      </div>
      <div className="www-stat-track">
        <div className="www-stat-fill" style={{ width: `${value * 10}%` }} />
      </div>
    </div>
  );
}

function AnimalCard({
  animal,
  highlight,
  onPick,
  disabled,
}: {
  animal: WwwAnimal;
  highlight: "winner" | "loser" | null;
  onPick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      className={[
        "www-card",
        highlight === "winner" ? "www-card-winner" : "",
        highlight === "loser" ? "www-card-loser" : "",
        disabled ? "www-card-disabled" : "",
      ].filter(Boolean).join(" ")}
      onClick={onPick}
      disabled={disabled}
    >
      <div className="www-card-photo">
        {animal.photoUrl ? (
          <img src={animal.photoUrl} alt={animal.name} className="www-card-img" />
        ) : (
          <div className="www-card-photo-placeholder">{animal.name[0]}</div>
        )}
      </div>
      <div className="www-card-name">{animal.name}</div>
      <div className="www-card-stats">
        <StatBar label="ATK" value={animal.atk} name={animal.atkName} />
        <StatBar label="DEF" value={animal.def} name={animal.defName} />
        <StatBar label="SPD" value={animal.spd} />
        <StatBar label="SIZE" value={animal.size} />
      </div>
      <div className="www-card-superlatives">
        {animal.superlatives.map((s) => (
          <div key={s} className="www-card-superlative">★ {s}</div>
        ))}
      </div>
      {!disabled && (
        <div className="www-card-cta">Who Would Win?</div>
      )}
    </button>
  );
}

function VoteBar({ pctA, animalA, animalB, threshold, votes }: {
  pctA: number;
  animalA: WwwAnimal;
  animalB: WwwAnimal;
  threshold: boolean;
  votes: MatchupVotes;
}) {
  const pctB = 100 - pctA;
  return (
    <div className="www-vote-bar-wrap">
      <div className="www-vote-label-row">
        <span className="www-vote-name">{animalA.name}</span>
        <span className="www-vote-source">
          {threshold ? `${totalVotes(votes).toLocaleString()} votes` : "Computed advantage"}
        </span>
        <span className="www-vote-name">{animalB.name}</span>
      </div>
      <div className="www-vote-bar">
        <div className="www-vote-fill-a" style={{ width: `${pctA}%` }} />
        <div className="www-vote-fill-b" style={{ width: `${pctB}%` }} />
      </div>
      <div className="www-vote-pct-row">
        <span className="www-vote-pct">{pctA}%</span>
        <span className="www-vote-pct">{pctB}%</span>
      </div>
    </div>
  );
}

export function WhoWouldWin() {
  const nav = useNavigate();
  const gameUrl = useRef(getGameUrl());

  const [screen, setScreen] = useState<Screen>("pick-category");
  const [category, setCategory] = useState<WwwCategory | null>(null);
  const [queue, setQueue] = useState<WwwMatchup[]>([]);
  const [current, setCurrent] = useState<WwwMatchup | null>(null);
  const [picked, setPicked] = useState<"A" | "B" | null>(null);
  const [votes, setVotes] = useState<MatchupVotes>({ votesA: 0, votesB: 0 });
  const [loadingVotes, setLoadingVotes] = useState(false);

  useEffect(() => {
    document.title = "Who Would Win? · TripBored";
    return () => { document.title = "TripBored"; };
  }, []);

  function buildQueue(cat: WwwCategory): WwwMatchup[] {
    const seen = loadSeen(cat.id);
    const unseen = cat.matchups.filter((m) => !seen.has(m.id));
    return unseen.length > 0 ? [...unseen] : [...cat.matchups];
  }

  function startCategory(cat: WwwCategory) {
    const q = buildQueue(cat);
    setCategory(cat);
    setQueue(q.slice(1));
    setCurrent(q[0]);
    setPicked(null);
    setVotes({ votesA: 0, votesB: 0 });
    setScreen("matchup");
  }

  async function pick(side: "A" | "B") {
    if (!current || picked) return;
    setPicked(side);
    setLoadingVotes(true);
    markSeen(category!.id, current.id);
    const result = await castVote(current.id, side);
    setVotes(result);
    setLoadingVotes(false);
    setScreen("result");
  }

  function next() {
    if (!category) return;
    if (queue.length === 0) {
      // All matchups seen — rebuild from scratch after reset
      clearSeen(category.id);
      const fresh = [...category.matchups];
      setQueue(fresh.slice(1));
      setCurrent(fresh[0]);
    } else {
      setCurrent(queue[0]);
      setQueue(queue.slice(1));
    }
    setPicked(null);
    setVotes({ votesA: 0, votesB: 0 });
    setScreen("matchup");
  }

  function backToPick() {
    setScreen("pick-category");
    setCategory(null);
    setCurrent(null);
    setPicked(null);
  }

  // ── CATEGORY PICKER ────────────────────────────────────────────────────────
  if (screen === "pick-category") {
    return (
      <div className="www-page">
        <div className="cl-header">
          <button className="btn btn-secondary btn-sm" onClick={() => nav("/")}>Home</button>
          <h1 className="cl-title">Who Would Win?</h1>
          {gameUrl.current && (
            <div className="cl-header-right">
              <button className="btn btn-secondary btn-sm" onClick={() => {
                saveMinigameReturn("/who-would-win", "Who Would Win?");
                nav(gameUrl.current!);
              }}>Board</button>
            </div>
          )}
        </div>
        <p className="www-intro">
          Study the stats. Pick your winner. See how everyone else voted.
        </p>
        <div className="www-cat-grid">
          {WWW_CATEGORIES.map((cat) => {
            const seen = loadSeen(cat.id);
            const remaining = cat.matchups.filter((m) => !seen.has(m.id)).length;
            return (
              <button key={cat.id} className="www-cat-btn" onClick={() => startCategory(cat)}>
                <span className="www-cat-name">{cat.label}</span>
                <span className="www-cat-count">
                  {remaining === 0
                    ? `All ${cat.matchups.length} seen — tap to replay`
                    : `${remaining} of ${cat.matchups.length} matchups unseen`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (!current || !category) return null;

  const animalA = getAnimal(category, current.animalA)!;
  const animalB = getAnimal(category, current.animalB)!;
  const isThreshold = totalVotes(votes) >= VOTE_THRESHOLD;

  const computedPctA = (() => {
    const scoreA = computedAdvantage(animalA);
    const scoreB = computedAdvantage(animalB);
    return Math.round((scoreA / (scoreA + scoreB)) * 100);
  })();

  const displayPctA = screen === "result"
    ? (isThreshold ? percentA(votes) : computedPctA)
    : 50;

  const highlight = (side: "A" | "B") => {
    if (screen !== "result" || !picked) return null;
    if (displayPctA === 50) return null;
    const aWins = displayPctA > 50;
    const isWinner = (side === "A" && aWins) || (side === "B" && !aWins);
    return isWinner ? "winner" : "loser";
  };

  // ── MATCHUP ────────────────────────────────────────────────────────────────
  return (
    <div className="www-page">
      <div className="www-topbar">
        <button className="btn btn-secondary btn-sm" onClick={backToPick}>Categories</button>
        <span className="www-topbar-label">{category.label}</span>
        {gameUrl.current && (
          <button className="btn btn-secondary btn-sm" onClick={() => {
            saveMinigameReturn("/who-would-win", "Who Would Win?");
            nav(gameUrl.current!);
          }}>Board</button>
        )}
      </div>

      <div className="www-arena">
        <AnimalCard
          animal={animalA}
          highlight={highlight("A")}
          onPick={() => pick("A")}
          disabled={screen === "result"}
        />
        <div className="www-vs">VS</div>
        <AnimalCard
          animal={animalB}
          highlight={highlight("B")}
          onPick={() => pick("B")}
          disabled={screen === "result"}
        />
      </div>

      {screen === "result" && !loadingVotes && (
        <div className="www-result">
          <div className="www-result-picked">
            You picked: <strong>{picked === "A" ? animalA.name : animalB.name}</strong>
          </div>
          <VoteBar
            pctA={displayPctA}
            animalA={animalA}
            animalB={animalB}
            threshold={isThreshold}
            votes={votes}
          />
          <button className="btn btn-primary btn-lg www-next-btn" onClick={next}>
            Next Matchup →
          </button>
        </div>
      )}
      {screen === "result" && loadingVotes && (
        <div className="www-result">
          <div className="www-result-loading">Loading results…</div>
        </div>
      )}
    </div>
  );
}

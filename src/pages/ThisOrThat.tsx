import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TOT_CATEGORIES,
  MARATHON_ITEMS,
  TOT_TOTAL,
  COLOR_ITEM_HEX,
  type TotCategory,
} from "../data/this-or-that";
import { useAuth } from "../lib/auth";
import { saveMarathon, loadMarathon, clearMarathon, type SavedMarathon } from "../lib/tot";
import { saveMinigameReturn, getGameUrl, saveTotSession, loadTotSession, clearTotSession } from "../lib/minigameNav";

const HIDDEN_CATEGORIES = new Set(["soft-drinks", "movies"]);

const CATEGORY_COLORS: Record<string, string> = {
  "fruits":             "#e74c3c",
  "vegetables":         "#27ae60",
  "ice-cream":          "#8e24aa",
  "candy":              "#c2185b",
  "pizza-toppings":     "#d84315",
  "breakfast":          "#e65100",
  "desserts":           "#5d4037",
  "fast-food":          "#c62828",
  "soft-drinks":        "#00838f",
  "tv-shows-cartoons":  "#e64a19",
  "tv-shows":           "#1565c0",
  "disney-pixar":       "#4527a0",
  "movies":             "#37474f",
  "superheroes":        "#b71c1c",
  "video-games":        "#6a1b9a",
  "board-party-games":  "#4e342e",
  "music-genres":       "#ad1457",
  "sports":             "#1976d2",
  "dog-breeds":         "#795548",
  "wild-animals":       "#2e7d32",
  "vacation":           "#0277bd",
  "outdoor-activities": "#388e3c",
  "school-subjects":    "#283593",
  "holidays":           "#b71c1c",
  "colors":             "#7b1fa2",
  "careers":            "#455a64",
  "marathon":           "#0f2440",
};

function catColor(catId: string): string {
  return CATEGORY_COLORS[catId] ?? "#1b3a6b";
}

function itemBg(item: Item, catId: string, isMarathon: boolean): string {
  const effectiveCatId = isMarathon ? (item.catId ?? "marathon") : catId;
  if (effectiveCatId === "colors" && COLOR_ITEM_HEX[item.name]) {
    return COLOR_ITEM_HEX[item.name];
  }
  return catColor(effectiveCatId);
}

function textOnBg(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5 ? "#1b3a6b" : "#fff";
}

type Item = { name: string; cat?: string; catId?: string };

type Play = {
  catId: string;
  label: string;
  isMarathon: boolean;
  left: Item;
  right: Item;
  pendingMatchups: [Item, Item][];
  byeItems: Item[];
  roundWinners: Item[];
  roundNumber: number;
  roundLabel: string;
  isFinal: boolean;
  matchInRound: number;
  totalInRound: number;
  totalMatchups: number;
  matchupsPlayed: number;
};

function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildPairs(items: Item[]): { matchups: [Item, Item][]; byes: Item[] } {
  const arr = [...items];
  const byes: Item[] = arr.length % 2 === 1 ? [arr.pop()!] : [];
  const matchups: [Item, Item][] = [];
  for (let i = 0; i < arr.length; i += 2) matchups.push([arr[i], arr[i + 1]]);
  return { matchups, byes };
}

function getRoundLabel(roundNumber: number, itemsInRound: number): string {
  if (itemsInRound <= 2) return "FINAL";
  if (itemsInRound <= 4) return "Semifinals";
  if (itemsInRound <= 8) return "Quarterfinals";
  return `Round ${roundNumber}`;
}

function buildItems(cat: TotCategory | "marathon"): Item[] {
  if (cat === "marathon") {
    return MARATHON_ITEMS.map(({ name, cat: c, catId }) => ({ name, cat: c, catId }));
  }
  return (cat as TotCategory).items.map((name) => ({ name }));
}

function startTournament(cat: TotCategory | "marathon"): Play {
  const isMarathon = cat === "marathon";
  const catId = isMarathon ? "marathon" : (cat as TotCategory).id;
  const label = isMarathon ? "Marathon Mode" : (cat as TotCategory).label;
  const shuffled = shuffle(buildItems(cat));
  const { matchups, byes } = buildPairs(shuffled);
  const [left, right] = matchups[0];
  const roundLabel = getRoundLabel(1, shuffled.length);
  return {
    catId, label, isMarathon,
    left, right,
    pendingMatchups: matchups.slice(1),
    byeItems: byes,
    roundWinners: [],
    roundNumber: 1,
    roundLabel,
    isFinal: roundLabel === "FINAL",
    matchInRound: 1,
    totalInRound: matchups.length,
    totalMatchups: shuffled.length - 1,
    matchupsPlayed: 0,
  };
}

type TotSession = {
  play: Play;
  screen: "playing" | "round-complete" | "winner";
  roundCompleteInfo: { completedLabel: string; nextLabel: string; advancingCount: number } | null;
  winnerItem: Item | null;
};

export function ThisOrThat() {
  const nav = useNavigate();
  const { user } = useAuth();
  const gameUrl = useRef(getGameUrl());
  const [screen, setScreen] = useState<"pick" | "playing" | "round-complete" | "winner">("pick");
  const [selectedCat, setSelectedCat] = useState<TotCategory | "marathon" | null>(null);
  const [play, setPlay] = useState<Play | null>(null);
  const [history, setHistory] = useState<Play[]>([]);
  const [winnerItem, setWinnerItem] = useState<Item | null>(null);
  const [roundCompleteInfo, setRoundCompleteInfo] = useState<{
    completedLabel: string;
    nextLabel: string;
    advancingCount: number;
  } | null>(null);
  const [savedMarathon, setSavedMarathon] = useState<SavedMarathon | null>(null);

  useEffect(() => {
    document.title = "This or That? · TripBored";
    return () => { document.title = "TripBored"; };
  }, []);

  useEffect(() => {
    const saved = loadTotSession() as TotSession | null;
    if (saved?.play) {
      clearTotSession();
      const cat = saved.play.isMarathon
        ? "marathon"
        : (TOT_CATEGORIES.find((c) => c.id === saved.play.catId) ?? null);
      setSelectedCat(cat);
      setPlay(saved.play);
      setScreen(saved.screen);
      setRoundCompleteInfo(saved.roundCompleteInfo);
      setWinnerItem(saved.winnerItem);
    }
  }, []);

  useEffect(() => {
    if (!user?.uid) { setSavedMarathon(null); return; }
    loadMarathon(user.uid).then((saved) => {
      if (saved?.mode === "koth") {
        void clearMarathon(user.uid);
        return;
      }
      setSavedMarathon(saved);
    }).catch(() => {});
  }, [user?.uid]);

  function goToBoard() {
    if (play && !play.isMarathon && screen !== "pick") {
      saveTotSession({ play, screen, roundCompleteInfo, winnerItem } satisfies TotSession);
    }
    saveMinigameReturn("/this-or-that", "This or That?");
    nav(gameUrl.current ?? "/");
  }

  function begin(cat: TotCategory | "marathon") {
    setSelectedCat(cat);
    setPlay(startTournament(cat));
    setHistory([]);
    setWinnerItem(null);
    setRoundCompleteInfo(null);
    setScreen("playing");
  }

  function resumeMarathon() {
    if (!savedMarathon) return;
    setSelectedCat("marathon");
    setPlay(savedMarathon.play as unknown as Play);
    setHistory([]);
    setWinnerItem(null);
    setRoundCompleteInfo(savedMarathon.roundCompleteInfo);
    setScreen(savedMarathon.screen);
    setSavedMarathon(null);
  }

  function restart() {
    if (!selectedCat || !play) return;
    if (play.isMarathon && user?.uid) void clearMarathon(user.uid);
    begin(selectedCat);
  }

  function pick(side: "left" | "right") {
    if (!play) return;
    setHistory((h) => [...h, play]);

    const winner = side === "left" ? play.left : play.right;
    const newMatchupsPlayed = play.matchupsPlayed + 1;

    // ── Tournament ────────────────────────────────────────────────────────
    const newWinners = [...play.roundWinners, winner];

    if (play.pendingMatchups.length > 0) {
      const [left, right] = play.pendingMatchups[0];
      const newPlay: Play = {
        ...play,
        left, right,
        pendingMatchups: play.pendingMatchups.slice(1),
        roundWinners: newWinners,
        matchInRound: play.matchInRound + 1,
        matchupsPlayed: newMatchupsPlayed,
      };
      if (play.isMarathon && user?.uid) {
        void saveMarathon(user.uid, { mode: "tournament", screen: "playing", play: newPlay, roundCompleteInfo: null });
      }
      setPlay(newPlay);
      return;
    }

    // Round complete
    const advancing = shuffle([...newWinners, ...play.byeItems]);

    if (advancing.length <= 1) {
      if (play.isMarathon && user?.uid) void clearMarathon(user.uid);
      setWinnerItem(advancing[0] ?? winner);
      setScreen("winner");
      return;
    }

    const { matchups, byes } = buildPairs(advancing);

    if (matchups.length === 0) {
      if (play.isMarathon && user?.uid) void clearMarathon(user.uid);
      setWinnerItem(advancing[0]);
      setScreen("winner");
      return;
    }

    const [left, right] = matchups[0];
    const nextRoundNumber = play.roundNumber + 1;
    const roundLabel = getRoundLabel(nextRoundNumber, advancing.length);
    const info = {
      completedLabel: play.roundLabel,
      nextLabel: roundLabel,
      advancingCount: advancing.length,
    };
    const nextPlay: Play = {
      ...play,
      left, right,
      pendingMatchups: matchups.slice(1) as [Item, Item][],
      byeItems: byes,
      roundWinners: [],
      roundNumber: nextRoundNumber,
      roundLabel,
      isFinal: roundLabel === "FINAL",
      matchInRound: 1,
      totalInRound: matchups.length,
      matchupsPlayed: newMatchupsPlayed,
    };
    if (play.isMarathon && user?.uid) {
      void saveMarathon(user.uid, { mode: "tournament", screen: "round-complete", play: nextPlay, roundCompleteInfo: info });
    }
    setRoundCompleteInfo(info);
    setPlay(nextPlay);
    setScreen("round-complete");
  }

  function undo() {
    const prev = history[history.length - 1];
    if (!prev) return;
    if (prev.isMarathon && user?.uid) {
      void saveMarathon(user.uid, { mode: "tournament", screen: "playing", play: prev, roundCompleteInfo: null });
    }
    setPlay(prev);
    setHistory((h) => h.slice(0, -1));
    setWinnerItem(null);
    setRoundCompleteInfo(null);
    setScreen("playing");
  }

  function backToPick() {
    setScreen("pick");
    setPlay(null);
    setHistory([]);
    setWinnerItem(null);
    setRoundCompleteInfo(null);
  }

  const pct = play ? Math.round((play.matchupsPlayed / play.totalMatchups) * 100) : 0;

  // ── WINNER ────────────────────────────────────────────────────────────────
  if (screen === "winner" && winnerItem && play) {
    const color = COLOR_ITEM_HEX[winnerItem.name]
      ?? (play.isMarathon ? catColor(winnerItem.catId ?? "marathon") : catColor(play.catId));
    return (
      <div className="tot-page">
        <div className="tot-topbar">
          <button className="btn btn-secondary btn-sm" onClick={backToPick}>Categories</button>
          <span className="tot-topbar-label">{play.label}</span>
          <div className="tot-topbar-actions">
            {gameUrl.current && (
              <button className="tot-action-btn" onClick={goToBoard}>Board</button>
            )}
            <button className="tot-undo-btn" onClick={undo}>Undo</button>
          </div>
        </div>
        <div className="tot-winner">
          <div className="tot-winner-badge">CHAMPION</div>
          {winnerItem.cat && (
            <div className="tot-winner-subcat">{winnerItem.cat}</div>
          )}
          <div className="tot-winner-name" style={{ color }}>
            {winnerItem.name}
          </div>
          <div className="tot-winner-blurb">
            won all {play.totalMatchups} matchups
          </div>
          <div className="tot-winner-btns">
            <button className="btn btn-primary btn-md btn-block" onClick={backToPick}>
              Pick a New Category
            </button>
            <button
              className="btn btn-secondary btn-md btn-block"
              onClick={() => selectedCat && begin(selectedCat)}
            >
              ↻ Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── ROUND COMPLETE ────────────────────────────────────────────────────────
  if (screen === "round-complete" && roundCompleteInfo && play) {
    const isFinalNext = roundCompleteInfo.nextLabel === "FINAL";
    return (
      <div className="tot-page">
        <div className="tot-topbar">
          <button className="btn btn-secondary btn-sm" onClick={backToPick}>Categories</button>
          <span className="tot-topbar-label">{play.label}</span>
          <div className="tot-topbar-actions">
            <button className="tot-action-btn" onClick={restart} title="Restart">↺</button>
            <button className="tot-action-btn" onClick={undo} disabled={history.length === 0}>Undo</button>
            {gameUrl.current && (
              <button className="tot-action-btn" onClick={goToBoard}>Board</button>
            )}
          </div>
        </div>
        <div className="tot-rc">
          <div className="tot-rc-check">✓</div>
          <div className="tot-rc-completed">{roundCompleteInfo.completedLabel} complete</div>
          <div className="tot-rc-advancing">
            {roundCompleteInfo.advancingCount} items moving on
          </div>
          <div className={isFinalNext ? "tot-rc-next tot-rc-next-final" : "tot-rc-next"}>
            {isFinalNext ? "🏆 THE FINAL" : `Up next: ${roundCompleteInfo.nextLabel}`}
          </div>
          <button
            className={isFinalNext ? "btn btn-yellow btn-lg tot-rc-btn" : "btn btn-navy btn-lg tot-rc-btn"}
            onClick={() => setScreen("playing")}
          >
            {isFinalNext ? "Start the Final!" : `Start ${roundCompleteInfo.nextLabel}`}
          </button>
        </div>
      </div>
    );
  }

  // ── PLAYING ───────────────────────────────────────────────────────────────
  if (screen === "playing" && play) {
    const leftBg = itemBg(play.left, play.catId, play.isMarathon);
    const rightBg = itemBg(play.right, play.catId, play.isMarathon);
    const leftText = textOnBg(leftBg);
    const rightText = textOnBg(rightBg);

    return (
      <div className="tot-page">
        <div className="tot-topbar">
          <button className="btn btn-secondary btn-sm" onClick={backToPick}>Categories</button>
          <span className="tot-topbar-label">{play.label}</span>
          <div className="tot-topbar-actions">
            <button className="tot-action-btn" onClick={restart} title="Restart">↺</button>
            <button
              className="tot-action-btn"
              onClick={undo}
              disabled={history.length === 0}
            >
              Undo
            </button>
            {gameUrl.current && (
              <button className="tot-action-btn" onClick={goToBoard}>Board</button>
            )}
          </div>
        </div>
        <div className="tot-progress-bar">
          <div className="tot-progress-fill" style={{ width: `${pct}%` }} />
        </div>

        <div className={play.isFinal ? "tot-round-hdr tot-round-hdr-final" : "tot-round-hdr"}>
          <span className="tot-round-name">{play.roundLabel}</span>
          {!play.isFinal && (
            <span className="tot-round-match">
              Match {play.matchInRound} of {play.totalInRound}
            </span>
          )}
        </div>

        <div className="tot-arena">
          <button
            className="tot-option"
            style={{ backgroundColor: leftBg, color: leftText }}
            onClick={() => pick("left")}
          >
            {play.isMarathon && play.left.cat && (
              <span className="tot-option-subcat" style={{ color: leftText === "#fff" ? "rgba(255,255,255,0.7)" : "rgba(27,58,107,0.6)" }}>{play.left.cat}</span>
            )}
            <span className="tot-option-name">{play.left.name}</span>
          </button>
          <div className="tot-vs">VS</div>
          <button
            className="tot-option"
            style={{ backgroundColor: rightBg, color: rightText }}
            onClick={() => pick("right")}
          >
            {play.isMarathon && play.right.cat && (
              <span className="tot-option-subcat" style={{ color: rightText === "#fff" ? "rgba(255,255,255,0.7)" : "rgba(27,58,107,0.6)" }}>{play.right.cat}</span>
            )}
            <span className="tot-option-name">{play.right.name}</span>
          </button>
        </div>
      </div>
    );
  }

  // ── CATEGORY PICKER ───────────────────────────────────────────────────────
  const marathonPct = savedMarathon
    ? Math.round((savedMarathon.play.matchupsPlayed / savedMarathon.play.totalMatchups) * 100)
    : 0;
  const marathonLeft = savedMarathon
    ? savedMarathon.play.totalMatchups - savedMarathon.play.matchupsPlayed
    : 0;

  return (
    <div className="tot-page">
      <div className="cl-header">
        <button className="btn btn-secondary btn-sm" onClick={() => nav("/")}>Home</button>
        <h1 className="cl-title">This or That?</h1>
        {gameUrl.current && (
          <div className="cl-header-right">
            <button className="btn btn-secondary btn-sm" onClick={() => {
              saveMinigameReturn("/this-or-that", "This or That?");
              nav(gameUrl.current!);
            }}>Board</button>
          </div>
        )}
      </div>

      <p className="tot-intro">
        Items face off head-to-head. Winners advance through the rounds — Quarterfinals, Semifinals, Final — until one champion remains.
      </p>

      {savedMarathon ? (
        <div className="tot-marathon-resume">
          <button className="tot-marathon" onClick={resumeMarathon}>
            <span className="tot-marathon-name">Continue Marathon</span>
            <span className="tot-marathon-desc">
              {marathonPct}% complete · {marathonLeft.toLocaleString()} matchups left
            </span>
          </button>
          <button
            className="tot-marathon-fresh"
            onClick={() => {
              if (user?.uid) void clearMarathon(user.uid);
              setSavedMarathon(null);
              begin("marathon");
            }}
          >
            Start Marathon Fresh instead →
          </button>
        </div>
      ) : (
        <button className="tot-marathon" onClick={() => begin("marathon")}>
          <span className="tot-marathon-name">Marathon Mode</span>
          <span className="tot-marathon-desc">
            All {TOT_TOTAL} items from every category in one giant bracket
          </span>
          <span className="tot-marathon-warn">
            Very long game &middot; {TOT_TOTAL - 1} matchups
          </span>
        </button>
      )}

      <p className="tot-bye-note">
        Categories with an odd item count give one item a bye (automatic first-round pass).
      </p>

      <div className="tot-grid">
        {TOT_CATEGORIES.filter((cat) => !HIDDEN_CATEGORIES.has(cat.id)).map((cat) => (
          <button
            key={cat.id}
            className="tot-cat"
            style={{ backgroundColor: catColor(cat.id) }}
            onClick={() => begin(cat)}
          >
            <span className="tot-cat-name">
              {cat.label}
              {cat.audience === "adult" && <span className="tot-cat-adult">Adults</span>}
            </span>
            <span className="tot-cat-count">{cat.items.length} items</span>
          </button>
        ))}
      </div>
    </div>
  );
}

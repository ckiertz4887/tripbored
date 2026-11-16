import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../lib/auth";
import { createGame, useMyGames } from "../lib/game";
import { ConfirmDialog } from "../components/Dialog";

const ROAD_CARS = [
  { emoji: "🚗",  left: "0%"  },
  { emoji: "🚙",  left: "7%"  },
  { emoji: "🚕",  left: "19%" },
  { emoji: "🚛",  left: "27%" },
  { emoji: "🏎️", left: "31%" },
  { emoji: "🚐",  left: "48%" },
  { emoji: "🚗",  left: "58%" },
  { emoji: "🚙",  left: "67%" },
  { emoji: "🚕",  left: "79%" },
  { emoji: "🚛",  left: "85%" },
  { emoji: "🏎️", left: "93%" },
];

const MINI_GAMES = [
  {
    name: "Name It A–Z",
    desc: "Race to name something for every letter. 20+ categories.",
    stripe: "#1565c0",
    play: "#60a5fa",
    path: "/name-it",
    icon: "🔤",
  },
  {
    name: "This or That?",
    desc: "Head-to-head until one champion stands. 25+ categories.",
    stripe: "#2e7d32",
    play: "#4ade80",
    path: "/this-or-that",
    icon: "⚔️",
  },
  {
    name: "Line Up",
    desc: "Put things in the right order. Presidents, planets, and more.",
    stripe: "#1565c0",
    play: "#60a5fa",
    path: "/line-up",
    icon: "📋",
  },
  {
    name: "Would You Rather",
    desc: "Pick one. No right answer. 500 questions.",
    stripe: "#c05010",
    play: "#fb923c",
    path: "/would-you-rather",
    icon: "🤔",
  },
  {
    name: "Who Would Win?",
    desc: "Study the stats. Pick a winner. See how the world voted.",
    stripe: "#5b1a8a",
    play: "#c084fc",
    path: "/who-would-win",
    icon: "🏆",
  },
  {
    name: "Magic 8 Ball",
    desc: "Ask anything. Shake for an answer. 60 responses.",
    stripe: "#0f6b6b",
    play: "#22d3ee",
    path: "/magic-8",
    icon: "🎱",
  },
];

export function Home() {
  const nav = useNavigate();
  const { user, isGuest, signInWithGoogle, signOut } = useAuth();
  const { games } = useMyGames(user?.uid);
  const [starting, setStarting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [pendingStart, setPendingStart] = useState(false);

  const active = games.filter((g) => g.status === "active");

  async function handleSignIn() {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch {
      setAuthError("Sign-in failed. Make sure pop-ups are allowed and try again.");
    }
  }

  async function startGame() {
    if (!user || starting) return;
    if (active.length > 0) {
      setPendingStart(true);
      return;
    }
    await doStartGame();
  }

  async function doStartGame() {
    setPendingStart(false);
    setStarting(true);
    try {
      const id = await createGame(
        user!.uid,
        user!.displayName ?? "Player",
        user!.photoURL ?? null
      );
      nav(`/game/${id}`);
    } finally {
      setStarting(false);
    }
  }

  const activeWarningMsg =
    active.length === 1
      ? `"${active[0].name}" is still in progress. Start a new trip anyway?`
      : `You have ${active.length} trips in progress (including "${active[0]?.name}"). Start a new trip anyway?`;

  return (
    <div className="home">
      {authError && <div className="auth-error-banner">{authError}</div>}

      <div className="hero">
        <div className="hero-top">
          {isGuest ? (
            <>
              <button className="btn-signup" onClick={() => void handleSignIn()}>
                Sign Up
              </button>
              <button className="btn-login" onClick={() => void handleSignIn()}>
                Log in
              </button>
            </>
          ) : (
            <>
              <button className="btn-login" onClick={() => nav("/profile")}>
                {user?.displayName?.split(" ")[0] ?? "Profile"}
              </button>
              <button className="btn-login" onClick={() => void signOut()}>
                Sign out
              </button>
            </>
          )}
        </div>
        <img src="/wordmark-navy.png" alt="TripBored" className="hero-logo" />
      </div>

      <div className="road-divider">
        <div className="road-cars">
          {ROAD_CARS.map((car, i) => (
            <span key={i} className="road-car" style={{ left: car.left }}>
              {car.emoji}
            </span>
          ))}
        </div>
      </div>

      <div className="home-body">
        <div className="main-cta">
          <div className="main-cta-info">
            <span className="spot-label">Spotting Game</span>
            <span className="spot-title">425 Cards. 19 Categories.</span>
            <span className="spot-desc">
              Tap license plates, vehicles, wildlife, roadside landmarks, and
              family moments. Rack up points with the whole car.
            </span>
          </div>
          <div className="main-cta-right">
            <button
              className="main-cta-btn"
              onClick={() => void startGame()}
              disabled={starting}
            >
              <span className="main-cta-label">
                {starting ? "Starting…" : "Start"}
              </span>
              <span className="main-cta-arrow">▶</span>
            </button>
          </div>
        </div>

        {active.length > 0 && (
          <div className="resume-section">
            <div className="resume-eyebrow">Pick up where you left off</div>
            {active.slice(0, 4).map((g) => (
              <button
                key={g.id}
                className="resume-row-new"
                onClick={() => nav(`/game/${g.id}`)}
              >
                <span className="resume-name-new">{g.name}</span>
                <span className="resume-go-new">Resume →</span>
              </button>
            ))}
          </div>
        )}

        <div className="games-section">
          <div className="games-section-label">— Mini-Games —</div>
          <div className="games-grid">
            {MINI_GAMES.map((g) => (
              <button
                key={g.path}
                className="game-tile"
                onClick={() => nav(g.path)}
              >
                <div
                  className="game-tile-stripe"
                  style={{ background: g.stripe }}
                />
                <div className="game-tile-inner">
                  <span className="game-tile-icon">{g.icon}</span>
                  <span className="game-tile-name">{g.name}</span>
                  <span className="game-tile-desc">{g.desc}</span>
                </div>
                <span className="game-tile-play" style={{ color: g.play }}>
                  Play →
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {pendingStart && (
        <ConfirmDialog
          title="Start a new trip?"
          message={activeWarningMsg}
          confirmLabel="Start new trip"
          cancelLabel="Go back"
          onConfirm={() => void doStartGame()}
          onCancel={() => setPendingStart(false)}
        />
      )}
    </div>
  );
}

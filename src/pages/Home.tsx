import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../lib/auth";
import { createGame, useMyGames } from "../lib/game";
import { ConfirmDialog } from "../components/Dialog";
import { CATEGORIES as NAME_IT_CATEGORIES } from "./CategoryLetter";

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
      nav(`/game/${id}?new=1`);
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
      {authError && (
        <div className="auth-error-banner">{authError}</div>
      )}

      <div className="home-panel">
        <div className="home-panel-top">
          <div className="home-eyebrow">Est. somewhere on I-95</div>
          <div className="home-auth-bar">
            {isGuest ? (
              <>
                <button className="btn btn-primary btn-xs" onClick={() => void handleSignIn()}>
                  Sign up
                </button>
                <button className="link-btn auth-login-btn" onClick={() => void handleSignIn()}>
                  Log in
                </button>
              </>
            ) : (
              <>
                <button className="link-btn" onClick={() => nav("/profile")}>
                  {user?.displayName?.split(" ")[0] ?? "Profile"}
                </button>
                <button className="link-btn auth-login-btn" onClick={() => void signOut()}>
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
        <img src="/wordmark.png" alt="TripBored" className="home-wordmark" />
        <h2 className="home-sub">
          Tap what you see out the window. Rack up points. Argue about who saw it first.
        </h2>

        <button className="btn btn-primary btn-lg btn-block" onClick={() => void startGame()} disabled={starting}>
          {starting ? "Starting..." : "Start a trip"}
        </button>

        <div className="home-cards">
          <button className="home-card" onClick={() => nav("/name-it")}>
            <div className="home-card-accent" style={{ background: "#1565c0" }} />
            <div className="home-card-body">
              <span className="home-card-name">Name It (A–Z)</span>
              <span className="home-card-desc">Race to name something for every letter of the alphabet. {NAME_IT_CATEGORIES.length} categories.</span>
              <span className="home-card-action">Play →</span>
            </div>
          </button>
          <button className="home-card" onClick={() => nav("/this-or-that")}>
            <div className="home-card-accent" style={{ background: "#2e7d32" }} />
            <div className="home-card-body">
              <span className="home-card-name">This or That?</span>
              <span className="home-card-desc">Tournament-style head-to-head matchups until one champion stands. 25+ categories.</span>
              <span className="home-card-action">Play →</span>
            </div>
          </button>
          <button className="home-card" onClick={() => nav("/line-up")}>
            <div className="home-card-accent" style={{ background: "#1565c0" }} />
            <div className="home-card-body">
              <span className="home-card-name">Line Up</span>
              <span className="home-card-desc">Drag things into the right order. Presidents, planets, movies, albums — 8 categories.</span>
              <span className="home-card-action">Play →</span>
            </div>
          </button>
          <button className="home-card" onClick={() => nav("/would-you-rather")}>
            <div className="home-card-accent" style={{ background: "#e65100" }} />
            <div className="home-card-body">
              <span className="home-card-name">Would You Rather</span>
              <span className="home-card-desc">Pick one — there's no right answer. 500 questions to spark a debate.</span>
              <span className="home-card-action">Play →</span>
            </div>
          </button>
          <button className="home-card" onClick={() => nav("/who-would-win")}>
            <div className="home-card-accent" style={{ background: "#7b1fa2" }} />
            <div className="home-card-body">
              <span className="home-card-name">Who Would Win?</span>
              <span className="home-card-desc">Study the stats. Pick your winner. See how everyone else voted.</span>
              <span className="home-card-action">Play →</span>
            </div>
          </button>
          <button className="home-card" onClick={() => nav("/magic-8")}>
            <div className="home-card-accent" style={{ background: "#4a148c" }} />
            <div className="home-card-body">
              <span className="home-card-name">Magic 8 Ball</span>
              <span className="home-card-desc">Ask it anything. Shake for an answer. 60 responses, zero guarantees.</span>
              <span className="home-card-action">Play →</span>
            </div>
          </button>
          <div className="home-card home-card-soon">
            <div className="home-card-accent" />
            <div className="home-card-body">
              <span className="home-card-name">ETA Guesser</span>
              <span className="home-card-desc">Guess when you'll arrive. Closest guess wins bragging rights.</span>
              <span className="home-card-soon-label">Coming Soon</span>
            </div>
          </div>
          <div className="home-card home-card-soon">
            <div className="home-card-accent" />
            <div className="home-card-body">
              <span className="home-card-name">Spell Your Name</span>
              <span className="home-card-desc">Find signs or license plates that contain the letters of your name.</span>
              <span className="home-card-soon-label">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>

      {active.length > 0 && (
        <div className="home-panel resume-panel">
          <div className="panel-eyebrow">Pick up where you left off</div>
          {active.slice(0, 4).map((g) => (
            <button key={g.id} className="resume-row" onClick={() => nav(`/game/${g.id}`)}>
              <span className="resume-name">{g.name}</span>
              <span className="resume-go">Resume</span>
            </button>
          ))}
        </div>
      )}

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

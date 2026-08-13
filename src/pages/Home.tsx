import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../lib/auth";
import { createGame, useMyGames } from "../lib/game";
import { TOTAL_CARDS, TOTAL_POSSIBLE } from "../data/cards";

export function Home() {
  const nav = useNavigate();
  const { user, isGuest, signInWithGoogle } = useAuth();
  const { games } = useMyGames(user?.uid);
  const [starting, setStarting] = useState(false);

  const active = games.filter((g) => g.status === "active");

  async function startGame() {
    if (!user || starting) return;
    setStarting(true);
    try {
      const id = await createGame(
        user.uid,
        user.displayName ?? "Player",
        user.photoURL ?? null
      );
      nav(`/game/${id}`);
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="home">
      <div className="home-panel">
        <div className="home-eyebrow">Est. somewhere on I-95</div>
        <h1 className="home-title">
          Trip
          <span className="home-title-2">Bored</span>
        </h1>
        <h2 className="home-sub">
          {TOTAL_CARDS} things to spot out the window. Tap what you see, rack up
          points, argue about who saw it first.
        </h2>

        <button className="big-btn" onClick={startGame} disabled={starting}>
          {starting ? "Starting..." : "Start a trip"}
        </button>

        <div className="home-stats">
          <span>
            <strong>{TOTAL_CARDS}</strong> cards
          </span>
          <span>
            <strong>{TOTAL_POSSIBLE.toLocaleString()}</strong> points on the board
          </span>
          <span>
            <strong>18</strong> categories
          </span>
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

      <div className="home-footer">
        {isGuest ? (
          <button className="link-btn" onClick={() => void signInWithGoogle()}>
            Sign in with Google to save your trips
          </button>
        ) : (
          <button className="link-btn" onClick={() => nav("/profile")}>
            Your trips and stats
          </button>
        )}
      </div>
    </div>
  );
}

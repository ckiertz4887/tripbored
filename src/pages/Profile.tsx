import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useMyGames } from "../lib/game";

export function Profile() {
  const nav = useNavigate();
  const { user, isGuest, signInWithGoogle, signOut } = useAuth();
  const { games, loading } = useMyGames(user?.uid);

  const finalized = games.filter((g) => g.status === "finalized");
  const lifetime = finalized.reduce((sum, g) => sum + (g.finalScore ?? 0), 0);
  const best = finalized.reduce((max, g) => Math.max(max, g.finalScore ?? 0), 0);

  return (
    <div className="profile">
      <div className="toolbar">
        <button className="tool-btn" onClick={() => nav("/")}>Home</button>
        {!isGuest && (
          <button className="tool-btn" onClick={() => void signOut()}>Sign out</button>
        )}
      </div>

      <div className="home-panel">
        <div className="panel-eyebrow">Player</div>
        <div className="profile-head">
          {user?.photoURL && <img className="avatar" src={user.photoURL} alt="" />}
          <div>
            <div className="profile-name">{user?.displayName ?? "Guest player"}</div>
            {isGuest && <div className="profile-note">Playing as a guest</div>}
          </div>
        </div>

        {isGuest && (
          <button className="big-btn" onClick={() => void signInWithGoogle()}>
            Sign in with Google
          </button>
        )}
      </div>

      <div className="home-panel">
        <div className="panel-eyebrow">Lifetime</div>
        <div className="stat-grid">
          <div className="stat">
            <div className="stat-num">{lifetime.toLocaleString()}</div>
            <div className="stat-label">Total points</div>
          </div>
          <div className="stat">
            <div className="stat-num">{finalized.length}</div>
            <div className="stat-label">Trips finished</div>
          </div>
          <div className="stat">
            <div className="stat-num">{best.toLocaleString()}</div>
            <div className="stat-label">Best trip</div>
          </div>
        </div>
      </div>

      <div className="home-panel">
        <div className="panel-eyebrow">All trips</div>
        {loading && <div className="profile-note">Loading...</div>}
        {!loading && games.length === 0 && (
          <div className="profile-note">No trips yet. Start one from the home screen.</div>
        )}
        {games.map((g) => (
          <button key={g.id} className="resume-row" onClick={() => nav(`/game/${g.id}`)}>
            <span className="resume-name">
              {g.name}
              {g.status === "finalized" && <span className="final-badge sm">Final</span>}
            </span>
            <span className="resume-go">
              {g.status === "finalized" ? `${(g.finalScore ?? 0).toLocaleString()} pts` : "Resume"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

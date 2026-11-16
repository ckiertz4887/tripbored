import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useMyGames } from "../lib/game";
import { useSettings } from "../lib/settings";

export function Profile() {
  const nav = useNavigate();
  const { user, isGuest, signInWithGoogle, signOut } = useAuth();
  const { games, loading } = useMyGames(user?.uid);
  const { settings, set } = useSettings();

  const finalized = games.filter((g) => g.status === "finalized");
  const lifetime = finalized.reduce((sum, g) => sum + (g.finalScore ?? 0), 0);
  const best = finalized.reduce((max, g) => Math.max(max, g.finalScore ?? 0), 0);

  return (
    <div className="profile">
      <div className="toolbar">
        <button className="btn-tool" onClick={() => nav("/")}>Home</button>
      </div>

      <div className="home-panel">
        <div className="panel-eyebrow">Player</div>
        <div className="profile-head">
          {user?.photoURL && <img className="avatar" src={user.photoURL} alt="" />}
          <div>
            <div className="profile-name">{user?.displayName ?? "Guest player"}</div>
            {isGuest && <div className="profile-note">Playing as a guest — sign in to save progress across devices.</div>}
          </div>
        </div>

        {isGuest && (
          <button className="btn btn-primary btn-lg btn-block" onClick={() => void signInWithGoogle()}>
            Sign in with Google
          </button>
        )}
        {!isGuest && (
          <button className="setting-signout-btn" onClick={() => void signOut()}>
            Sign out
          </button>
        )}
      </div>

      {!isGuest && (
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
      )}

      <div className="home-panel">
        <div className="panel-eyebrow">Settings</div>

        <div className="setting-row">
          <div className="setting-text">
            <div className="setting-label">Dark mode</div>
            <div className="setting-desc">Easy on the eyes at night</div>
          </div>
          <button
            className={settings.darkMode ? "setting-toggle on" : "setting-toggle"}
            onClick={() => set({ darkMode: !settings.darkMode })}
            aria-pressed={settings.darkMode}
          >
            <span className="toggle-knob" />
          </button>
        </div>

        <div className="setting-row">
          <div className="setting-text">
            <div className="setting-label">Smart Scoring prompt</div>
            <div className="setting-desc">Auto-open route picker when starting a new trip</div>
          </div>
          <button
            className={settings.askRoute ? "setting-toggle on" : "setting-toggle"}
            onClick={() => set({ askRoute: !settings.askRoute })}
            aria-pressed={settings.askRoute}
          >
            <span className="toggle-knob" />
          </button>
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

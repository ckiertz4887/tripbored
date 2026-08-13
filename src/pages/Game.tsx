import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../lib/auth";
import {
  finalizeGame,
  joinGame,
  renameGame,
  useCardActions,
  useGame,
} from "../lib/game";
import { TOTAL_CARDS, VISIBLE_CATEGORIES } from "../data/cards";
import { CardTile } from "../components/CardTile";
import { ScoreBar } from "../components/ScoreBar";
import { JumpNav } from "../components/JumpNav";
import { SearchBar } from "../components/SearchBar";

export function Game() {
  const { gameId } = useParams<{ gameId: string }>();
  const nav = useNavigate();
  const { user } = useAuth();
  const { game, finds, score, byPlayer, loading, missing, possible } = useGame(gameId);
  const playerName = user?.displayName ?? "Player";
  const { toggle, undoLast } = useCardActions(gameId, user?.uid, playerName);

  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [locked, setLocked] = useState(false);
  const [copied, setCopied] = useState(false);

  const isOwner = !!user && game?.ownerUid === user.uid;
  const isFinalized = game?.status === "finalized";
  const boardLocked = locked || isFinalized;

  // Anyone who opens a shared link becomes a member, so their taps carry their
  // name and the game shows up in their history.
  useEffect(() => {
    if (!game || !user || !gameId) return;
    if (!game.memberIds?.includes(user.uid)) {
      void joinGame(gameId, user.uid, playerName, user.photoURL ?? null);
    }
  }, [game, user, gameId, playerName]);

  const term = search.trim().toLowerCase();

  const visible = useMemo(() => {
    return VISIBLE_CATEGORIES.map((cat) => {
      const groups = cat.groups
        .map((g) => ({
          ...g,
          cards: term ? g.cards.filter((c) => c.name.toLowerCase().includes(term)) : g.cards,
        }))
        .filter((g) => g.cards.length > 0);
      return { ...cat, groups };
    }).filter((c) => c.groups.length > 0);
  }, [term]);

  const matchCount = useMemo(
    () => visible.reduce((n, c) => n + c.groups.reduce((m, g) => m + g.cards.length, 0), 0),
    [visible]
  );

  const completed = useMemo(() => {
    const done = new Set<string>();
    for (const cat of VISIBLE_CATEGORIES) {
      const all = cat.groups.flatMap((g) => g.cards);
      if (all.length && all.every((c) => finds[c.id])) done.add(cat.id);
    }
    return done;
  }, [finds]);

  const openCount = VISIBLE_CATEGORIES.filter((c) => !collapsed[c.id]).length;

  function jump(id: string) {
    setCollapsed((prev) => ({ ...prev, [id]: false }));
    requestAnimationFrame(() => {
      const el = document.getElementById(`sec-${id}`);
      if (el) window.scrollTo({ top: el.offsetTop - 8, behavior: "smooth" });
    });
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: game?.name ?? "TripBored", url });
        return;
      } catch {
        /* user dismissed the sheet */
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function rename() {
    if (!gameId) return;
    const next = window.prompt("Name this trip", game?.name ?? "");
    if (next !== null) await renameGame(gameId, next);
  }

  async function finalize() {
    if (!gameId) return;
    if (!window.confirm(`Finalize "${game?.name}"? The board locks and the score is saved.`)) return;
    await finalizeGame(gameId, score);
  }

  if (loading) return <div className="loading">Loading trip...</div>;
  if (missing)
    return (
      <div className="empty-state">
        <h2>That trip isn't here</h2>
        <p>The link may be wrong, or the trip was deleted.</p>
        <button className="big-btn" onClick={() => nav("/")}>
          Back to start
        </button>
      </div>
    );
  if (!game) return null;

  const players = Object.entries(byPlayer);

  return (
    <div className="game">
      <ScoreBar
        score={score}
        possible={possible}
        gameName={game.name}
        status={game.status}
        onRename={isOwner && !isFinalized ? rename : undefined}
      />

      <div className="toolbar">
        <button className="tool-btn" onClick={share}>
          {copied ? "Link copied" : "Share"}
        </button>
        <button className="tool-btn" onClick={() => void undoLast()} disabled={boardLocked}>
          Undo
        </button>
        <button
          className={locked ? "tool-btn on" : "tool-btn"}
          onClick={() => setLocked((v) => !v)}
          disabled={isFinalized}
        >
          {locked ? "Unlock" : "Lock"}
        </button>
        {isOwner && !isFinalized && (
          <button className="tool-btn" onClick={finalize}>
            Finalize
          </button>
        )}
        <button className="tool-btn" onClick={() => nav("/")}>
          Home
        </button>
      </div>

      {isFinalized && (
        <div className="banner">
          This trip is finalized — {score.toLocaleString()} points. The board is read-only.
        </div>
      )}
      {locked && !isFinalized && (
        <div className="banner">Board locked. Tap Unlock to keep spotting.</div>
      )}

      {players.length > 1 && (
        <div className="players">
          {players
            .sort((a, b) => b[1].score - a[1].score)
            .map(([uid, p]) => (
              <div key={uid} className="player-chip">
                <span className="player-name">{p.name}</span>
                <span className="player-score">{p.score}</span>
              </div>
            ))}
        </div>
      )}

      <SearchBar
        value={search}
        onChange={setSearch}
        totalCards={TOTAL_CARDS}
        onExpandAll={() => setCollapsed({})}
        onCollapseAll={() =>
          setCollapsed(Object.fromEntries(VISIBLE_CATEGORIES.map((c) => [c.id, true])))
        }
        allOpen={openCount === VISIBLE_CATEGORIES.length}
        allClosed={openCount === 0}
      />

      <JumpNav categories={VISIBLE_CATEGORIES} completed={completed} onJump={jump} />

      {term && (
        <div className="search-status">
          {matchCount} {matchCount === 1 ? "card" : "cards"} matching "{search.trim()}"
        </div>
      )}

      <main>
        {visible.map((cat) => {
          const all = cat.groups.flatMap((g) => g.cards);
          const foundCount = VISIBLE_CATEGORIES.find((c) => c.id === cat.id)!
            .groups.flatMap((g) => g.cards)
            .filter((c) => finds[c.id]).length;
          const totalCount = VISIBLE_CATEGORIES.find((c) => c.id === cat.id)!.groups.reduce(
            (n, g) => n + g.cards.length,
            0
          );
          const isCollapsed = !term && collapsed[cat.id];

          return (
            <section
              key={cat.id}
              id={`sec-${cat.id}`}
              className={isCollapsed ? "pack-section collapsed" : "pack-section"}
            >
              <button
                className="pack-eyebrow"
                onClick={() =>
                  !term && setCollapsed((p) => ({ ...p, [cat.id]: !p[cat.id] }))
                }
                aria-expanded={!isCollapsed}
              >
                <span className="eyebrow-left">
                  <svg className="chevron" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path
                      d="M2 4L6 8L10 4"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>{cat.label}</span>
                </span>
                <span className="count">
                  {foundCount} / {totalCount}
                </span>
              </button>

              {!isCollapsed && (
                <div className="pack-body">
                  {cat.groups.map((group, gi) => (
                    <div key={group.label ?? gi}>
                      {group.label && (
                        <div className="subgroup-label">
                          {group.label}
                          <span className="sub-count">
                            {group.cards.filter((c) => finds[c.id]).length}/{group.cards.length}
                          </span>
                        </div>
                      )}
                      <div className={cat.style === "sign" ? "grid sign-grid" : "grid"}>
                        {group.cards.map((card) => (
                          <CardTile
                            key={card.id}
                            card={card}
                            category={cat}
                            found={!!finds[card.id]}
                            foundBy={finds[card.id]?.name}
                            locked={boardLocked}
                            highlight={term || undefined}
                            onToggle={() => void toggle(card.id, !!finds[card.id])}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {all.length === 0 && null}
            </section>
          );
        })}

        {term && matchCount === 0 && (
          <div className="no-results">No cards match "{search.trim()}"</div>
        )}
      </main>
    </div>
  );
}

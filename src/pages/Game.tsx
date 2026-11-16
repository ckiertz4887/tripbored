import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { saveGameUrl, getMinigameReturn, clearMinigameReturn } from "../lib/minigameNav";
import { useAuth } from "../lib/auth";
import { useSettings } from "../lib/settings";
import {
  finalizeGame,
  joinGame,
  renameGame,
  setRoute,
  useCardActions,
  useGame,
} from "../lib/game";
import { ROUTE_OPTIONS } from "../data/plate-geo";
import { TOTAL_CARDS, VISIBLE_CATEGORIES } from "../data/cards";
import { CardTile } from "../components/CardTile";
import { ConfirmDialog, PromptDialog } from "../components/Dialog";
import { ScoreBar } from "../components/ScoreBar";
import { JumpNav } from "../components/JumpNav";
import { SearchBar } from "../components/SearchBar";

type RouteSelectProps = { value: string; onChange: (code: string) => void; placeholder: string };

function RouteSelect({ value, onChange, placeholder }: RouteSelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selected = ROUTE_OPTIONS.find((r) => r.code === value);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return ROUTE_OPTIONS;
    return ROUTE_OPTIONS.filter(
      (r) => r.label.toLowerCase().includes(q) || r.code.toLowerCase().startsWith(q)
    );
  }, [query]);

  const usOptions = filtered.filter((r) => r.group === "US");
  const caOptions = filtered.filter((r) => r.group === "Canada");

  function pick(code: string) {
    onChange(code);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="route-combobox">
      <input
        className="route-combobox-input"
        type="text"
        autoComplete="off"
        placeholder={placeholder}
        value={open ? query : (selected?.label ?? "")}
        onFocus={() => { setQuery(""); setOpen(true); }}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && (
        <ul className="route-dropdown">
          {usOptions.length > 0 && <>
            <li className="route-dropdown-group">United States</li>
            {usOptions.map((r) => (
              <li key={r.code} className={"route-dropdown-option" + (r.code === value ? " selected" : "")} onMouseDown={() => pick(r.code)}>
                <span className="route-option-code">{r.code}</span>
                <span className="route-option-name">{r.label}</span>
              </li>
            ))}
          </>}
          {caOptions.length > 0 && <>
            <li className="route-dropdown-group">Canada</li>
            {caOptions.map((r) => (
              <li key={r.code} className={"route-dropdown-option" + (r.code === value ? " selected" : "")} onMouseDown={() => pick(r.code)}>
                <span className="route-option-code">{r.code}</span>
                <span className="route-option-name">{r.label}</span>
              </li>
            ))}
          </>}
          {filtered.length === 0 && <li className="route-dropdown-empty">No matches</li>}
        </ul>
      )}
    </div>
  );
}

export function Game() {
  const { gameId } = useParams<{ gameId: string }>();
  const nav = useNavigate();
  const { user } = useAuth();
  const { game, finds, score, byPlayer, loading, missing, possible, platePoints } = useGame(gameId);
  const playerName = user?.displayName ?? "Player";
  const { toggle, undoLast } = useCardActions(gameId, user?.uid, playerName, platePoints);

  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [locked, setLocked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [routeOpen, setRouteOpen] = useState(false);
  const [draftOrigin, setDraftOrigin] = useState("");
  const [draftDest, setDraftDest] = useState("");
  const [dialog, setDialog] = useState<"rename" | "finalize" | null>(null);
  const minigameReturn = useRef(getMinigameReturn());
  const [searchParams] = useSearchParams();
  const isNewTrip = searchParams.get("new") === "1";
  const autoOpenedRef = useRef(false);
  const { settings } = useSettings();

  const isOwner = !!user && game?.ownerUid === user.uid;
  const isFinalized = game?.status === "finalized";
  const boardLocked = locked || isFinalized;

  useEffect(() => {
    if (gameId) saveGameUrl(gameId);
  }, [gameId]);

  // Anyone who opens a shared link becomes a member, so their taps carry their
  // name and the game shows up in their history.
  useEffect(() => {
    if (!game || !user || !gameId) return;
    if (!game.memberIds?.includes(user.uid)) {
      void joinGame(gameId, user.uid, playerName, user.photoURL ?? null);
    }
  }, [game, user, gameId, playerName]);

  // Auto-open Smart Scoring on new trips (if user hasn't turned it off in settings).
  useEffect(() => {
    if (!loading && game && isOwner && isNewTrip && settings.askRoute && !autoOpenedRef.current) {
      autoOpenedRef.current = true;
      setDraftOrigin(game.route?.origin ?? "");
      setDraftDest(game.route?.dest ?? "");
      setRouteOpen(true);
    }
  }, [loading, game, isOwner, isNewTrip, settings.askRoute]);

  const term = search.trim().toLowerCase();

  // Expand the search term with common aliases before matching.
  const expandedTerms = useMemo(() => {
    if (!term) return [];
    const synonyms: Record<string, string[]> = {
      bike: ["bicycle", "motorcycle", "motorbike"],
      bicycle: ["bike"],
      motorcycle: ["bike", "motorbike"],
      motorbike: ["motorcycle", "bike"],
      truck: ["semi", "tractor", "eighteen", "18-wheeler", "pickup", "lorry"],
      semi: ["truck", "tractor", "eighteen", "18-wheeler"],
      cop: ["police", "sheriff", "trooper"],
      police: ["cop", "sheriff", "trooper", "patrol"],
      sheriff: ["cop", "police", "deputy"],
      gas: ["fuel", "petrol", "station", "pump"],
      rv: ["camper", "motorhome", "recreational"],
      camper: ["rv", "motorhome", "trailer"],
      dog: ["canine", "puppy", "hound"],
      cat: ["feline", "kitten"],
      deer: ["buck", "doe", "fawn", "antler"],
      bird: ["hawk", "eagle", "falcon", "owl", "crow", "vulture", "heron"],
      cow: ["cattle", "bull", "calf", "bovine"],
      horse: ["pony", "stallion", "mare", "foal"],
      plane: ["airplane", "aircraft", "jet", "helicopter"],
      airplane: ["plane", "aircraft", "jet"],
      helicopter: ["chopper", "copter", "plane"],
      boat: ["ship", "vessel", "canoe", "kayak", "sailboat"],
      train: ["railroad", "railway", "locomotive", "freight"],
      fast: ["mcdonald", "burger", "taco", "wendy", "arby", "subway", "chick"],
      mcdonalds: ["golden arches", "fast food"],
      church: ["chapel", "cathedral", "steeple"],
      school: ["bus", "college", "university"],
      flag: ["american", "banner"],
      rainbow: ["colors", "prism"],
      sunset: ["sunrise", "dusk", "dawn"],
      mountain: ["hill", "peak", "ridge"],
      river: ["creek", "stream", "lake", "pond", "water"],
      farm: ["barn", "silo", "field", "crop"],
      barn: ["farm", "silo"],
    };
    const expanded = new Set([term]);
    for (const [key, aliases] of Object.entries(synonyms)) {
      if (term.includes(key) || aliases.some((a) => term.includes(a))) {
        expanded.add(key);
        aliases.forEach((a) => expanded.add(a));
      }
    }
    return [...expanded];
  }, [term]);

  const visible = useMemo(() => {
    return VISIBLE_CATEGORIES.map((cat) => {
      const groups = cat.groups
        .map((g) => ({
          ...g,
          cards: term
            ? g.cards.filter((c) => {
                const name = c.name.toLowerCase();
                return expandedTerms.some((t) => name.includes(t));
              })
            : g.cards,
        }))
        .filter((g) => g.cards.length > 0);
      return { ...cat, groups };
    }).filter((c) => c.groups.length > 0);
  }, [term, expandedTerms]);

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

  const jump = useCallback((id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: false }));
    requestAnimationFrame(() => {
      document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  function openRouteModal() {
    setDraftOrigin(game?.route?.origin ?? "");
    setDraftDest(game?.route?.dest ?? "");
    setRouteOpen(true);
  }

  async function saveRoute() {
    if (!gameId || !draftOrigin || !draftDest) return;
    await setRoute(gameId, draftOrigin, draftDest);
    const dateStr = new Date().toLocaleDateString(undefined, { month: "long", day: "numeric" });
    await renameGame(gameId, `${draftOrigin} → ${draftDest}: ${dateStr}`);
    setRouteOpen(false);
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

  async function doRename(next: string) {
    setDialog(null);
    if (!gameId) return;
    await renameGame(gameId, next);
  }

  async function doFinalize() {
    setDialog(null);
    if (!gameId) return;
    await finalizeGame(gameId, score);
  }

  if (loading) return <div className="loading">Loading trip...</div>;
  if (missing)
    return (
      <div className="empty-state">
        <h2>That trip isn't here</h2>
        <p>The link may be wrong, or the trip was deleted.</p>
        <button className="btn btn-primary btn-lg btn-block" onClick={() => nav("/")}>
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
        onRename={isOwner && !isFinalized ? () => setDialog("rename") : undefined}
        onShare={share}
        shareCopied={copied}
        onHome={() => nav("/")}
      />

      <div className="toolbar">
        <button className="btn-tool" onClick={() => void undoLast()} disabled={boardLocked}>
          Undo
        </button>
        <button
          className={locked ? "btn-tool on" : "btn-tool"}
          onClick={() => setLocked((v) => !v)}
          disabled={isFinalized}
        >
          <svg className="lock-icon" viewBox="0 0 12 14" width="11" height="13" aria-hidden="true">
            <rect x="1" y="6" width="10" height="8" rx="1.5" fill="currentColor" />
            {locked ? (
              <path d="M3 6V4a3 3 0 016 0v2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
            ) : (
              <path d="M3 6V4a3 3 0 016 0" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
            )}
          </svg>
          {locked ? "Unlock Board" : "Lock Board"}
        </button>
        {isOwner && !isFinalized && (
          <button className="btn-tool" onClick={() => setDialog("finalize")}>
            Finalize
          </button>
        )}
        {isOwner && !isFinalized && (
          <button className="btn-tool btn-tool-route" onClick={openRouteModal}>
            {game?.route ? `${game.route.origin} → ${game.route.dest}` : "Smart Scoring"}
          </button>
        )}
        {(!isOwner || isFinalized) && game?.route && (
          <span className="route-label">{game.route.origin} → {game.route.dest}</span>
        )}
        {minigameReturn.current && (
          <button
            className="btn-tool btn-tool-return"
            onClick={() => {
              const r = minigameReturn.current!;
              clearMinigameReturn();
              minigameReturn.current = null;
              nav(r.route);
            }}
          >
            ← {minigameReturn.current.name}
          </button>
        )}
        <button className="btn-tool" onClick={() => nav("/")}>
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
          const catCards = VISIBLE_CATEGORIES.find((c) => c.id === cat.id)!.groups.flatMap((g) => g.cards);
          const foundCount = catCards.filter((c) => finds[c.id]).length;
          const totalCount = catCards.length;
          const earnedPts = catCards.filter((c) => finds[c.id]).reduce((sum, c) => sum + finds[c.id].points, 0);
          const totalPts = catCards.reduce((sum, c) => sum + (platePoints[c.id] ?? c.points), 0);
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
                  {foundCount}/{totalCount}
                  <span className="count-pts"> · {earnedPts}/{totalPts} pts</span>
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
                            points={platePoints[card.id]}
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

      {dialog === "rename" && (
        <PromptDialog
          title="Name this trip"
          defaultValue={game?.name ?? ""}
          confirmLabel="Save"
          onConfirm={(v) => void doRename(v)}
          onCancel={() => setDialog(null)}
        />
      )}
      {dialog === "finalize" && (
        <ConfirmDialog
          title="Finalize trip?"
          message={`"${game?.name}" will lock at ${score.toLocaleString()} points. The board becomes read-only.`}
          confirmLabel="Finalize"
          onConfirm={() => void doFinalize()}
          onCancel={() => setDialog(null)}
        />
      )}

      {routeOpen && (
        <div className="route-overlay" onClick={() => setRouteOpen(false)}>
          <div className="route-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Smart Scoring <span className="route-recommended">(recommended)</span></h3>
            <p className="route-modal-hint">
              Tell us where you're driving, and we'll make rare plates worth more points. A New York
              plate on a trip from New York? Easy. A Hawaii plate on that same trip? Big deal.
              Skip to keep all license plates at a flat 5 points.
            </p>
            <div className="route-selects">
              <label>
                From
                <RouteSelect value={draftOrigin} onChange={setDraftOrigin} placeholder="Type a state or province…" />
              </label>
              <label>
                To
                <RouteSelect value={draftDest} onChange={setDraftDest} placeholder="Type a state or province…" />
              </label>
            </div>
            <div className="route-modal-actions">
              <button className="btn-tool" onClick={() => setRouteOpen(false)}>
                {game?.route ? "Cancel" : "Skip"}
              </button>
              <button
                className="btn-tool btn-tool-save-route"
                onClick={() => void saveRoute()}
                disabled={!draftOrigin || !draftDest || draftOrigin === draftDest}
              >
                Save Route
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

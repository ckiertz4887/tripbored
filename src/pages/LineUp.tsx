import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  LINE_UP_CHALLENGES,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  type Difficulty,
  type LineUpChallenge,
} from "../data/line-up";
import { useAuth } from "../lib/auth";

// ── Persistence ───────────────────────────────────────────────────────────────

function storageKey(uid: string) { return `lu-completed-${uid}`; }

function getCompleted(uid: string | undefined): Set<string> {
  if (!uid) return new Set();
  try {
    const raw = localStorage.getItem(storageKey(uid));
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch { return new Set(); }
}

function saveCompleted(uid: string, id: string) {
  const s = getCompleted(uid);
  s.add(id);
  localStorage.setItem(storageKey(uid), JSON.stringify([...s]));
}

function removeCompleted(uid: string, id: string) {
  const s = getCompleted(uid);
  s.delete(id);
  localStorage.setItem(storageKey(uid), JSON.stringify([...s]));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function scramble(items: string[]): string[] {
  const a = [...items];
  // Sattolo's algorithm: j is always < i, so every element is guaranteed
  // to land in a different position — the correct order can never come back.
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Draggable item ────────────────────────────────────────────────────────────

function SortableItem({
  id,
  position,
  checking,
  correct,
  disabled,
}: {
  id: string;
  position: number;
  checking: boolean;
  correct: boolean;
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled });

  let cls = "lu-item";
  if (isDragging) cls += " lu-item-dragging";
  if (checking && correct) cls += " lu-item-correct";
  if (checking && !correct) cls += " lu-item-wrong";

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cls}
      {...attributes}
      {...listeners}
    >
      <span className="lu-rank">{position}</span>
      <span className="lu-label">{id}</span>
      {checking && <span className="lu-check">{correct ? "✓" : "✗"}</span>}
    </div>
  );
}

// ── Challenge grid ────────────────────────────────────────────────────────────

function ChallengeGrid({
  completedIds,
  onSelect,
}: {
  completedIds: Set<string>;
  onSelect: (c: LineUpChallenge) => void;
}) {
  const nav = useNavigate();

  const byDiff = ([1, 2, 3, 4] as Difficulty[]).map((d) => ({
    difficulty: d,
    challenges: LINE_UP_CHALLENGES.filter((c) => c.difficulty === d),
  }));

  return (
    <div className="lu-page">
      <div className="lu-header">
        <button className="btn btn-secondary btn-sm" onClick={() => nav("/")}>Home</button>
        <h2 className="lu-title">Line Up</h2>
      </div>
      <p className="lu-subtitle">Pick a challenge. Drag the items into the right order.</p>

      {byDiff.map(({ difficulty, challenges }) => (
        <div key={difficulty} className="lu-group">
          <div
            className="lu-group-label"
            style={{ color: DIFFICULTY_COLORS[difficulty] }}
          >
            {DIFFICULTY_LABELS[difficulty]}
          </div>
          <div className="lu-grid">
            {challenges.map((c) => (
              <button
                key={c.id}
                className={`lu-card-btn${completedIds.has(c.id) ? " lu-card-solved" : ""}`}
                onClick={() => onSelect(c)}
              >
                <div
                  className="lu-card-accent"
                  style={{ background: DIFFICULTY_COLORS[c.difficulty] }}
                />
                <div className="lu-card-inner">
                  <div className="lu-card-cat">{c.category}</div>
                  <div className="lu-card-title">{c.title}</div>
                  {completedIds.has(c.id) && (
                    <div className="lu-card-check">✓ Solved</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Puzzle screen ─────────────────────────────────────────────────────────────

type PuzzleState = {
  challenge: LineUpChallenge;
  order: string[];
  checking: boolean;
  hasCheckedOnce: boolean;
  revealed: boolean;
  completedView: boolean; // returning to an already-solved challenge
};

function PuzzleScreen({
  state,
  onDragEnd,
  onCheck,
  onReveal,
  onReset,
  onBack,
}: {
  state: PuzzleState;
  onDragEnd: (e: DragEndEvent) => void;
  onCheck: () => void;
  onReveal: () => void;
  onReset: () => void;
  onBack: () => void;
}) {
  const { challenge, order, checking, hasCheckedOnce, revealed, completedView } = state;
  const nav = useNavigate();

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    // 80ms is short enough to feel instant, long enough not to fight scroll
    useSensor(TouchSensor, { activationConstraint: { delay: 80, tolerance: 10 } })
  );

  const correctMask = order.map((item, i) => item === challenge.items[i]);
  const allCorrect = checking && correctMask.every(Boolean);
  const locked = allCorrect || completedView;

  const showStaticList = revealed || completedView;

  return (
    <div className="lu-page">
      <div className="lu-header">
        <button className="btn btn-secondary btn-sm" onClick={onBack}>All Challenges</button>
        <div className="cl-header-right">
          <button className="btn btn-secondary btn-sm" onClick={() => nav("/")}>Home</button>
        </div>
      </div>

      <div className="lu-puzzle-header">
        <div className="lu-puzzle-cat">{challenge.category}</div>
        <div className="lu-puzzle-title">{challenge.title}</div>
        <div className="lu-puzzle-prompt">{challenge.prompt}</div>
        <span
          className="lu-diff-badge"
          style={{ background: DIFFICULTY_COLORS[challenge.difficulty] }}
        >
          {DIFFICULTY_LABELS[challenge.difficulty]}
        </span>
      </div>

      {showStaticList ? (
        <div className="lu-revealed-list">
          {challenge.items.map((item, i) => (
            <div key={item} className="lu-item lu-item-correct">
              <span className="lu-rank">{i + 1}</span>
              <span className="lu-label">
                {completedView && !revealed
                  ? <span className="lu-label-redacted" />
                  : item}
              </span>
              <span className="lu-check">✓</span>
            </div>
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={order} strategy={verticalListSortingStrategy}>
            <div className="lu-list">
              {order.map((item, i) => (
                <SortableItem
                  key={item}
                  id={item}
                  position={i + 1}
                  checking={checking}
                  correct={correctMask[i]}
                  disabled={locked}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="lu-puzzle-actions">
        {completedView ? (
          <div className="lu-checking-actions">
            {!revealed && (
              <button className="btn btn-primary btn-lg btn-block" onClick={onReveal}>Reveal Answers</button>
            )}
            <button className="btn-tool lu-reveal-btn" onClick={onReset}>
              Reset Challenge
            </button>
          </div>
        ) : allCorrect ? (
          <div className="lu-solved">
            <div className="lu-solved-msg">Nailed it!</div>
            <button className="btn btn-primary btn-lg btn-block" onClick={onBack}>Back to Challenges</button>
          </div>
        ) : revealed ? (
          <button className="btn btn-primary btn-lg btn-block" onClick={onBack}>Back to Challenges</button>
        ) : checking ? (
          <div className="lu-checking-actions">
            <p className="lu-hint">Drag to fix the red ones, then check again.</p>
            <button className="btn-tool lu-reveal-btn" onClick={onReveal}>
              Reveal Answer
            </button>
          </div>
        ) : (
          <div className="lu-checking-actions">
            <button className="btn btn-primary btn-lg btn-block" onClick={onCheck}>Check My Order</button>
            {hasCheckedOnce && (
              <button className="btn-tool lu-reveal-btn" onClick={onReveal}>
                Reveal Answer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export function LineUp() {
  const { user } = useAuth();
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    () => getCompleted(user?.uid)
  );
  const [puzzle, setPuzzle] = useState<PuzzleState | null>(null);

  function selectChallenge(challenge: LineUpChallenge) {
    const isCompleted = completedIds.has(challenge.id);
    setPuzzle({
      challenge,
      order: isCompleted ? [...challenge.items] : scramble(challenge.items),
      checking: isCompleted,
      hasCheckedOnce: isCompleted,
      revealed: false,
      completedView: isCompleted,
    });
  }

  // Swap the two endpoints directly — no shifting of items in between
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setPuzzle((prev) => {
      if (!prev) return prev;
      const oldIdx = prev.order.indexOf(active.id as string);
      const newIdx = prev.order.indexOf(over.id as string);
      const newOrder = [...prev.order];
      [newOrder[oldIdx], newOrder[newIdx]] = [newOrder[newIdx], newOrder[oldIdx]];
      return { ...prev, order: newOrder, checking: false };
    });
  }, []);

  function check() {
    if (!puzzle) return;
    const allCorrect = puzzle.order.every((item, i) => item === puzzle.challenge.items[i]);
    setPuzzle((prev) => prev && { ...prev, checking: true, hasCheckedOnce: true });
    if (allCorrect && user?.uid) {
      saveCompleted(user.uid, puzzle.challenge.id);
      setCompletedIds((prev) => new Set([...prev, puzzle.challenge.id]));
    }
  }

  function reveal() {
    setPuzzle((prev) => prev && { ...prev, revealed: true });
  }

  function reset() {
    if (!puzzle) return;
    if (user?.uid) {
      removeCompleted(user.uid, puzzle.challenge.id);
      setCompletedIds((prev) => {
        const next = new Set(prev);
        next.delete(puzzle.challenge.id);
        return next;
      });
    }
    setPuzzle({
      challenge: puzzle.challenge,
      order: scramble(puzzle.challenge.items),
      checking: false,
      hasCheckedOnce: false,
      revealed: false,
      completedView: false,
    });
  }

  if (!puzzle) {
    return <ChallengeGrid completedIds={completedIds} onSelect={selectChallenge} />;
  }

  return (
    <PuzzleScreen
      state={puzzle}
      onDragEnd={handleDragEnd}
      onCheck={check}
      onReveal={reveal}
      onReset={reset}
      onBack={() => setPuzzle(null)}
    />
  );
}

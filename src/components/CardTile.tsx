import { useRef } from "react";
import { COLOR_SWATCHES, splitLabel, type Card, type Category } from "../data/cards";

/**
 * Distance in px the pointer may drift between down and up and still count as
 * a tap. Below this, a finger resting while the list scrolls won't flip a card;
 * above it, the gesture is a scroll and we ignore it. This is the fix for the
 * beta finding that scrolling was registering as card taps.
 */
const TAP_SLOP = 10;
/** A press longer than this is treated as a deliberate hold, not a tap. */
const TAP_TIMEOUT_MS = 700;

type Props = {
  card: Card;
  category: Category;
  found: boolean;
  foundBy?: string;
  locked?: boolean;
  highlight?: string;
  onToggle: () => void;
};

function Highlighted({ text, term }: { text: string; term?: string }) {
  if (!term) return <>{text}</>;
  const i = text.toLowerCase().indexOf(term.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + term.length)}</mark>
      {text.slice(i + term.length)}
    </>
  );
}

export function CardTile({
  card,
  category,
  found,
  foundBy,
  locked,
  highlight,
  onToggle,
}: Props) {
  const start = useRef<{ x: number; y: number; t: number } | null>(null);

  function onPointerDown(e: React.PointerEvent) {
    start.current = { x: e.clientX, y: e.clientY, t: Date.now() };
  }

  function onPointerUp(e: React.PointerEvent) {
    const s = start.current;
    start.current = null;
    if (!s || locked) return;
    const moved = Math.hypot(e.clientX - s.x, e.clientY - s.y);
    if (moved > TAP_SLOP) return; // scrolling, not tapping
    if (Date.now() - s.t > TAP_TIMEOUT_MS) return; // long press
    onToggle();
  }

  const [primary, qualifier] = splitLabel(card);
  const swatch = category.style === "swatch" ? COLOR_SWATCHES[card.name] : undefined;

  return (
    <div
      className={[
        "card",
        found ? "found" : "",
        category.style === "sign" ? "sign-card" : "",
        locked ? "locked" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="checkbox"
      aria-checked={found}
      aria-label={`${card.name}, ${card.points} points`}
      tabIndex={locked ? -1 : 0}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (start.current = null)}
      onKeyDown={(e) => {
        if (locked) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      {card.rare && <div className="rare-ribbon">RARE</div>}

      {category.style === "sign" ? (
        <div className="speed-sign">
          <span className="speed-sign-label">
            SPEED
            <br />
            LIMIT
          </span>
          <span className="speed-sign-num">{card.name}</span>
        </div>
      ) : (
        <div className="card-name">
          {swatch ? (
            <span className="swatch-row">
              <span
                className={swatch === "multi" ? "swatch swatch-multi" : "swatch"}
                style={swatch === "multi" ? undefined : { background: swatch }}
              />
              <span>
                <Highlighted text={primary} term={highlight} />
              </span>
            </span>
          ) : (
            <Highlighted text={primary} term={highlight} />
          )}
          {qualifier && (
            <span className="card-qual">
              <Highlighted text={qualifier} term={highlight} />
            </span>
          )}
        </div>
      )}

      <div className="points-chip">{card.points} pts</div>

      {found && (
        <div className="stamp" title={foundBy ? `Spotted by ${foundBy}` : undefined}>
          <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M2 6L5 9L10 3"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

import { COLOR_SWATCHES, splitLabel, type Card, type Category } from "../data/cards";

type Props = {
  card: Card;
  category: Category;
  found: boolean;
  foundBy?: string;
  locked?: boolean;
  highlight?: string;
  onToggle: () => void;
  points?: number;
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
  points,
}: Props) {
  const [primary, qualifier] = splitLabel(card);
  const swatch = category.style === "swatch" ? COLOR_SWATCHES[card.name] : undefined;
  const displayPoints = points ?? card.points;

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
      aria-label={`${card.name}, ${displayPoints} points`}
      tabIndex={locked ? -1 : 0}
      onClick={locked ? undefined : onToggle}
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

      <div className="points-chip">{displayPoints} pts</div>

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

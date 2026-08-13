import type { Category } from "../data/cards";

type Props = {
  categories: Category[];
  completed: Set<string>;
  onJump: (id: string) => void;
};

export function JumpNav({ categories, completed, onJump }: Props) {
  return (
    <nav className="jumpbar" aria-label="Jump to category">
      <div className="jump-scroll">
        {categories.map((c) => (
          <button
            key={c.id}
            className={completed.has(c.id) ? "jump-chip complete" : "jump-chip"}
            onClick={() => onJump(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

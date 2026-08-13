type Props = {
  value: string;
  onChange: (v: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  allOpen: boolean;
  allClosed: boolean;
  totalCards: number;
};

export function SearchBar({
  value,
  onChange,
  onExpandAll,
  onCollapseAll,
  allOpen,
  allClosed,
  totalCards,
}: Props) {
  return (
    <div className="search-wrap">
      <div className="search-box">
        <svg className="search-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="5" stroke="#3f5a82" strokeWidth="2" />
          <path d="M11 11L14.5 14.5" stroke="#3f5a82" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={value}
          placeholder={`Search all ${totalCards} cards...`}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        {value && (
          <button className="search-clear" onClick={() => onChange("")} aria-label="Clear search">
            &times;
          </button>
        )}
      </div>
      <button className={allOpen ? "bulk-btn inactive" : "bulk-btn"} onClick={onExpandAll}>
        Expand
        <br />
        all
      </button>
      <button className={allClosed ? "bulk-btn inactive" : "bulk-btn"} onClick={onCollapseAll}>
        Collapse
        <br />
        all
      </button>
    </div>
  );
}

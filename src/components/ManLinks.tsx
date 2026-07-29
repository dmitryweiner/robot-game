import type { ManPageEntry } from './CommandReference';
import './ManLinks.css';

interface ManLinksProps {
  label: string;
  entries: ManPageEntry[];
  onSelect: (entry: ManPageEntry) => void;
}

/** A row of "man <name>" links, one per command/operator — opens CommandReference on click. */
export function ManLinks({ label, entries, onSelect }: ManLinksProps) {
  return (
    <div className="man-links">
      <span className="man-links__label">{label}</span>
      {entries.map((entry) => (
        <button
          key={entry.name}
          type="button"
          className="man-links__link"
          onClick={() => onSelect(entry)}
          aria-label={`man ${entry.name}`}
        >
          {entry.name}
        </button>
      ))}
    </div>
  );
}

import { useState, type ClipboardEvent, type MouseEvent } from 'react';
import './HintButton.css';

interface HintButtonProps {
  command: string;
}

function blockCopy(event: ClipboardEvent<HTMLElement>) {
  event.preventDefault();
}

function blockContextMenu(event: MouseEvent<HTMLElement>) {
  event.preventDefault();
}

/**
 * The caller should pass a stage-dependent `key` (e.g. `key={stage.id}`) so
 * that moving to a new stage remounts this component and hides an
 * already-revealed hint, instead of reaching for an effect to reset state.
 */
export function HintButton({ command }: HintButtonProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="hint-button">
      <button
        type="button"
        className="hint-button__toggle"
        onClick={() => setRevealed((prev) => !prev)}
        aria-expanded={revealed}
        aria-label={revealed ? 'Скрыть подсказку' : 'Показать подсказку'}
      >
        ?
      </button>
      {revealed && (
        <code
          className="hint-button__command"
          style={{ userSelect: 'none' }}
          onCopy={blockCopy}
          onContextMenu={blockContextMenu}
        >
          {command}
        </code>
      )}
    </div>
  );
}

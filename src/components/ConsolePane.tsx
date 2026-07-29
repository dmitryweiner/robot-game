import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import './ConsolePane.css';

export interface ConsoleLine {
  stream: 'stdout' | 'stderr';
  text: string;
}

type HistoryEntry =
  | { kind: 'input'; prompt: string; text: string }
  | { kind: 'output'; stream: ConsoleLine['stream']; text: string };

interface ConsolePaneProps {
  prompt: string;
  /** Runs the submitted line and returns the output to append to the scrollback. */
  onSubmit: (line: string) => ConsoleLine[];
  /** Optional Tab-completion; when absent, Tab still stays inside the console, it just does nothing. */
  onTab?: (value: string) => string | null;
  inputLabel?: string;
  className?: string;
}

/**
 * Generic scrollback + single-line input, shared by every terminal-like
 * panel in the game (shell, build console, JS REPL). Domain logic (what a
 * line *does*) lives entirely in `onSubmit`/`onTab` — this component only
 * owns scrollback, input value, and command history navigation.
 */
export function ConsolePane({ prompt, onSubmit, onTab, inputLabel = 'Командная строка', className }: ConsolePaneProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [history]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const line = inputValue;
    const lines = onSubmit(line);

    setHistory((prev) => [
      ...prev,
      { kind: 'input', prompt, text: line },
      ...lines.map((l): HistoryEntry => ({ kind: 'output', stream: l.stream, text: l.text })),
    ]);
    setInputValue('');
    setHistoryIndex(null);
    if (line.trim() !== '') {
      setCommandHistory((prev) => [...prev, line]);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Tab') {
      // Keep Tab inside the console instead of letting the browser move
      // focus to the next element on the page.
      event.preventDefault();
      if (onTab) {
        const completed = onTab(inputValue);
        if (completed !== null) {
          setInputValue(completed);
        }
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (commandHistory.length === 0) {
        return;
      }
      const nextIndex = historyIndex === null ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInputValue(commandHistory[nextIndex]);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (historyIndex === null) {
        return;
      }
      const nextIndex = historyIndex + 1;
      if (nextIndex >= commandHistory.length) {
        setHistoryIndex(null);
        setInputValue('');
      } else {
        setHistoryIndex(nextIndex);
        setInputValue(commandHistory[nextIndex]);
      }
    }
  }

  return (
    <div
      className={`console-pane${className ? ` ${className}` : ''}`}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="console-pane__scrollback" ref={scrollRef}>
        {history.map((entry, index) =>
          entry.kind === 'input' ? (
            <div key={index} className="console-pane__line console-pane__line--input">
              <span className="console-pane__prompt">{entry.prompt}</span> {entry.text}
            </div>
          ) : (
            <div key={index} className={`console-pane__line console-pane__line--${entry.stream}`}>
              {entry.text || ' '}
            </div>
          ),
        )}
      </div>
      <form className="console-pane__input-row" onSubmit={handleSubmit}>
        <span className="console-pane__prompt">{prompt}</span>
        <input
          ref={inputRef}
          className="console-pane__input"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          aria-label={inputLabel}
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
      </form>
    </div>
  );
}

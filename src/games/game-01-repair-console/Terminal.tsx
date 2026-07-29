import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { completeInput } from './shell/complete';
import { formatPath, type DirNode } from './shell/fs';
import { createInitialShellState, execLine, type ExecResult, type ShellState } from './shell/interpreter';
import type { ShellEvent } from './shell/types';
import './Terminal.css';

type HistoryEntry =
  | { kind: 'input'; prompt: string; text: string }
  | { kind: 'output'; stream: 'stdout' | 'stderr'; text: string };

interface TerminalProps {
  initialFs: DirNode;
  promptUser?: string;
  onEvent?: (event: ShellEvent) => void;
  onLine?: (line: string, result: ExecResult) => void;
}

export function Terminal({ initialFs, promptUser = 'robot@northbridge', onEvent, onLine }: TerminalProps) {
  const [state, setState] = useState<ShellState>(() => createInitialShellState(initialFs));
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const prompt = `${promptUser}:${formatPath(state.cwd)} #`;

  useEffect(() => {
    const node = scrollRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [history]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const line = inputValue;
    const result = execLine(line, state);

    setHistory((prev) => [
      ...prev,
      { kind: 'input', prompt, text: line },
      ...result.lines.map((l): HistoryEntry => ({ kind: 'output', stream: l.stream, text: l.text })),
    ]);
    setState(result.state);
    setInputValue('');
    setHistoryIndex(null);
    if (line.trim() !== '') {
      setCommandHistory((prev) => [...prev, line]);
    }

    result.events.forEach((shellEvent) => onEvent?.(shellEvent));
    onLine?.(line, result);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Tab') {
      // Keep Tab inside the terminal instead of letting the browser move
      // focus to the next element on the page.
      event.preventDefault();
      const completed = completeInput(inputValue, state.cwd, state.fs);
      if (completed !== null) {
        setInputValue(completed);
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
    <div className="terminal" onClick={() => inputRef.current?.focus()}>
      <div className="terminal__scrollback" ref={scrollRef}>
        {history.map((entry, index) =>
          entry.kind === 'input' ? (
            <div key={index} className="terminal__line terminal__line--input">
              <span className="terminal__prompt">{entry.prompt}</span> {entry.text}
            </div>
          ) : (
            <div key={index} className={`terminal__line terminal__line--${entry.stream}`}>
              {entry.text || ' '}
            </div>
          ),
        )}
      </div>
      <form className="terminal__input-row" onSubmit={handleSubmit}>
        <span className="terminal__prompt">{prompt}</span>
        <input
          ref={inputRef}
          className="terminal__input"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Командная строка"
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
      </form>
    </div>
  );
}

import { useState } from 'react';
import { ConsolePane, type ConsoleLine } from '../../components/ConsolePane';
import { completeInput } from './shell/complete';
import { formatPath, type DirNode } from './shell/fs';
import { createInitialShellState, execLine, type ExecResult, type ShellState } from './shell/interpreter';
import type { ShellEvent } from './shell/types';

interface TerminalProps {
  initialFs: DirNode;
  promptUser?: string;
  onEvent?: (event: ShellEvent) => void;
  onLine?: (line: string, result: ExecResult) => void;
}

export function Terminal({ initialFs, promptUser = 'robot@northbridge', onEvent, onLine }: TerminalProps) {
  const [state, setState] = useState<ShellState>(() => createInitialShellState(initialFs));

  const prompt = `${promptUser}:${formatPath(state.cwd)} #`;

  function handleSubmit(line: string): ConsoleLine[] {
    const result = execLine(line, state);
    setState(result.state);
    result.events.forEach((shellEvent) => onEvent?.(shellEvent));
    onLine?.(line, result);
    return result.lines;
  }

  function handleTab(value: string): string | null {
    return completeInput(value, state.cwd, state.fs);
  }

  return <ConsolePane prompt={prompt} onSubmit={handleSubmit} onTab={handleTab} />;
}

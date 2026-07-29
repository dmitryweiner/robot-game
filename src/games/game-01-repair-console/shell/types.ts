import type { DirNode } from './fs';

export interface ExecContext {
  cwd: string[];
}

export type ShellEvent = { type: 'script-success'; script: string };

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  /** Present when the command mutated the filesystem (e.g. chmod, echo >file). */
  fs?: DirNode;
  event?: ShellEvent;
}

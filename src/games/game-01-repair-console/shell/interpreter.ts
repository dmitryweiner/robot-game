import { runCommand } from './commands';
import { type DirNode, formatPath, getNode, globMatch, resolvePath, writeFile } from './fs';
import { type ParsedCommand, parseLine } from './parser';
import type { ShellEvent } from './types';

export interface OutputLine {
  stream: 'stdout' | 'stderr';
  text: string;
}

export interface ShellState {
  fs: DirNode;
  cwd: string[];
  prevCwd: string[];
}

export interface ExecResult {
  lines: OutputLine[];
  state: ShellState;
  events: ShellEvent[];
}

export function createInitialShellState(fs: DirNode): ShellState {
  return { fs, cwd: [], prevCwd: [] };
}

function expandGlobs(command: ParsedCommand, fs: DirNode, cwd: string[]): ParsedCommand {
  const args = command.args.flatMap((arg) => {
    if (!arg.includes('*')) {
      return [arg];
    }
    const matches = globMatch(fs, cwd, arg);
    return matches.length > 0 ? matches : [arg];
  });
  return { ...command, args };
}

function toLines(text: string, stream: 'stdout' | 'stderr'): OutputLine[] {
  if (text === '') {
    return [];
  }
  const withoutTrailingNewline = text.endsWith('\n') ? text.slice(0, -1) : text;
  return withoutTrailingNewline.split('\n').map((lineText) => ({ stream, text: lineText }));
}

function execCd(command: ParsedCommand, state: ShellState): ExecResult {
  const target = command.args[0];
  if (!target || target === '~') {
    return { lines: [], state: { ...state, cwd: [], prevCwd: state.cwd }, events: [] };
  }
  if (target === '-') {
    return {
      lines: [{ stream: 'stdout', text: formatPath(state.prevCwd) }],
      state: { ...state, cwd: state.prevCwd, prevCwd: state.cwd },
      events: [],
    };
  }
  const nextCwd = resolvePath(state.cwd, target);
  const node = getNode(state.fs, nextCwd);
  if (!node) {
    return { lines: [{ stream: 'stderr', text: `cd: ${target}: No such file or directory` }], state, events: [] };
  }
  if (node.type !== 'dir') {
    return { lines: [{ stream: 'stderr', text: `cd: ${target}: Not a directory` }], state, events: [] };
  }
  return { lines: [], state: { ...state, cwd: nextCwd, prevCwd: state.cwd }, events: [] };
}

export function execLine(line: string, state: ShellState): ExecResult {
  if (line.trim() === '') {
    return { lines: [], state, events: [] };
  }

  const pipeline = parseLine(line);
  if (pipeline.error) {
    return { lines: [{ stream: 'stderr', text: pipeline.error }], state, events: [] };
  }
  if (pipeline.commands.length === 0) {
    return { lines: [], state, events: [] };
  }

  if (pipeline.commands.length === 1 && pipeline.commands[0].name === 'cd') {
    return execCd(pipeline.commands[0], state);
  }

  let fs = state.fs;
  let stdin: string | null = null;
  const lines: OutputLine[] = [];
  const events: ShellEvent[] = [];

  for (let i = 0; i < pipeline.commands.length; i++) {
    const isLast = i === pipeline.commands.length - 1;
    const command = expandGlobs(pipeline.commands[i], fs, state.cwd);

    const inputRedirect = command.redirections.find((r) => r.type === '<');
    let effectiveStdin = stdin;
    if (inputRedirect) {
      const path = resolvePath(state.cwd, inputRedirect.target ?? '');
      const node = getNode(fs, path);
      if (!node || node.type !== 'file') {
        lines.push({ stream: 'stderr', text: `${command.name}: ${inputRedirect.target}: No such file or directory` });
        continue;
      }
      effectiveStdin = node.content;
    }

    const result = runCommand(command.name, command.args, effectiveStdin, fs, { cwd: state.cwd });
    if (result.fs) {
      fs = result.fs;
    }
    if (result.event) {
      events.push(result.event);
    }

    let stdoutText = result.stdout;
    let stderrText = result.stderr;

    if (command.redirections.some((r) => r.type === '2>&1')) {
      stdoutText += stderrText;
      stderrText = '';
    }

    const stderrRedirect = command.redirections.find((r) => r.type === '2>');
    if (stderrRedirect?.target && stderrText) {
      fs = writeFile(fs, resolvePath(state.cwd, stderrRedirect.target), stderrText, false);
      stderrText = '';
    }

    const outRedirect = command.redirections.find((r) => r.type === '>' || r.type === '>>');
    if (outRedirect?.target) {
      fs = writeFile(fs, resolvePath(state.cwd, outRedirect.target), stdoutText, outRedirect.type === '>>');
      stdoutText = '';
    }

    if (stderrText) {
      lines.push(...toLines(stderrText, 'stderr'));
    }

    if (isLast) {
      if (stdoutText) {
        lines.push(...toLines(stdoutText, 'stdout'));
      }
    } else {
      stdin = stdoutText;
    }
  }

  return { lines, state: { ...state, fs }, events };
}

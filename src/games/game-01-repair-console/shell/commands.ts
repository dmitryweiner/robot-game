import { type DirNode, type FsNode, formatPath, getNode, listDir, resolvePath, setExecutable } from './fs';
import { JOURNAL_LOG } from './journal';
import type { CommandResult, ExecContext } from './types';

type CommandFn = (args: string[], stdin: string | null, fs: DirNode, ctx: ExecContext) => CommandResult;

function formatLsLine(name: string, node: FsNode): string {
  const perm = node.type === 'dir' ? 'drwxr-xr-x' : node.executable ? '-rwxr-xr-x' : '-rw-r--r--';
  const size = node.type === 'file' ? node.content.length : 0;
  return `${perm}  1 root root  ${String(size).padStart(4, ' ')}  ${name}`;
}

const cmdPwd: CommandFn = (_args, _stdin, _fs, ctx) => ({
  stdout: formatPath(ctx.cwd) + '\n',
  stderr: '',
  exitCode: 0,
});

const cmdLs: CommandFn = (args, _stdin, fs, ctx) => {
  const flags = args.filter((a) => a.startsWith('-'));
  const paths = args.filter((a) => !a.startsWith('-'));
  const longFormat = flags.some((f) => f.includes('l'));
  const targets = paths.length > 0 ? paths : ['.'];

  const stdoutParts: string[] = [];
  const stderrParts: string[] = [];
  let exitCode = 0;

  targets.forEach((target) => {
    const path = resolvePath(ctx.cwd, target);
    const node = getNode(fs, path);
    if (!node) {
      stderrParts.push(`ls: cannot access '${target}': No such file or directory`);
      exitCode = 1;
      return;
    }
    const baseName = target.split('/').pop() || target;
    if (node.type === 'file') {
      stdoutParts.push(longFormat ? formatLsLine(baseName, node) : baseName);
      return;
    }
    if (targets.length > 1) {
      if (stdoutParts.length > 0) {
        stdoutParts.push('');
      }
      stdoutParts.push(`${target}:`);
    }
    const entries = listDir(node);
    if (longFormat) {
      entries.forEach(([name, child]) => stdoutParts.push(formatLsLine(name, child)));
    } else if (entries.length > 0) {
      stdoutParts.push(entries.map(([name]) => name).join('  '));
    }
  });

  return {
    stdout: stdoutParts.length ? stdoutParts.join('\n') + '\n' : '',
    stderr: stderrParts.length ? stderrParts.join('\n') + '\n' : '',
    exitCode,
  };
};

const cmdCat: CommandFn = (args, stdin, fs, ctx) => {
  if (args.length === 0) {
    return { stdout: stdin ?? '', stderr: '', exitCode: 0 };
  }
  const stdoutParts: string[] = [];
  const stderrParts: string[] = [];
  let exitCode = 0;
  for (const arg of args) {
    const path = resolvePath(ctx.cwd, arg);
    const node = getNode(fs, path);
    if (!node) {
      stderrParts.push(`cat: ${arg}: No such file or directory`);
      exitCode = 1;
      continue;
    }
    if (node.type === 'dir') {
      stderrParts.push(`cat: ${arg}: Is a directory`);
      exitCode = 1;
      continue;
    }
    stdoutParts.push(node.content.endsWith('\n') ? node.content.slice(0, -1) : node.content);
  }
  return {
    stdout: stdoutParts.length ? stdoutParts.join('\n') + '\n' : '',
    stderr: stderrParts.length ? stderrParts.join('\n') + '\n' : '',
    exitCode,
  };
};

const cmdEcho: CommandFn = (args) => ({
  stdout: args.join(' ') + '\n',
  stderr: '',
  exitCode: 0,
});

function countLines(content: string): number {
  return (content.match(/\n/g) ?? []).length;
}

const cmdWc: CommandFn = (args, stdin, fs, ctx) => {
  const linesOnly = args.includes('-l');
  const fileArgs = args.filter((a) => !a.startsWith('-'));
  let content: string;
  if (fileArgs.length > 0) {
    const path = resolvePath(ctx.cwd, fileArgs[0]);
    const node = getNode(fs, path);
    if (!node || node.type !== 'file') {
      return { stdout: '', stderr: `wc: ${fileArgs[0]}: No such file or directory`, exitCode: 1 };
    }
    content = node.content;
  } else {
    content = stdin ?? '';
  }
  const lineCount = countLines(content);
  if (linesOnly) {
    return { stdout: `${lineCount}\n`, stderr: '', exitCode: 0 };
  }
  const wordCount = content.trim().length === 0 ? 0 : content.trim().split(/\s+/).length;
  return { stdout: `${lineCount} ${wordCount} ${content.length}\n`, stderr: '', exitCode: 0 };
};

function linesOf(content: string): string[] {
  const withoutTrailingNewline = content.endsWith('\n') ? content.slice(0, -1) : content;
  return withoutTrailingNewline === '' ? [] : withoutTrailingNewline.split('\n');
}

const cmdTail: CommandFn = (args, stdin, fs, ctx) => {
  let n = 10;
  const rest: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-n') {
      n = Number(args[i + 1]) || n;
      i++;
      continue;
    }
    rest.push(args[i]);
  }
  let content: string;
  if (rest.length > 0) {
    const path = resolvePath(ctx.cwd, rest[0]);
    const node = getNode(fs, path);
    if (!node || node.type !== 'file') {
      return { stdout: '', stderr: `tail: cannot open '${rest[0]}' for reading: No such file or directory`, exitCode: 1 };
    }
    content = node.content;
  } else {
    content = stdin ?? '';
  }
  const tailLines = linesOf(content).slice(-n);
  return { stdout: tailLines.length ? tailLines.join('\n') + '\n' : '', stderr: '', exitCode: 0 };
};

const cmdGrep: CommandFn = (args, stdin, fs, ctx) => {
  const [pattern, ...rest] = args;
  if (!pattern) {
    return { stdout: '', stderr: 'usage: grep PATTERN [FILE]', exitCode: 2 };
  }
  let content: string;
  if (rest.length > 0) {
    const path = resolvePath(ctx.cwd, rest[0]);
    const node = getNode(fs, path);
    if (!node || node.type !== 'file') {
      return { stdout: '', stderr: `grep: ${rest[0]}: No such file or directory`, exitCode: 2 };
    }
    content = node.content;
  } else {
    content = stdin ?? '';
  }
  const matched = linesOf(content).filter((line) => line.includes(pattern));
  return { stdout: matched.length ? matched.join('\n') + '\n' : '', stderr: '', exitCode: matched.length ? 0 : 1 };
};

const cmdChmod: CommandFn = (args, _stdin, fs, ctx) => {
  const [mode, ...paths] = args;
  if (mode !== '+x' && mode !== '-x') {
    return { stdout: '', stderr: `chmod: invalid mode: '${mode ?? ''}'`, exitCode: 1 };
  }
  if (paths.length === 0) {
    return { stdout: '', stderr: 'chmod: missing operand', exitCode: 1 };
  }
  let nextFs = fs;
  const stderrParts: string[] = [];
  let exitCode = 0;
  for (const p of paths) {
    const path = resolvePath(ctx.cwd, p);
    const node = getNode(nextFs, path);
    if (!node) {
      stderrParts.push(`chmod: cannot access '${p}': No such file or directory`);
      exitCode = 1;
      continue;
    }
    if (node.type !== 'file') {
      stderrParts.push(`chmod: ${p}: changing directory permissions is not supported in this trainer`);
      exitCode = 1;
      continue;
    }
    nextFs = setExecutable(nextFs, path, mode === '+x');
  }
  return { stdout: '', stderr: stderrParts.length ? stderrParts.join('\n') + '\n' : '', exitCode, fs: nextFs };
};

const cmdJournalctl: CommandFn = () => ({
  stdout: JOURNAL_LOG.join('\n') + '\n',
  stderr: '',
  exitCode: 0,
});

const REGISTRY: Record<string, CommandFn> = {
  pwd: cmdPwd,
  ls: cmdLs,
  cat: cmdCat,
  echo: cmdEcho,
  wc: cmdWc,
  tail: cmdTail,
  grep: cmdGrep,
  chmod: cmdChmod,
  journalctl: cmdJournalctl,
};

/** `cd` is dispatched specially by the interpreter, but it's still a valid word to tab-complete. */
export const COMMAND_NAMES: string[] = [...Object.keys(REGISTRY), 'cd'];

function executeScript(rawPath: string, fs: DirNode, ctx: ExecContext): CommandResult {
  const path = resolvePath(ctx.cwd, rawPath);
  const node = getNode(fs, path);
  if (!node) {
    return { stdout: '', stderr: `bash: ${rawPath}: No such file or directory`, exitCode: 127 };
  }
  if (node.type === 'dir') {
    return { stdout: '', stderr: `bash: ${rawPath}: Is a directory`, exitCode: 126 };
  }
  if (!node.executable) {
    return { stdout: '', stderr: `bash: ${rawPath}: Permission denied`, exitCode: 126 };
  }
  if (formatPath(path) === '/drivers/nb_init.sh') {
    return {
      stdout:
        ['insmod nb_core.ko', 'insmod nb_motor_left.ko', 'insmod nb_motor_right.ko', 'insmod nb_balance.ko', 'northbridge: motor subsystem online'].join(
          '\n',
        ) + '\n',
      stderr: '',
      exitCode: 0,
      event: { type: 'script-success', script: formatPath(path) },
    };
  }
  return { stdout: '', stderr: '', exitCode: 0 };
}

export function runCommand(name: string, args: string[], stdin: string | null, fs: DirNode, ctx: ExecContext): CommandResult {
  if (name.includes('/')) {
    return executeScript(name, fs, ctx);
  }
  const fn = REGISTRY[name];
  if (!fn) {
    return { stdout: '', stderr: `${name}: command not found`, exitCode: 127 };
  }
  return fn(args, stdin, fs, ctx);
}

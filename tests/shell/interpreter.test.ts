import { describe, expect, it } from 'vitest';
import { createInitialFs } from '../../src/games/game-01-repair-console/shell/fs';
import { createInitialShellState, execLine, type ShellState } from '../../src/games/game-01-repair-console/shell/interpreter';

function run(state: ShellState, line: string) {
  return execLine(line, state);
}

function stdout(lines: { stream: string; text: string }[]): string[] {
  return lines.filter((l) => l.stream === 'stdout').map((l) => l.text);
}

function stderr(lines: { stream: string; text: string }[]): string[] {
  return lines.filter((l) => l.stream === 'stderr').map((l) => l.text);
}

describe('execLine: basic navigation', () => {
  it('ls at root lists top-level directories', () => {
    const state = createInitialShellState(createInitialFs());
    const result = run(state, 'ls');
    expect(stdout(result.lines)[0]).toContain('drivers');
    expect(stdout(result.lines)[0]).toContain('tmp');
  });

  it('ls drivers lists the driver files', () => {
    const state = createInitialShellState(createInitialFs());
    const result = run(state, 'ls drivers');
    expect(stdout(result.lines)[0]).toContain('nb_init.sh');
  });

  it('expands a wildcard for nb_* driver files', () => {
    const state = createInitialShellState(createInitialFs());
    const result = run(state, 'ls drivers/nb_*');
    const out = stdout(result.lines).join('\n');
    expect(out).toContain('nb_core.ko');
    expect(out).toContain('nb_motor_left.ko');
    expect(out).toContain('nb_init.sh');
    expect(out).not.toContain('fan_ctrl.ko');
  });
});

describe('execLine: redirection', () => {
  it('echo > writes to a file without printing to stdout', () => {
    let state = createInitialShellState(createInitialFs());
    const result = run(state, 'echo "проверка" > /tmp/test.txt');
    expect(result.lines).toEqual([]);
    state = result.state;

    const cat = run(state, 'cat /tmp/test.txt');
    expect(stdout(cat.lines)).toEqual(['проверка']);
  });

  it('wc -l < file counts one line for a single echoed word', () => {
    let state = createInitialShellState(createInitialFs());
    state = run(state, 'echo "проверка" > /tmp/test.txt').state;
    const result = run(state, 'wc -l < /tmp/test.txt');
    expect(stdout(result.lines)).toEqual(['1']);
  });

  it('>> appends instead of overwriting', () => {
    let state = createInitialShellState(createInitialFs());
    state = run(state, 'echo "one" > /tmp/test.txt').state;
    state = run(state, 'echo "two" >> /tmp/test.txt').state;
    const result = run(state, 'cat /tmp/test.txt');
    expect(stdout(result.lines)).toEqual(['one', 'two']);
  });

  it('separates stdout and stderr into different files', () => {
    let state = createInitialShellState(createInitialFs());
    state = run(state, 'ls drivers /sys/no_such_thing > out.txt 2> err.txt').state;
    const out = run(state, 'cat out.txt');
    const err = run(state, 'cat err.txt');
    expect(stdout(out.lines).join('\n')).toContain('nb_init.sh');
    expect(stdout(err.lines).join('\n')).toContain('No such file or directory');
  });
});

describe('execLine: pipes', () => {
  it('journalctl | tail -n 500 | grep ERROR surfaces only the nb_motor_left failure', () => {
    const state = createInitialShellState(createInitialFs());
    const result = run(state, 'journalctl | tail -n 500 | grep ERROR');
    const out = stdout(result.lines);
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((l) => l.includes('ERROR'))).toBe(true);
    expect(out.some((l) => l.includes('nb_motor_left'))).toBe(true);
    expect(out.some((l) => l.includes('permission denied'))).toBe(true);
  });
});

describe('execLine: the full repair story', () => {
  it('walks through the whole chapter-01 puzzle to a successful boot', () => {
    let state = createInitialShellState(createInitialFs());

    // The script starts without the executable bit and refuses to run.
    let attempt = run(state, './drivers/nb_init.sh');
    expect(stderr(attempt.lines)).toEqual(['bash: ./drivers/nb_init.sh: Permission denied']);
    expect(attempt.events).toEqual([]);

    // ls -l reveals the missing execute bit.
    const lsLong = run(state, 'ls -l drivers/nb_init.sh');
    expect(stdout(lsLong.lines)[0]).toMatch(/^-rw-r--r--/);

    // chmod +x fixes the permission.
    state = run(state, 'chmod +x drivers/nb_init.sh').state;
    const lsLongAfter = run(state, 'ls -l drivers/nb_init.sh');
    expect(stdout(lsLongAfter.lines)[0]).toMatch(/^-rwxr-xr-x/);

    // Now running the script succeeds and fires the completion event.
    attempt = run(state, './drivers/nb_init.sh');
    expect(attempt.events).toEqual([{ type: 'script-success', script: '/drivers/nb_init.sh' }]);
    expect(stdout(attempt.lines).join('\n')).toContain('northbridge: motor subsystem online');
  });
});

describe('execLine: cd', () => {
  it('changes into a subdirectory and back', () => {
    let state = createInitialShellState(createInitialFs());
    const into = run(state, 'cd drivers');
    expect(into.state.cwd).toEqual(['drivers']);
    state = into.state;
    const pwd = run(state, 'pwd');
    expect(stdout(pwd.lines)).toEqual(['/drivers']);
    const back = run(state, 'cd ..');
    expect(back.state.cwd).toEqual([]);
  });

  it('errors on a missing directory', () => {
    const state = createInitialShellState(createInitialFs());
    const result = run(state, 'cd nope');
    expect(stderr(result.lines)).toEqual(['cd: nope: No such file or directory']);
  });
});

describe('execLine: misc', () => {
  it('reports command not found for unknown commands', () => {
    const state = createInitialShellState(createInitialFs());
    const result = run(state, 'frobnicate');
    expect(stderr(result.lines)).toEqual(['frobnicate: command not found']);
  });

  it('reports a syntax error without throwing', () => {
    const state = createInitialShellState(createInitialFs());
    const result = run(state, 'echo hi >');
    expect(stderr(result.lines).length).toBe(1);
  });
});

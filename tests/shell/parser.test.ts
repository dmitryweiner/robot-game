import { describe, expect, it } from 'vitest';
import { parseLine } from '../../src/games/game-01-repair-console/shell/parser';

describe('parseLine', () => {
  it('parses a bare command with no arguments', () => {
    expect(parseLine('ls')).toEqual({ commands: [{ name: 'ls', args: [], redirections: [] }] });
  });

  it('parses a command with positional arguments', () => {
    expect(parseLine('ls -l drivers')).toEqual({
      commands: [{ name: 'ls', args: ['-l', 'drivers'], redirections: [] }],
    });
  });

  it('keeps quoted strings as a single argument', () => {
    expect(parseLine('echo "проверка проверка"')).toEqual({
      commands: [{ name: 'echo', args: ['проверка проверка'], redirections: [] }],
    });
  });

  it('parses output redirection', () => {
    expect(parseLine('echo "hi" > /tmp/test.txt')).toEqual({
      commands: [
        {
          name: 'echo',
          args: ['hi'],
          redirections: [{ type: '>', target: '/tmp/test.txt' }],
        },
      ],
    });
  });

  it('parses append redirection', () => {
    expect(parseLine('echo "hi" >> /tmp/test.txt')).toEqual({
      commands: [
        {
          name: 'echo',
          args: ['hi'],
          redirections: [{ type: '>>', target: '/tmp/test.txt' }],
        },
      ],
    });
  });

  it('parses input redirection', () => {
    expect(parseLine('wc -l < /tmp/test.txt')).toEqual({
      commands: [
        {
          name: 'wc',
          args: ['-l'],
          redirections: [{ type: '<', target: '/tmp/test.txt' }],
        },
      ],
    });
  });

  it('parses stderr redirection and merge-to-stdout', () => {
    expect(parseLine('ls /nope > out.txt 2> err.txt')).toEqual({
      commands: [
        {
          name: 'ls',
          args: ['/nope'],
          redirections: [
            { type: '>', target: 'out.txt' },
            { type: '2>', target: 'err.txt' },
          ],
        },
      ],
    });
    expect(parseLine('ls /nope > all.txt 2>&1')).toEqual({
      commands: [
        {
          name: 'ls',
          args: ['/nope'],
          redirections: [
            { type: '>', target: 'all.txt' },
            { type: '2>&1' },
          ],
        },
      ],
    });
  });

  it('splits a pipeline on |', () => {
    expect(parseLine('journalctl | tail -n 500 | grep ERROR')).toEqual({
      commands: [
        { name: 'journalctl', args: [], redirections: [] },
        { name: 'tail', args: ['-n', '500'], redirections: [] },
        { name: 'grep', args: ['ERROR'], redirections: [] },
      ],
    });
  });

  it('returns empty commands for a blank line', () => {
    expect(parseLine('   ')).toEqual({ commands: [] });
  });

  it('reports a syntax error for a dangling redirection', () => {
    const result = parseLine('echo hi >');
    expect(result.commands).toEqual([]);
    expect(result.error).toBeTruthy();
  });

  it('reports a syntax error for an empty pipeline segment', () => {
    const result = parseLine('ls | | grep x');
    expect(result.commands).toEqual([]);
    expect(result.error).toBeTruthy();
  });
});

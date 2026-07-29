import { describe, expect, it } from 'vitest';
import {
  createInitialFs,
  formatPath,
  getNode,
  globMatch,
  listDir,
  resolvePath,
  setExecutable,
  writeFile,
} from '../../src/games/game-01-repair-console/shell/fs';

describe('resolvePath', () => {
  it('resolves an absolute path', () => {
    expect(resolvePath(['drivers'], '/tmp')).toEqual(['tmp']);
  });

  it('resolves a relative path against cwd', () => {
    expect(resolvePath(['drivers'], 'nb_init.sh')).toEqual(['drivers', 'nb_init.sh']);
  });

  it('handles .. and .', () => {
    expect(resolvePath(['drivers'], '../tmp')).toEqual(['tmp']);
    expect(resolvePath(['drivers'], './nb_init.sh')).toEqual(['drivers', 'nb_init.sh']);
  });

  it('never goes above root', () => {
    expect(resolvePath([], '..')).toEqual([]);
  });
});

describe('formatPath', () => {
  it('formats the root path', () => {
    expect(formatPath([])).toBe('/');
  });

  it('formats a nested path', () => {
    expect(formatPath(['drivers', 'nb_init.sh'])).toBe('/drivers/nb_init.sh');
  });
});

describe('createInitialFs', () => {
  it('has the drivers directory with nb_init.sh non-executable', () => {
    const fs = createInitialFs();
    const node = getNode(fs, ['drivers', 'nb_init.sh']);
    expect(node?.type).toBe('file');
    expect(node && node.type === 'file' && node.executable).toBe(false);
  });

  it('lists the expected root entries', () => {
    const fs = createInitialFs();
    const names = listDir(fs).map(([name]) => name);
    expect(names).toContain('drivers');
    expect(names).toContain('tmp');
  });
});

describe('writeFile', () => {
  it('creates a new file with the given content', () => {
    const fs = createInitialFs();
    const next = writeFile(fs, ['tmp', 'test.txt'], 'проверка', false);
    const node = getNode(next, ['tmp', 'test.txt']);
    expect(node?.type).toBe('file');
    expect(node && node.type === 'file' && node.content).toBe('проверка');
  });

  it('does not mutate the original fs (immutability)', () => {
    const fs = createInitialFs();
    writeFile(fs, ['tmp', 'test.txt'], 'проверка', false);
    expect(getNode(fs, ['tmp', 'test.txt'])).toBeUndefined();
  });

  it('overwrites existing content by default', () => {
    let fs = createInitialFs();
    fs = writeFile(fs, ['tmp', 'test.txt'], 'first', false);
    fs = writeFile(fs, ['tmp', 'test.txt'], 'second', false);
    const node = getNode(fs, ['tmp', 'test.txt']);
    expect(node && node.type === 'file' && node.content).toBe('second');
  });

  it('appends when append is true', () => {
    let fs = createInitialFs();
    fs = writeFile(fs, ['tmp', 'test.txt'], 'first', false);
    fs = writeFile(fs, ['tmp', 'test.txt'], 'second', true);
    const node = getNode(fs, ['tmp', 'test.txt']);
    expect(node && node.type === 'file' && node.content).toBe('first\nsecond');
  });
});

describe('setExecutable', () => {
  it('flips the executable bit on a clone', () => {
    const fs = createInitialFs();
    const next = setExecutable(fs, ['drivers', 'nb_init.sh'], true);
    const original = getNode(fs, ['drivers', 'nb_init.sh']);
    const updated = getNode(next, ['drivers', 'nb_init.sh']);
    expect(original && original.type === 'file' && original.executable).toBe(false);
    expect(updated && updated.type === 'file' && updated.executable).toBe(true);
  });
});

describe('globMatch', () => {
  it('expands a wildcard against directory entries', () => {
    const fs = createInitialFs();
    const matches = globMatch(fs, [], 'drivers/nb_*');
    expect(matches.sort()).toEqual(
      [
        'drivers/nb_balance.ko',
        'drivers/nb_core.ko',
        'drivers/nb_init.sh',
        'drivers/nb_motor_left.ko',
        'drivers/nb_motor_right.ko',
      ].sort(),
    );
  });

  it('returns an empty list when nothing matches', () => {
    const fs = createInitialFs();
    expect(globMatch(fs, [], 'drivers/zz_*')).toEqual([]);
  });
});

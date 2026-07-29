import { describe, expect, it } from 'vitest';
import { completeInput } from '../../src/games/game-01-repair-console/shell/complete';
import { createInitialFs } from '../../src/games/game-01-repair-console/shell/fs';

const fs = createInitialFs();

describe('completeInput: command names', () => {
  it('completes a unique command prefix, adding a trailing space', () => {
    expect(completeInput('jour', [], fs)).toBe('journalctl ');
  });

  it('returns null when several commands share the prefix', () => {
    expect(completeInput('c', [], fs)).toBeNull();
  });

  it('returns null when the word is already a full command', () => {
    expect(completeInput('ls', [], fs)).toBeNull();
  });
});

describe('completeInput: paths', () => {
  it('completes a unique file name inside a directory, adding a trailing space', () => {
    expect(completeInput('ls drivers/nb_ba', [], fs)).toBe('ls drivers/nb_balance.ko ');
  });

  it('completes a directory name with a trailing slash and no space', () => {
    expect(completeInput('ls driv', [], fs)).toBe('ls drivers/');
  });

  it('completes relative to the current working directory', () => {
    expect(completeInput('cat nb_in', ['drivers'], fs)).toBe('cat nb_init.sh ');
  });

  it('returns null when multiple entries share the prefix', () => {
    expect(completeInput('ls drivers/nb_', [], fs)).toBeNull();
  });

  it('returns null when nothing matches', () => {
    expect(completeInput('ls drivers/zz', [], fs)).toBeNull();
  });

  it('returns null when the directory in the path does not exist', () => {
    expect(completeInput('ls nope/what', [], fs)).toBeNull();
  });
});

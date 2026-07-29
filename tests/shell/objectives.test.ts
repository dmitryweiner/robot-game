import { describe, expect, it } from 'vitest';
import { detectStageIndex } from '../../src/games/game-01-repair-console/objectives';
import { createInitialFs } from '../../src/games/game-01-repair-console/shell/fs';
import { createInitialShellState, execLine } from '../../src/games/game-01-repair-console/shell/interpreter';

function exec(line: string) {
  const state = createInitialShellState(createInitialFs());
  return execLine(line, state);
}

describe('detectStageIndex', () => {
  it('detects exploring the drivers directory', () => {
    expect(detectStageIndex('ls drivers', exec('ls drivers'))).toBe(0);
  });

  it('does not advance on an unrelated command', () => {
    expect(detectStageIndex('pwd', exec('pwd'))).toBeNull();
  });

  it('detects finding the nb_motor_left error via grep', () => {
    const line = 'journalctl | tail -n 500 | grep ERROR';
    expect(detectStageIndex(line, exec(line))).toBe(1);
  });

  it('detects inspecting permissions with ls -l', () => {
    expect(detectStageIndex('ls -l drivers/nb_init.sh', exec('ls -l drivers/nb_init.sh'))).toBe(2);
  });

  it('detects chmod +x on the init script', () => {
    expect(detectStageIndex('chmod +x drivers/nb_init.sh', exec('chmod +x drivers/nb_init.sh'))).toBe(3);
  });
});

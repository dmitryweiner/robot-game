import { describe, expect, it } from 'vitest';
import { poseForProgress } from '../../src/games/game-01-repair-console/pose';

describe('poseForProgress', () => {
  it('is lying while the player is still exploring or reading the journal', () => {
    expect(poseForProgress(0, false)).toBe('lying');
    expect(poseForProgress(3, false)).toBe('lying');
  });

  it('is lifting once the permissions are fixed and a run is imminent', () => {
    expect(poseForProgress(4, false)).toBe('lifting');
  });

  it('is fixed once the puzzle is solved, regardless of stage index', () => {
    expect(poseForProgress(0, true)).toBe('fixed');
    expect(poseForProgress(4, true)).toBe('fixed');
  });
});

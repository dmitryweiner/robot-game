import { describe, expect, it } from 'vitest';
import { poseForProgress } from '../../../src/games/game-02-greenhouse-firmware/pose';

describe('poseForProgress', () => {
  it('is broken while the pumps are still running wild', () => {
    expect(poseForProgress(false, false)).toBe('broken');
  });

  it('is quiet once the pumps are switched off but the firmware is not fixed yet', () => {
    expect(poseForProgress(true, false)).toBe('quiet');
  });

  it('is fixed once the greenhouse is solved, regardless of the switch', () => {
    expect(poseForProgress(true, true)).toBe('fixed');
    expect(poseForProgress(false, true)).toBe('fixed');
  });
});

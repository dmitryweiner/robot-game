import { describe, expect, it } from 'vitest';
import {
  DEFAULT_THRESHOLD,
  parseThreshold,
  renderFirmwareSource,
  shouldWater,
} from '../../../src/games/game-02-greenhouse-firmware/firmware';

describe('renderFirmwareSource / parseThreshold', () => {
  it('round-trips the default threshold', () => {
    expect(parseThreshold(renderFirmwareSource(DEFAULT_THRESHOLD))).toBe(DEFAULT_THRESHOLD);
  });

  it('round-trips an edited threshold', () => {
    expect(parseThreshold(renderFirmwareSource(40))).toBe(40);
  });

  it('finds the constant regardless of surrounding edits', () => {
    const source = renderFirmwareSource(30).replace('DRY_SOIL 30', 'DRY_SOIL 45');
    expect(parseThreshold(source)).toBe(45);
  });

  it('returns null when the constant is missing or broken', () => {
    expect(parseThreshold('int main() { return 0; }')).toBeNull();
    expect(parseThreshold(renderFirmwareSource(30).replace('#define DRY_SOIL 30', ''))).toBeNull();
  });
});

describe('shouldWater', () => {
  // Transcript from the chapter's own JS REPL session, threshold raised to 40.
  it('waters very dry soil', () => {
    expect(shouldWater(20, 25, 500, 40)).toBe(true);
  });

  it('does not water moist, cool, dim soil', () => {
    expect(shouldWater(70, 22, 300, 40)).toBe(false);
  });

  it('does not water when air is too hot, even if soil is a bit dry', () => {
    expect(shouldWater(45, 38, 700, 40)).toBe(false);
  });

  it('waters under strong sun with tolerable air temperature', () => {
    expect(shouldWater(45, 30, 900, 40)).toBe(true);
  });

  it('treats the threshold as a strict less-than at the boundary', () => {
    expect(shouldWater(40, 25, 500, 40)).toBe(false);
    expect(shouldWater(39, 25, 500, 40)).toBe(true);
  });

  it('is false for everything when the firmware is still stuck on the old threshold', () => {
    // The exact greenhouse readout from the end of the chapter: 30 is too low to react to 36%.
    expect(shouldWater(36, 21, 300, 30)).toBe(false);
  });

  it('reacts to the same readout once the threshold is raised past it', () => {
    expect(shouldWater(36, 21, 300, 40)).toBe(true);
  });
});

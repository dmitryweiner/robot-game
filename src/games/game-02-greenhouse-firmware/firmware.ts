export const DEFAULT_THRESHOLD = 30;

/**
 * The controller's firmware source, exactly as the boy finds it on the
 * flash drive — only `DRY_SOIL` varies, everything else is flavour that the
 * game never parses.
 */
export function renderFirmwareSource(threshold: number): string {
  return `// gh-firmware, version 0.7, март
// Прошивка контроллера теплицы GH-CTRL

#define DRY_SOIL ${threshold}

bool should_water(int moisture, int air_temp, int sun) {
    if (moisture < DRY_SOIL && air_temp < 35) return true;
    if (sun > 800 && moisture < 50)           return true;
    return false;
}
`;
}

const THRESHOLD_PATTERN = /#define\s+DRY_SOIL\s+(\d+)/;

/** Extracts the DRY_SOIL constant from source text, or null if it's missing/broken. */
export function parseThreshold(source: string): number | null {
  const match = THRESHOLD_PATTERN.exec(source);
  if (match === null) {
    return null;
  }
  const [, digits] = match;
  return Number.parseInt(digits, 10);
}

/** Direct port of `should_water` from the chapter, with the threshold as a parameter. */
export function shouldWater(moisture: number, airTemp: number, sun: number, threshold: number): boolean {
  if (moisture < threshold && airTemp < 35) return true;
  if (sun > 800 && moisture < 50) return true;
  return false;
}

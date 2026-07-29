import { shouldWater } from './firmware';
import type { TerminalLine } from './terminal';

/**
 * Deliberately not a real JS `eval`/`Function` sandbox: the chapter's REPL
 * scene only ever calls `shouldWater(moisture, airTemp, sun)`, so that is
 * the only input this recognises. Narrower, but safe — no arbitrary code
 * execution on user input.
 */
const CALL_PATTERN = /^shouldWater\(\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*\)$/;

export function runReplLine(line: string, threshold: number): TerminalLine[] {
  const trimmed = line.trim();
  if (trimmed === '') {
    return [];
  }

  const match = CALL_PATTERN.exec(trimmed);
  if (match === null) {
    return [
      {
        stream: 'stderr',
        text: 'Эта песочница понимает только вызовы shouldWater(влажность, температура, солнце).',
      },
    ];
  }

  const [, moistureText, airTempText, sunText] = match;
  const moisture = Number.parseInt(moistureText, 10);
  const airTemp = Number.parseInt(airTempText, 10);
  const sun = Number.parseInt(sunText, 10);
  const result = shouldWater(moisture, airTemp, sun, threshold);
  return [{ stream: 'stdout', text: String(result) }];
}

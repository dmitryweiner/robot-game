import { describe, expect, it } from 'vitest';
import { runReplLine } from '../../../src/games/game-02-greenhouse-firmware/repl';

describe('runReplLine', () => {
  it('evaluates a shouldWater call against the given threshold', () => {
    expect(runReplLine('shouldWater(20, 25, 500)', 40)).toEqual([{ stream: 'stdout', text: 'true' }]);
    expect(runReplLine('shouldWater(70, 22, 300)', 40)).toEqual([{ stream: 'stdout', text: 'false' }]);
  });

  it('reacts to the threshold currently in the (unsaved or saved) editor', () => {
    expect(runReplLine('shouldWater(36, 21, 300)', 30)).toEqual([{ stream: 'stdout', text: 'false' }]);
    expect(runReplLine('shouldWater(36, 21, 300)', 40)).toEqual([{ stream: 'stdout', text: 'true' }]);
  });

  it('tolerates extra whitespace', () => {
    expect(runReplLine('shouldWater( 40 , 25 , 500 )', 40)).toEqual([{ stream: 'stdout', text: 'false' }]);
  });

  it('does nothing for an empty line', () => {
    expect(runReplLine('   ', 40)).toEqual([]);
  });

  it('rejects anything that is not a shouldWater call, without evaluating arbitrary code', () => {
    const cases = ['2 + 2', 'shouldWater(1, 2)', 'shouldwater(1, 2, 3)', 'alert(1)', 'shouldWater(1, 2, 3, 4)'];
    for (const line of cases) {
      const result = runReplLine(line, 40);
      expect(result).toHaveLength(1);
      expect(result[0].stream).toBe('stderr');
    }
  });
});

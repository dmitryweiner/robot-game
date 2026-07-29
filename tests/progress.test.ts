import { beforeEach, describe, expect, it } from 'vitest';
import {
  isGameCompleted,
  isGameUnlocked,
  loadProgress,
  markGameCompleted,
  markIntroSeen,
  STORAGE_KEY,
} from '../src/progress/progress';

const GAME_ORDER = ['game-01', 'game-02', 'game-03'];
const EMPTY = { completedGameIds: [], introSeen: false };

beforeEach(() => {
  localStorage.clear();
});

describe('loadProgress', () => {
  it('returns an empty progress when nothing is stored', () => {
    expect(loadProgress()).toEqual(EMPTY);
  });

  it('returns an empty progress when the stored value is corrupted JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not-json');
    expect(loadProgress()).toEqual(EMPTY);
  });

  it('returns an empty progress when the stored value has the wrong shape', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ completedGameIds: 'nope', introSeen: false }));
    expect(loadProgress()).toEqual(EMPTY);
  });

  it('returns an empty progress when introSeen is missing (old/foreign data)', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ completedGameIds: [] }));
    expect(loadProgress()).toEqual(EMPTY);
  });
});

describe('markGameCompleted', () => {
  it('persists the completed game id', () => {
    markGameCompleted('game-01');
    expect(loadProgress().completedGameIds).toEqual(['game-01']);
  });

  it('does not duplicate an already completed game id', () => {
    markGameCompleted('game-01');
    markGameCompleted('game-01');
    expect(loadProgress().completedGameIds).toEqual(['game-01']);
  });

  it('accumulates multiple completed games', () => {
    markGameCompleted('game-01');
    markGameCompleted('game-02');
    expect(loadProgress().completedGameIds).toEqual(['game-01', 'game-02']);
  });

  it('does not clobber introSeen', () => {
    markIntroSeen();
    markGameCompleted('game-01');
    expect(loadProgress().introSeen).toBe(true);
  });
});

describe('markIntroSeen', () => {
  it('persists that the intro was dismissed', () => {
    expect(loadProgress().introSeen).toBe(false);
    markIntroSeen();
    expect(loadProgress().introSeen).toBe(true);
  });

  it('does not clobber completed games', () => {
    markGameCompleted('game-01');
    markIntroSeen();
    expect(loadProgress().completedGameIds).toEqual(['game-01']);
  });
});

describe('isGameCompleted', () => {
  it('is false for a game that was never completed', () => {
    expect(isGameCompleted('game-01', loadProgress())).toBe(false);
  });

  it('is true after the game was marked completed', () => {
    const progress = markGameCompleted('game-01');
    expect(isGameCompleted('game-01', progress)).toBe(true);
  });
});

describe('isGameUnlocked', () => {
  it('always unlocks the first game in the order', () => {
    expect(isGameUnlocked('game-01', GAME_ORDER, loadProgress())).toBe(true);
  });

  it('locks a game whose predecessor is not completed', () => {
    expect(isGameUnlocked('game-02', GAME_ORDER, loadProgress())).toBe(false);
  });

  it('unlocks a game once its predecessor is completed', () => {
    const progress = markGameCompleted('game-01');
    expect(isGameUnlocked('game-02', GAME_ORDER, progress)).toBe(true);
    expect(isGameUnlocked('game-03', GAME_ORDER, progress)).toBe(false);
  });

  it('returns false for a game id absent from the order', () => {
    expect(isGameUnlocked('unknown-game', GAME_ORDER, loadProgress())).toBe(false);
  });
});

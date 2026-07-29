import { describe, expect, it } from 'vitest';
import { parseHash, routeToHash } from '../../src/routing/useHashRoute';

describe('parseHash', () => {
  it('treats an empty hash as the hub', () => {
    expect(parseHash('')).toEqual({ screen: 'hub' });
  });

  it('treats "#/" as the hub', () => {
    expect(parseHash('#/')).toEqual({ screen: 'hub' });
  });

  it('parses a game route', () => {
    expect(parseHash('#/game/game-01')).toEqual({ screen: 'game', gameId: 'game-01' });
  });

  it('falls back to the hub for an unrecognized hash', () => {
    expect(parseHash('#/nonsense')).toEqual({ screen: 'hub' });
  });
});

describe('routeToHash', () => {
  it('formats the hub route', () => {
    expect(routeToHash({ screen: 'hub' })).toBe('#/');
  });

  it('formats a game route', () => {
    expect(routeToHash({ screen: 'game', gameId: 'game-01' })).toBe('#/game/game-01');
  });
});

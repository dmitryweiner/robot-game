import { describe, expect, it } from 'vitest';
import { COMMAND_MAN_PAGES, OPERATOR_MAN_PAGES } from '../../src/games/game-01-repair-console/manPages';
import { COMMAND_NAMES } from '../../src/games/game-01-repair-console/shell/commands';

describe('COMMAND_MAN_PAGES', () => {
  it('documents every command the shell actually implements', () => {
    for (const name of COMMAND_NAMES) {
      expect(COMMAND_MAN_PAGES[name], `missing man page for "${name}"`).toBeDefined();
    }
  });

  it('does not document commands that do not exist', () => {
    for (const name of Object.keys(COMMAND_MAN_PAGES)) {
      expect(COMMAND_NAMES, `"${name}" has a man page but isn't a real command`).toContain(name);
    }
  });

  it('gives every entry a non-empty synopsis and description', () => {
    for (const [name, entry] of Object.entries(COMMAND_MAN_PAGES)) {
      expect(entry.name, name).toBe(name);
      expect(entry.synopsis.length, `${name} synopsis`).toBeGreaterThan(0);
      expect(entry.description.length, `${name} description`).toBeGreaterThan(0);
    }
  });
});

describe('OPERATOR_MAN_PAGES', () => {
  it('covers the redirection and pipe operators used in this chapter', () => {
    const names = OPERATOR_MAN_PAGES.map((entry) => entry.name);
    expect(names).toEqual(expect.arrayContaining(['|', '>', '>>', '<', '2>', '2>&1']));
  });

  it('gives every entry a non-empty synopsis and description', () => {
    for (const entry of OPERATOR_MAN_PAGES) {
      expect(entry.synopsis.length, `${entry.name} synopsis`).toBeGreaterThan(0);
      expect(entry.description.length, `${entry.name} description`).toBeGreaterThan(0);
    }
  });
});

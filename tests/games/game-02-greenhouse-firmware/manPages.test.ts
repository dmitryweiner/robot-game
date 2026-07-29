import { describe, expect, it } from 'vitest';
import { COMMAND_MAN_PAGES } from '../../../src/games/game-02-greenhouse-firmware/manPages';
import { BUILD_COMMAND_NAMES } from '../../../src/games/game-02-greenhouse-firmware/terminal';

describe('COMMAND_MAN_PAGES', () => {
  it('documents every command the build terminal actually implements', () => {
    for (const name of BUILD_COMMAND_NAMES) {
      expect(COMMAND_MAN_PAGES[name], `missing man page for "${name}"`).toBeDefined();
    }
  });

  it('does not document commands that do not exist', () => {
    for (const name of Object.keys(COMMAND_MAN_PAGES)) {
      expect(BUILD_COMMAND_NAMES, `"${name}" has a man page but isn't a real command`).toContain(name);
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

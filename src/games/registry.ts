import { RepairConsoleGame } from './game-01-repair-console/RepairConsoleGame';
import type { GameDescriptor } from './types';

export const GAMES: GameDescriptor[] = [
  {
    id: 'game-01',
    chapterNumber: 1,
    title: 'Ремонтная консоль',
    shortDescription:
      'У робота отказали драйверы северного моста. Разберись в консоли Linux — файлы, права доступа, потоки и трубы — и запусти скрипт заново.',
    Component: RepairConsoleGame,
  },
];

export const GAME_ORDER = GAMES.map((game) => game.id);

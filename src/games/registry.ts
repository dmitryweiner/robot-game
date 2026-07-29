import { RepairConsoleGame } from './game-01-repair-console/RepairConsoleGame';
import { GreenhouseFirmwareGame } from './game-02-greenhouse-firmware/GreenhouseFirmwareGame';
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
  {
    id: 'game-02',
    chapterNumber: 2,
    title: 'Прошивка теплицы',
    shortDescription:
      'У контроллера теплицы слетела прошивка, оба насоса гонят воду вхолостую. Поправь исходник, собери прошивку под нужный процессор, проверь логику в REPL и залей.',
    Component: GreenhouseFirmwareGame,
  },
];

export const GAME_ORDER = GAMES.map((game) => game.id);

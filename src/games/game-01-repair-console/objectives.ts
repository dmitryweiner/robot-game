import type { ExecResult } from './shell/interpreter';

export interface Stage {
  id: string;
  hint: string;
  /** The exact command that satisfies this stage — shown behind the (?) hint button. */
  command: string;
}

export const STAGES: Stage[] = [
  {
    id: 'explore',
    hint: 'Посмотри, какие драйверы вообще стоят в системе: папка drivers, файлы nb_*.',
    command: 'ls drivers',
  },
  {
    id: 'journal',
    hint: 'В журнале должна быть причина сбоя. Собери из journalctl, tail и grep всё, что помечено ERROR.',
    command: 'journalctl | tail -n 500 | grep ERROR',
  },
  {
    id: 'permissions',
    hint: 'Разберись подробнее в правах: используй ls -l для файла drivers/nb_init.sh.',
    command: 'ls -l drivers/nb_init.sh',
  },
  {
    id: 'chmod',
    hint: 'Файлу не хватает права на исполнение. Исправь через chmod +x.',
    command: 'chmod +x drivers/nb_init.sh',
  },
  {
    id: 'run',
    hint: 'Теперь запусти скрипт: ./drivers/nb_init.sh',
    command: './drivers/nb_init.sh',
  },
];

/**
 * Returns the index of the stage that was just satisfied by this command, or
 * null if the line didn't advance the story. Purely a hint-progression
 * heuristic — it never blocks the player from typing ahead.
 */
export function detectStageIndex(line: string, result: ExecResult): number | null {
  const trimmed = line.trim();

  if (/^chmod\s+\+x\b.*nb_init\.sh/.test(trimmed)) {
    return 3;
  }
  if (/^ls\s+-l\b.*nb_init\.sh/.test(trimmed)) {
    return 2;
  }
  const foundMotorError = result.lines.some(
    (l) => l.stream === 'stdout' && l.text.includes('ERROR') && l.text.includes('nb_motor_left'),
  );
  if (foundMotorError) {
    return 1;
  }
  if (/^ls\b.*drivers/.test(trimmed)) {
    return 0;
  }
  return null;
}

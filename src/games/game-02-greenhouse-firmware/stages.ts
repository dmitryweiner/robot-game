export interface Stage {
  id: string;
  hint: string;
  /** Shown behind the (?) hint button — the exact thing to do for this stage. */
  command: string;
}

export const STAGES: Stage[] = [
  {
    id: 'pumps-off',
    hint: 'Насосы гудят вхолостую и могут перегореть. Выключи их тумблером PUMPS в сайдбаре.',
    command: 'Нажми «Выключить насосы»',
  },
  {
    id: 'edit-threshold',
    hint:
      'Порог сухости DRY_SOIL в firmware.c стоит 30 — для нынешней влажности почвы это слишком ' +
      'поздно. Подними число в редакторе.',
    command: 'Замени #define DRY_SOIL 30 на число больше 36, например 40',
  },
  {
    id: 'compile',
    hint: 'Собери прошивку кросс-компилятором — обязательно укажи процессор контроллера флагом -mcpu.',
    command: 'arm-none-eabi-gcc -mcpu=cortex-m3 -O2 firmware.c -o firmware.bin',
  },
  {
    id: 'test',
    hint: 'Прежде чем заливать необратимо, проверь логику в JS REPL на реальных показаниях теплицы.',
    command: 'shouldWater(36, 21, 300)',
  },
  {
    id: 'flash',
    hint: 'Всё готово — залей собранную прошивку в контроллер.',
    command: 'flash --target gh-ctrl firmware.bin',
  },
];

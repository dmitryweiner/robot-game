import type { ManPageEntry } from '../../components/CommandReference';

export type { ManPageEntry };

/**
 * One entry per command the build terminal actually implements
 * (`BUILD_COMMAND_NAMES`). Only two exist in this chapter — a cross
 * compiler and a flashing tool — unlike the general-purpose shell in
 * chapter 01.
 */
export const COMMAND_MAN_PAGES: Record<string, ManPageEntry> = {
  'arm-none-eabi-gcc': {
    name: 'arm-none-eabi-gcc',
    synopsis: 'arm-none-eabi-gcc -mcpu=cortex-m3 -O2 firmware.c -o firmware.bin',
    description:
      'Кросс-компилятор: переводит firmware.c с человеческого текста в машинный код именно ' +
      'того процессора, который указан флагом -mcpu. Без этого флага компилятор не знает, для ' +
      'какого чипа собирать, и отказывается работать. Молчание после запуска — хороший знак: ' +
      'если бы что-то не сошлось, компилятор бы пожаловался.',
  },
  flash: {
    name: 'flash',
    synopsis: 'flash --target gh-ctrl firmware.bin',
    description:
      'Заливает собранный машинный код в память контроллера. Требует уже собранного ' +
      'firmware.bin — сама по себе правка firmware.c на него не влияет, пока файл не пересобран ' +
      'заново компилятором.',
  },
};

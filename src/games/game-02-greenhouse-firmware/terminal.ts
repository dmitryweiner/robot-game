import { parseThreshold } from './firmware';

/** The only processor this board actually has — flashing anything else fails. */
export const TARGET_CPU = 'cortex-m3';

/** The complete set of commands the build terminal understands. */
export const BUILD_COMMAND_NAMES: string[] = ['arm-none-eabi-gcc', 'flash'];

export interface TerminalLine {
  stream: 'stdout' | 'stderr';
  text: string;
}

export interface CompiledArtifact {
  threshold: number;
  target: string;
}

export interface BuildCommandResult {
  lines: TerminalLine[];
  /** Present only when this command produced a fresh compiled artifact (gcc). */
  artifact?: CompiledArtifact;
  /** Present only when this command successfully flashed a device (flash). */
  deviceThreshold?: number;
}

interface BuildContext {
  /** The currently saved firmware.c text — read fresh on every compile. */
  source: string;
  /** The last successfully compiled artifact, or null if nothing was built yet. */
  artifact: CompiledArtifact | null;
}

function err(text: string): TerminalLine {
  return { stream: 'stderr', text };
}

function runCompile(tokens: string[], source: string): BuildCommandResult {
  if (!tokens.includes('firmware.c')) {
    return { lines: [err('arm-none-eabi-gcc: не найден исходный файл firmware.c')] };
  }

  const outputIndex = tokens.indexOf('-o');
  if (outputIndex === -1 || tokens[outputIndex + 1] !== 'firmware.bin') {
    return { lines: [err('arm-none-eabi-gcc: не указан выходной файл — добавь -o firmware.bin')] };
  }

  const targetFlag = tokens.find((token) => token.startsWith('-mcpu='));
  if (targetFlag === undefined) {
    return {
      lines: [
        err(
          'arm-none-eabi-gcc: не указан целевой процессор. Добавь флаг -mcpu=..., иначе ' +
            'компилятор не знает, для какого чипа собирать код.',
        ),
      ],
    };
  }

  const threshold = parseThreshold(source);
  if (threshold === null) {
    return { lines: [err('arm-none-eabi-gcc: не нахожу #define DRY_SOIL в исходнике — он повреждён')] };
  }

  const target = targetFlag.slice('-mcpu='.length);
  return { lines: [], artifact: { threshold, target } };
}

function runFlash(tokens: string[], artifact: CompiledArtifact | null): BuildCommandResult {
  if (!tokens.includes('firmware.bin')) {
    return { lines: [err('flash: не указан файл прошивки firmware.bin')] };
  }

  const targetIndex = tokens.indexOf('--target');
  const board = targetIndex === -1 ? undefined : tokens[targetIndex + 1];
  if (board !== 'gh-ctrl') {
    return { lines: [err('flash: не указана плата — добавь --target gh-ctrl')] };
  }

  if (artifact === null) {
    return { lines: [err('flash: нечего заливать — сначала собери прошивку через arm-none-eabi-gcc')] };
  }

  if (artifact.target !== TARGET_CPU) {
    return {
      lines: [
        err(
          `flash: прошивка собрана для другого процессора (-mcpu=${artifact.target}), ` +
            'контроллер её не понимает — как инструкция для трактора, применённая к лопате. ' +
            `Пересобери с -mcpu=${TARGET_CPU}.`,
        ),
      ],
    };
  }

  return { lines: [{ stream: 'stdout', text: 'verify: ok' }], deviceThreshold: artifact.threshold };
}

/** Single entry point for the build terminal — recognises exactly two real commands. */
export function runBuildCommand(line: string, context: BuildContext): BuildCommandResult {
  const trimmed = line.trim();
  if (trimmed === '') {
    return { lines: [] };
  }

  const tokens = trimmed.split(/\s+/);
  const [command] = tokens;

  if (command === 'arm-none-eabi-gcc') {
    return runCompile(tokens, context.source);
  }
  if (command === 'flash') {
    return runFlash(tokens, context.artifact);
  }
  return { lines: [err(`команда не найдена: ${command}`)] };
}

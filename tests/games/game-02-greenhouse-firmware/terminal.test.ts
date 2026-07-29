import { describe, expect, it } from 'vitest';
import { renderFirmwareSource } from '../../../src/games/game-02-greenhouse-firmware/firmware';
import {
  runBuildCommand,
  TARGET_CPU,
  type CompiledArtifact,
} from '../../../src/games/game-02-greenhouse-firmware/terminal';

const GOOD_SOURCE = renderFirmwareSource(40);
const COMPILE_OK = `arm-none-eabi-gcc -mcpu=${TARGET_CPU} -O2 firmware.c -o firmware.bin`;

describe('compiling', () => {
  it('compiles successfully and silently when the target flag matches the board', () => {
    const result = runBuildCommand(COMPILE_OK, { source: GOOD_SOURCE, artifact: null });
    expect(result.lines).toEqual([]);
    expect(result.artifact).toEqual({ threshold: 40, target: TARGET_CPU });
  });

  it('fails when no target processor flag is given', () => {
    const result = runBuildCommand('arm-none-eabi-gcc -O2 firmware.c -o firmware.bin', {
      source: GOOD_SOURCE,
      artifact: null,
    });
    expect(result.artifact).toBeUndefined();
    expect(result.lines.some((l) => l.stream === 'stderr')).toBe(true);
  });

  it('compiles for the wrong processor without complaining yet (mirrors the shovel/tractor point)', () => {
    const result = runBuildCommand('arm-none-eabi-gcc -mcpu=cortex-m4 -O2 firmware.c -o firmware.bin', {
      source: GOOD_SOURCE,
      artifact: null,
    });
    expect(result.artifact).toEqual({ threshold: 40, target: 'cortex-m4' });
  });

  it('fails when firmware.c is missing from the command', () => {
    const result = runBuildCommand(`arm-none-eabi-gcc -mcpu=${TARGET_CPU} -o firmware.bin`, {
      source: GOOD_SOURCE,
      artifact: null,
    });
    expect(result.artifact).toBeUndefined();
  });

  it('fails when -o firmware.bin is missing', () => {
    const result = runBuildCommand(`arm-none-eabi-gcc -mcpu=${TARGET_CPU} -O2 firmware.c`, {
      source: GOOD_SOURCE,
      artifact: null,
    });
    expect(result.artifact).toBeUndefined();
  });

  it('fails when the source has no DRY_SOIL constant left', () => {
    const brokenSource = GOOD_SOURCE.replace('#define DRY_SOIL 40', '');
    const result = runBuildCommand(COMPILE_OK, { source: brokenSource, artifact: null });
    expect(result.artifact).toBeUndefined();
    expect(result.lines.some((l) => l.stream === 'stderr')).toBe(true);
  });
});

describe('flashing', () => {
  const artifact: CompiledArtifact = { threshold: 40, target: TARGET_CPU };
  const FLASH_OK = 'flash --target gh-ctrl firmware.bin';

  it('flashes successfully and reports verify: ok', () => {
    const result = runBuildCommand(FLASH_OK, { source: GOOD_SOURCE, artifact });
    expect(result.deviceThreshold).toBe(40);
    expect(result.lines.some((l) => l.text.includes('verify: ok'))).toBe(true);
  });

  it('refuses to flash when nothing has been compiled yet', () => {
    const result = runBuildCommand(FLASH_OK, { source: GOOD_SOURCE, artifact: null });
    expect(result.deviceThreshold).toBeUndefined();
    expect(result.lines.some((l) => l.stream === 'stderr')).toBe(true);
  });

  it('refuses to flash a binary built for a different processor', () => {
    const wrongArtifact: CompiledArtifact = { threshold: 40, target: 'cortex-m4' };
    const result = runBuildCommand(FLASH_OK, { source: GOOD_SOURCE, artifact: wrongArtifact });
    expect(result.deviceThreshold).toBeUndefined();
    expect(result.lines.some((l) => l.stream === 'stderr')).toBe(true);
  });

  it('uses the compiled snapshot, not a newer live source that was never recompiled', () => {
    const editedButNotRecompiledSource = renderFirmwareSource(45);
    const staleArtifact: CompiledArtifact = { threshold: 30, target: TARGET_CPU };
    const result = runBuildCommand(FLASH_OK, {
      source: editedButNotRecompiledSource,
      artifact: staleArtifact,
    });
    expect(result.deviceThreshold).toBe(30);
  });

  it('rejects an unrelated board name', () => {
    const result = runBuildCommand('flash --target other-board firmware.bin', {
      source: GOOD_SOURCE,
      artifact,
    });
    expect(result.deviceThreshold).toBeUndefined();
  });
});

describe('unknown input', () => {
  it('reports command not found for a plain gcc invocation', () => {
    const result = runBuildCommand('gcc firmware.c -o firmware.bin', { source: GOOD_SOURCE, artifact: null });
    expect(result.lines.some((l) => l.stream === 'stderr')).toBe(true);
  });

  it('does nothing for an empty line', () => {
    const result = runBuildCommand('   ', { source: GOOD_SOURCE, artifact: null });
    expect(result.lines).toEqual([]);
  });
});

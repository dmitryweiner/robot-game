import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { GreenhouseFirmwareGame } from '../../../src/games/game-02-greenhouse-firmware/GreenhouseFirmwareGame';
import { STAGES } from '../../../src/games/game-02-greenhouse-firmware/stages';

async function dismissIntro(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Начать' }));
}

async function runIn(user: ReturnType<typeof userEvent.setup>, label: string, command: string) {
  const input = screen.getByRole('textbox', { name: label });
  await user.type(input, `${command}{Enter}`);
}

function setSource(value: string) {
  const textarea = screen.getByRole('textbox', { name: 'Исходный код firmware.c' });
  fireEvent.change(textarea, { target: { value } });
}

describe('GreenhouseFirmwareGame', () => {
  it('shows the story intro before the editor and consoles', () => {
    render(<GreenhouseFirmwareGame onComplete={() => {}} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Исходный код firmware.c' })).not.toBeInTheDocument();
  });

  it('starts on the first hint after dismissing the intro', async () => {
    const user = userEvent.setup();
    render(<GreenhouseFirmwareGame onComplete={() => {}} />);
    await dismissIntro(user);
    expect(screen.getByText(STAGES[0].hint)).toBeInTheDocument();
  });

  it('advances the hint once the pumps are switched off', async () => {
    const user = userEvent.setup();
    render(<GreenhouseFirmwareGame onComplete={() => {}} />);
    await dismissIntro(user);
    await user.click(screen.getByRole('button', { name: 'Выключить насосы' }));
    expect(screen.getByText(STAGES[1].hint)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Выключить насосы' })).not.toBeInTheDocument();
  });

  it('advances the hint once the threshold is edited above the default', async () => {
    const user = userEvent.setup();
    render(<GreenhouseFirmwareGame onComplete={() => {}} />);
    await dismissIntro(user);
    setSource('#define DRY_SOIL 40\n');
    expect(screen.getByText(STAGES[2].hint)).toBeInTheDocument();
  });

  it('walks through compiling, testing in the REPL, and flashing to a solved state', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<GreenhouseFirmwareGame onComplete={onComplete} />);
    await dismissIntro(user);

    setSource('#define DRY_SOIL 40\n');
    await runIn(user, 'Терминал сборки', 'arm-none-eabi-gcc -mcpu=cortex-m3 -O2 firmware.c -o firmware.bin');
    expect(screen.getByText(STAGES[3].hint)).toBeInTheDocument();

    await runIn(user, 'JS REPL', 'shouldWater(36, 21, 300)');
    expect(await screen.findByText('true')).toBeInTheDocument();
    expect(screen.getByText(STAGES[4].hint)).toBeInTheDocument();

    await runIn(user, 'Терминал сборки', 'flash --target gh-ctrl firmware.bin');

    expect(await screen.findByText(/проклюнулись/)).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Продолжить' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('does not solve the greenhouse if the threshold is left too low', async () => {
    const user = userEvent.setup();
    render(<GreenhouseFirmwareGame onComplete={() => {}} />);
    await dismissIntro(user);

    await runIn(user, 'Терминал сборки', 'arm-none-eabi-gcc -mcpu=cortex-m3 -O2 firmware.c -o firmware.bin');
    await runIn(user, 'Терминал сборки', 'flash --target gh-ctrl firmware.bin');

    expect(await screen.findByText('verify: ok')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Продолжить' })).not.toBeInTheDocument();
  });

  it('refuses to flash a binary compiled for the wrong processor', async () => {
    const user = userEvent.setup();
    render(<GreenhouseFirmwareGame onComplete={() => {}} />);
    await dismissIntro(user);

    await runIn(user, 'Терминал сборки', 'arm-none-eabi-gcc -mcpu=cortex-m4 -O2 firmware.c -o firmware.bin');
    await runIn(user, 'Терминал сборки', 'flash --target gh-ctrl firmware.bin');

    expect(await screen.findByText(/другого процессора/)).toBeInTheDocument();
  });

  it('opens and closes a man page for a build command', async () => {
    const user = userEvent.setup();
    render(<GreenhouseFirmwareGame onComplete={() => {}} />);
    await dismissIntro(user);

    await user.click(screen.getByRole('button', { name: 'man flash' }));
    const dialog = screen.getByRole('dialog', { name: /man flash/ });
    expect(dialog).toHaveTextContent('flash --target gh-ctrl firmware.bin');

    await user.click(screen.getByRole('button', { name: 'Закрыть' }));
    expect(screen.queryByRole('dialog', { name: /man flash/ })).not.toBeInTheDocument();
  });
});

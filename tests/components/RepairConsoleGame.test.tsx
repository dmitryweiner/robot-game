import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RepairConsoleGame } from '../../src/games/game-01-repair-console/RepairConsoleGame';
import { STAGES } from '../../src/games/game-01-repair-console/objectives';

async function type(user: ReturnType<typeof userEvent.setup>, text: string) {
  const input = screen.getByRole('textbox', { name: 'Командная строка' });
  await user.type(input, `${text}{Enter}`);
}

async function dismissIntro(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Начать' }));
}

describe('RepairConsoleGame', () => {
  it('shows the story intro before the terminal', () => {
    render(<RepairConsoleGame onComplete={() => {}} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Командная строка' })).not.toBeInTheDocument();
  });

  it('starts on the first hint after dismissing the intro', async () => {
    const user = userEvent.setup();
    render(<RepairConsoleGame onComplete={() => {}} />);
    await dismissIntro(user);
    expect(screen.getByText(STAGES[0].hint)).toBeInTheDocument();
  });

  it('advances the hint as the player explores drivers', async () => {
    const user = userEvent.setup();
    render(<RepairConsoleGame onComplete={() => {}} />);
    await dismissIntro(user);
    await type(user, 'ls drivers');
    expect(screen.getByText(STAGES[1].hint)).toBeInTheDocument();
  });

  it('reveals the exact command for the current stage via the hint button', async () => {
    const user = userEvent.setup();
    render(<RepairConsoleGame onComplete={() => {}} />);
    await dismissIntro(user);
    await user.click(screen.getByRole('button', { name: 'Показать подсказку' }));
    expect(screen.getByText(STAGES[0].command)).toBeInTheDocument();
  });

  it('reaches the solved state and calls onComplete after the full repair sequence', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<RepairConsoleGame onComplete={onComplete} />);
    await dismissIntro(user);

    await type(user, 'ls drivers');
    await type(user, 'journalctl | tail -n 500 | grep ERROR');
    await type(user, 'ls -l drivers/nb_init.sh');
    await type(user, 'chmod +x drivers/nb_init.sh');
    await type(user, './drivers/nb_init.sh');

    expect(await screen.findByText(/Северный мост поднят/)).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Продолжить' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('opens a man page for a command link and closes it again', async () => {
    const user = userEvent.setup();
    render(<RepairConsoleGame onComplete={() => {}} />);
    await dismissIntro(user);

    await user.click(screen.getByRole('button', { name: 'man ls' }));
    const dialog = screen.getByRole('dialog', { name: /man ls/ });
    expect(dialog).toHaveTextContent('ls [-l] [путь...]');

    await user.click(screen.getByRole('button', { name: 'Закрыть' }));
    expect(screen.queryByRole('dialog', { name: /man ls/ })).not.toBeInTheDocument();
  });

  it('opens a man page for an operator link', async () => {
    const user = userEvent.setup();
    render(<RepairConsoleGame onComplete={() => {}} />);
    await dismissIntro(user);

    await user.click(screen.getByRole('button', { name: 'man |' }));
    expect(screen.getByRole('dialog', { name: /man \|/ })).toHaveTextContent('команда1 | команда2');
  });
});

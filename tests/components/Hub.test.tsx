import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Hub } from '../../src/components/Hub';
import type { GameDescriptor } from '../../src/games/types';
import type { Progress } from '../../src/progress/progress';

function StubGame() {
  return null;
}

const games: GameDescriptor[] = [
  { id: 'game-01', chapterNumber: 1, title: 'Ремонтная консоль', shortDescription: 'Учимся консоли', Component: StubGame },
  { id: 'game-02', chapterNumber: 2, title: 'Прошивка теплицы', shortDescription: 'Учимся прошивать', Component: StubGame },
];

function noop() {}

describe('Hub', () => {
  it('unlocks the first game and locks the rest when nothing is completed', () => {
    const progress: Progress = { completedGameIds: [], introSeen: true };
    render(<Hub games={games} progress={progress} onSelectGame={noop} onOpenIntro={noop} />);

    expect(screen.getByRole('button', { name: /Ремонтная консоль/ })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Прошивка теплицы/ })).toBeDisabled();
  });

  it('unlocks the second game once the first is completed', () => {
    const progress: Progress = { completedGameIds: ['game-01'], introSeen: true };
    render(<Hub games={games} progress={progress} onSelectGame={noop} onOpenIntro={noop} />);

    expect(screen.getByRole('button', { name: /Прошивка теплицы/ })).toBeEnabled();
  });

  it('calls onSelectGame with the game id when an unlocked game is clicked', async () => {
    const user = userEvent.setup();
    const onSelectGame = vi.fn();
    const progress: Progress = { completedGameIds: [], introSeen: true };
    render(<Hub games={games} progress={progress} onSelectGame={onSelectGame} onOpenIntro={noop} />);

    await user.click(screen.getByRole('button', { name: /Ремонтная консоль/ }));
    expect(onSelectGame).toHaveBeenCalledWith('game-01');
  });

  it('shows a completed marker for finished games', () => {
    const progress: Progress = { completedGameIds: ['game-01'], introSeen: true };
    render(<Hub games={games} progress={progress} onSelectGame={noop} onOpenIntro={noop} />);

    const item = screen.getByRole('button', { name: /Ремонтная консоль/ });
    expect(item).toHaveTextContent('✓');
  });

  it('calls onOpenIntro when the "Введение" button is clicked', async () => {
    const user = userEvent.setup();
    const onOpenIntro = vi.fn();
    const progress: Progress = { completedGameIds: [], introSeen: true };
    render(<Hub games={games} progress={progress} onSelectGame={noop} onOpenIntro={onOpenIntro} />);

    await user.click(screen.getByRole('button', { name: 'Введение' }));
    expect(onOpenIntro).toHaveBeenCalledTimes(1);
  });
});

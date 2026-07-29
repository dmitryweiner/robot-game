import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { StoryIntro } from '../../src/games/game-01-repair-console/StoryIntro';

describe('StoryIntro', () => {
  it('explains the chapter task', () => {
    render(<StoryIntro onStart={() => {}} />);
    const dialog = screen.getByRole('dialog', { name: 'Глава 1. Ремонтная консоль' });
    expect(dialog).toHaveTextContent(/северного моста/i);
  });

  it('mentions the tools available to the player', () => {
    render(<StoryIntro onStart={() => {}} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('journalctl');
    expect(dialog).toHaveTextContent(/подсказк/i);
  });

  it('calls onStart when the player dismisses the intro', async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<StoryIntro onStart={onStart} />);
    await user.click(screen.getByRole('button', { name: 'Начать' }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });
});

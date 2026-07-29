import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { StoryIntro } from '../../../src/games/game-02-greenhouse-firmware/StoryIntro';

describe('StoryIntro (game 2)', () => {
  it('explains the chapter task', () => {
    render(<StoryIntro onStart={() => {}} />);
    const dialog = screen.getByRole('dialog', { name: 'Глава 2. Прошивка теплицы' });
    expect(dialog).toHaveTextContent(/прошивк/i);
    expect(dialog).toHaveTextContent(/насос/i);
  });

  it('mentions the tools available to the player', () => {
    render(<StoryIntro onStart={() => {}} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('arm-none-eabi-gcc');
    expect(dialog).toHaveTextContent('REPL');
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

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { HintButton } from '../../src/games/game-01-repair-console/HintButton';

describe('HintButton', () => {
  it('hides the command until the button is pressed', () => {
    render(<HintButton command="ls drivers" />);
    expect(screen.queryByText('ls drivers')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Показать подсказку' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('reveals the exact command as unselectable text when pressed', async () => {
    const user = userEvent.setup();
    render(<HintButton command="ls drivers" />);
    await user.click(screen.getByRole('button', { name: 'Показать подсказку' }));

    const command = screen.getByText('ls drivers');
    expect(command).toBeInTheDocument();
    expect(command).toHaveStyle({ userSelect: 'none' });
    expect(screen.getByRole('button', { name: 'Скрыть подсказку' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('toggles back to hidden on a second press', async () => {
    const user = userEvent.setup();
    render(<HintButton command="ls drivers" />);
    const toggle = screen.getByRole('button');
    await user.click(toggle);
    await user.click(toggle);
    expect(screen.queryByText('ls drivers')).not.toBeInTheDocument();
  });

  it('re-hides the command when the caller remounts it via a new key (new stage)', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<HintButton key="explore" command="ls drivers" />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('ls drivers')).toBeInTheDocument();

    rerender(<HintButton key="chmod" command="chmod +x drivers/nb_init.sh" />);
    expect(screen.queryByText('chmod +x drivers/nb_init.sh')).not.toBeInTheDocument();
  });
});

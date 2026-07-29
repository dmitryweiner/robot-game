import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { GlobalIntro } from '../../src/components/GlobalIntro';

describe('GlobalIntro', () => {
  it('explains the setting and that the player is the boy', () => {
    render(<GlobalIntro onClose={() => {}} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent(/мальчик/i);
    expect(dialog).toHaveTextContent(/робот/i);
  });

  it('links to the book', () => {
    render(<GlobalIntro onClose={() => {}} />);
    const link = screen.getByRole('link', { name: /книгу/i });
    expect(link).toHaveAttribute('href', 'https://dmitryweiner.github.io/robot-talks/');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('calls onClose when dismissed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<GlobalIntro onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Понятно' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

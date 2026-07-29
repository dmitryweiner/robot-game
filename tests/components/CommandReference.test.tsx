import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CommandReference } from '../../src/components/CommandReference';

const entry = {
  name: 'ls',
  synopsis: 'ls [-l] [путь...]',
  description: 'Показывает содержимое каталога.',
};

describe('CommandReference', () => {
  it('shows the command name, synopsis and description', () => {
    render(<CommandReference entry={entry} onClose={() => {}} />);
    const dialog = screen.getByRole('dialog', { name: /ls/ });
    expect(dialog).toHaveTextContent('ls [-l] [путь...]');
    expect(dialog).toHaveTextContent('Показывает содержимое каталога.');
  });

  it('calls onClose when dismissed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<CommandReference entry={entry} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Закрыть' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

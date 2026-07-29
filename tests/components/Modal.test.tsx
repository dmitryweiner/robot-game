import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from '../../src/components/Modal';

describe('Modal', () => {
  it('renders the title and children', () => {
    render(
      <Modal title="Заголовок" onClose={() => {}}>
        <p>Текст внутри</p>
      </Modal>,
    );
    expect(screen.getByRole('dialog', { name: 'Заголовок' })).toBeInTheDocument();
    expect(screen.getByText('Текст внутри')).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal title="Заголовок" onClose={onClose} closeLabel="Начать">
        <p>Текст</p>
      </Modal>,
    );
    await user.click(screen.getByRole('button', { name: 'Начать' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the overlay is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal title="Заголовок" onClose={onClose}>
        <p>Текст</p>
      </Modal>,
    );
    await user.click(screen.getByRole('presentation'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when the dialog content is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal title="Заголовок" onClose={onClose}>
        <p>Текст внутри</p>
      </Modal>,
    );
    await user.click(screen.getByText('Текст внутри'));
    expect(onClose).not.toHaveBeenCalled();
  });
});

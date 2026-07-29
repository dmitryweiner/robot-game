import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '../src/App';

beforeEach(() => {
  localStorage.clear();
  window.location.hash = '';
});

async function dismissGlobalIntro(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Понятно' }));
}

describe('App', () => {
  it('shows the global intro automatically on the very first visit', () => {
    render(<App />);
    expect(screen.getByRole('dialog', { name: 'Введение' })).toBeInTheDocument();
  });

  it('shows the hub once the global intro is dismissed', async () => {
    const user = userEvent.setup();
    render(<App />);
    await dismissGlobalIntro(user);
    expect(screen.getByText('Помоги роботу')).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Введение' })).not.toBeInTheDocument();
  });

  it('does not show the global intro again after it was dismissed once', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await dismissGlobalIntro(user);
    unmount();

    render(<App />);
    expect(screen.queryByRole('dialog', { name: 'Введение' })).not.toBeInTheDocument();
  });

  it('reopens the global intro from the hub\'s "Введение" button', async () => {
    const user = userEvent.setup();
    render(<App />);
    await dismissGlobalIntro(user);

    await user.click(screen.getByRole('button', { name: 'Введение' }));
    expect(screen.getByRole('dialog', { name: 'Введение' })).toBeInTheDocument();

    await dismissGlobalIntro(user);
    expect(screen.queryByRole('dialog', { name: 'Введение' })).not.toBeInTheDocument();
  });

  it('navigates into a game and back to the hub', async () => {
    const user = userEvent.setup();
    render(<App />);
    await dismissGlobalIntro(user);

    await user.click(screen.getByRole('button', { name: /Ремонтная консоль/ }));
    await user.click(screen.getByRole('button', { name: 'Начать' }));
    expect(screen.getByRole('textbox', { name: 'Командная строка' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '← В меню' }));
    expect(screen.getByText('Помоги роботу')).toBeInTheDocument();
  });

  it('falls back to the hub for an unknown game id in the URL', async () => {
    const user = userEvent.setup();
    window.location.hash = '#/game/does-not-exist';
    render(<App />);
    await dismissGlobalIntro(user);
    expect(screen.getByText('Помоги роботу')).toBeInTheDocument();
  });
});

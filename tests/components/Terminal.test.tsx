import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createInitialFs } from '../../src/games/game-01-repair-console/shell/fs';
import { Terminal } from '../../src/games/game-01-repair-console/Terminal';

async function type(user: ReturnType<typeof userEvent.setup>, text: string) {
  const input = screen.getByRole('textbox', { name: 'Командная строка' });
  await user.type(input, `${text}{Enter}`);
}

function getInput(): HTMLInputElement {
  const input = screen.getByRole('textbox', { name: 'Командная строка' });
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('expected the command line to be an <input>');
  }
  return input;
}

describe('Terminal', () => {
  it('shows the initial prompt at the root directory', () => {
    render(<Terminal initialFs={createInitialFs()} />);
    expect(screen.getByText('robot@northbridge:/ #')).toBeInTheDocument();
  });

  it('runs a command and prints its output', async () => {
    const user = userEvent.setup();
    render(<Terminal initialFs={createInitialFs()} />);
    await type(user, 'ls drivers');
    expect(await screen.findByText(/nb_init\.sh/)).toBeInTheDocument();
  });

  it('shows stderr in red for an unknown command', async () => {
    const user = userEvent.setup();
    render(<Terminal initialFs={createInitialFs()} />);
    await type(user, 'frobnicate');
    const errorLine = await screen.findByText('frobnicate: command not found');
    expect(errorLine).toHaveClass('console-pane__line--stderr');
  });

  it('clears the input field after submitting', async () => {
    const user = userEvent.setup();
    render(<Terminal initialFs={createInitialFs()} />);
    const input = getInput();
    await type(user, 'pwd');
    expect(input.value).toBe('');
  });

  it('recalls previous commands with ArrowUp', async () => {
    const user = userEvent.setup();
    render(<Terminal initialFs={createInitialFs()} />);
    const input = getInput();
    await type(user, 'pwd');
    await user.type(input, '{ArrowUp}');
    expect(input.value).toBe('pwd');
  });

  it('fires onEvent when the repair script runs successfully', async () => {
    const user = userEvent.setup();
    const onEvent = vi.fn();
    render(<Terminal initialFs={createInitialFs()} onEvent={onEvent} />);
    await type(user, 'chmod +x drivers/nb_init.sh');
    await type(user, './drivers/nb_init.sh');
    expect(onEvent).toHaveBeenCalledWith({ type: 'script-success', script: '/drivers/nb_init.sh' });
  });

  it('completes a unique command on Tab instead of moving focus away', async () => {
    const user = userEvent.setup();
    render(<Terminal initialFs={createInitialFs()} />);
    const input = getInput();
    await user.type(input, 'jour');
    await user.type(input, '{Tab}');
    expect(input.value).toBe('journalctl ');
    expect(document.activeElement).toBe(input);
  });

  it('does nothing on Tab when the completion is ambiguous, but keeps focus in the input', async () => {
    const user = userEvent.setup();
    render(<Terminal initialFs={createInitialFs()} />);
    const input = getInput();
    await user.type(input, 'ls drivers/nb_');
    await user.type(input, '{Tab}');
    expect(input.value).toBe('ls drivers/nb_');
    expect(document.activeElement).toBe(input);
  });
});

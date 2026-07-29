import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConsolePane } from '../../src/components/ConsolePane';

function getInput(label = 'Командная строка'): HTMLInputElement {
  const input = screen.getByRole('textbox', { name: label });
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('expected the console input to be an <input>');
  }
  return input;
}

describe('ConsolePane', () => {
  it('shows the prompt', () => {
    render(<ConsolePane prompt="gh-ctrl$" onSubmit={() => []} />);
    expect(screen.getByText('gh-ctrl$')).toBeInTheDocument();
  });

  it('runs onSubmit and renders the returned lines, then clears the input', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockReturnValue([{ stream: 'stdout', text: 'ok' }]);
    render(<ConsolePane prompt="$" onSubmit={onSubmit} />);
    const input = getInput();
    await user.type(input, 'do it{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('do it');
    expect(await screen.findByText('ok')).toBeInTheDocument();
    expect(input.value).toBe('');
  });

  it('renders stderr lines with the stderr modifier class', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockReturnValue([{ stream: 'stderr', text: 'boom' }]);
    render(<ConsolePane prompt="$" onSubmit={onSubmit} />);
    await user.type(getInput(), 'x{Enter}');
    const errorLine = await screen.findByText('boom');
    expect(errorLine).toHaveClass('console-pane__line--stderr');
  });

  it('recalls previous input with ArrowUp/ArrowDown', async () => {
    const user = userEvent.setup();
    render(<ConsolePane prompt="$" onSubmit={() => []} />);
    const input = getInput();
    await user.type(input, 'first{Enter}');
    await user.type(input, 'second{Enter}');
    await user.type(input, '{ArrowUp}');
    expect(input.value).toBe('second');
    await user.type(input, '{ArrowUp}');
    expect(input.value).toBe('first');
    await user.type(input, '{ArrowDown}');
    expect(input.value).toBe('second');
    await user.type(input, '{ArrowDown}');
    expect(input.value).toBe('');
  });

  it('keeps focus in the console on Tab even without a completion handler', async () => {
    const user = userEvent.setup();
    render(<ConsolePane prompt="$" onSubmit={() => []} />);
    const input = getInput();
    await user.type(input, 'abc');
    await user.type(input, '{Tab}');
    expect(input.value).toBe('abc');
    expect(document.activeElement).toBe(input);
  });

  it('delegates Tab completion to onTab when provided', async () => {
    const user = userEvent.setup();
    const onTab = vi.fn().mockReturnValue('completed ');
    render(<ConsolePane prompt="$" onSubmit={() => []} onTab={onTab} />);
    const input = getInput();
    await user.type(input, 'comp');
    await user.type(input, '{Tab}');
    expect(onTab).toHaveBeenCalledWith('comp');
    expect(input.value).toBe('completed ');
  });

  it('uses a custom input label when given', () => {
    render(<ConsolePane prompt=">" onSubmit={() => []} inputLabel="JS REPL" />);
    expect(screen.getByRole('textbox', { name: 'JS REPL' })).toBeInTheDocument();
  });
});

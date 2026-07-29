import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ControllerIllustration } from '../../../src/games/game-02-greenhouse-firmware/ControllerIllustration';

describe('ControllerIllustration', () => {
  it('exposes the current pose for styling and describes it for screen readers', () => {
    render(<ControllerIllustration pose="broken" />);
    const figure = screen.getByRole('img');
    expect(figure).toHaveAttribute('data-pose', 'broken');
    expect(figure).toHaveAccessibleName(/потерял прошивку/i);
  });

  it('shows the mode: ? readout while broken', () => {
    render(<ControllerIllustration pose="broken" />);
    expect(screen.getByText('mode: ?')).toBeInTheDocument();
  });

  it('shows a recovered readout once fixed', () => {
    render(<ControllerIllustration pose="fixed" />);
    expect(screen.getByText('mode: auto')).toBeInTheDocument();
  });
});

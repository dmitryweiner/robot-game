import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RobotIllustration } from '../../src/games/game-01-repair-console/RobotIllustration';

describe('RobotIllustration', () => {
  it('exposes the current pose for styling and describes it for screen readers', () => {
    render(<RobotIllustration pose="lying" />);
    const figure = screen.getByRole('img');
    expect(figure).toHaveAttribute('data-pose', 'lying');
    expect(figure).toHaveAccessibleName(/лежит/i);
  });

  it('describes the fixed pose differently', () => {
    render(<RobotIllustration pose="fixed" />);
    expect(screen.getByRole('img')).toHaveAccessibleName(/поднял/i);
  });
});

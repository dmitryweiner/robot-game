export type ControllerPose = 'broken' | 'quiet' | 'fixed';

/**
 * Maps the two narrative beats onto the illustration's pose. Purely
 * cosmetic — flipping the pump switch is never required to win, it only
 * changes what the scene looks like.
 */
export function poseForProgress(pumpsOff: boolean, solved: boolean): ControllerPose {
  if (solved) {
    return 'fixed';
  }
  return pumpsOff ? 'quiet' : 'broken';
}

export type RobotPose = 'lying' | 'lifting' | 'fixed';

/**
 * Maps hint progress onto the robot illustration's pose. Purely cosmetic —
 * unlike the win condition, it is fine for this to be a rough approximation.
 */
export function poseForProgress(stageIndex: number, solved: boolean): RobotPose {
  if (solved) {
    return 'fixed';
  }
  return stageIndex >= 4 ? 'lifting' : 'lying';
}

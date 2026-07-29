import type { RobotPose } from './pose';
import './RobotIllustration.css';

const POSE_LABEL: Record<RobotPose, string> = {
  lying: 'Робот лежит на полу и не может пошевелиться',
  lifting: 'Робот готовится подняться',
  fixed: 'Робот поднялся и снова чувствует свои руки и ноги',
};

interface RobotIllustrationProps {
  pose: RobotPose;
}

export function RobotIllustration({ pose }: RobotIllustrationProps) {
  return (
    <svg
      className="robot-illustration"
      data-pose={pose}
      viewBox="0 0 200 140"
      role="img"
      aria-label={POSE_LABEL[pose]}
    >
      <rect className="robot-illustration__floor" x="10" y="122" width="180" height="4" />
      <g className="robot-illustration__figure">
        <rect className="robot-illustration__arm robot-illustration__arm--left" x="-34" y="-24" width="10" height="28" rx="3" />
        <rect className="robot-illustration__arm robot-illustration__arm--right" x="24" y="-24" width="10" height="28" rx="3" />
        <rect className="robot-illustration__torso" x="-20" y="-30" width="40" height="50" rx="4" />
        <rect className="robot-illustration__head" x="-14" y="-54" width="28" height="24" rx="3" />
        <circle className="robot-illustration__eye" cx="0" cy="-42" r="4" />
        <circle className="robot-illustration__gear" cx="26" cy="-8" r="7" />
      </g>
    </svg>
  );
}

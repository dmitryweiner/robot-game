import type { ControllerPose } from './pose';
import './ControllerIllustration.css';

const POSE_LABEL: Record<ControllerPose, string> = {
  broken: 'Контроллер потерял прошивку, оба насоса гонят воду вхолостую',
  quiet: 'Насосы выключены тумблером, но контроллер всё ещё не понимает, что делать',
  fixed: 'Прошивка залита, контроллер снова следит за датчиками',
};

const SCREEN_LINES: Record<ControllerPose, [string, string]> = {
  broken: ['mode: ?', 'pump A:on  pump B:on'],
  quiet: ['mode: ?', 'pump A:-   pump B:-'],
  fixed: ['mode: auto', 'pump A:idle pump B:idle'],
};

interface ControllerIllustrationProps {
  pose: ControllerPose;
}

export function ControllerIllustration({ pose }: ControllerIllustrationProps) {
  const [line1, line2] = SCREEN_LINES[pose];

  return (
    <svg
      className="controller-illustration"
      data-pose={pose}
      viewBox="0 0 200 150"
      role="img"
      aria-label={POSE_LABEL[pose]}
    >
      <rect className="controller-illustration__box" x="20" y="10" width="100" height="56" rx="4" />
      <circle className="controller-illustration__led" cx="108" cy="20" r="4" />
      <rect className="controller-illustration__screen" x="28" y="22" width="84" height="34" />
      <text className="controller-illustration__screen-text" x="32" y="36">
        {line1}
      </text>
      <text className="controller-illustration__screen-text" x="32" y="49">
        {line2}
      </text>

      {/* The outer <g> only ever carries the SVG `transform` attribute (position).
          CSS `transform` animations on the very same element would silently replace
          that attribute instead of combining with it, so shake/spin animations are
          applied to nested groups instead, whose local origin is already (0, 0). */}
      <g className="controller-illustration__pump-slot" transform="translate(60, 112)">
        <g className="controller-illustration__pump">
          <circle className="controller-illustration__pump-housing" r="18" />
          <g className="controller-illustration__pump-blades">
            <line className="controller-illustration__pump-blade" x1="0" y1="-14" x2="0" y2="14" />
            <line className="controller-illustration__pump-blade" x1="-14" y1="0" x2="14" y2="0" />
          </g>
        </g>
      </g>
      <g className="controller-illustration__pump-slot" transform="translate(150, 112)">
        <g className="controller-illustration__pump">
          <circle className="controller-illustration__pump-housing" r="18" />
          <g className="controller-illustration__pump-blades">
            <line className="controller-illustration__pump-blade" x1="0" y1="-14" x2="0" y2="14" />
            <line className="controller-illustration__pump-blade" x1="-14" y1="0" x2="14" y2="0" />
          </g>
        </g>
      </g>
    </svg>
  );
}

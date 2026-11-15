import React from 'react';
import { CommandServiceModule } from '../spacecraft/CommandServiceModule';
import { EagleSpacecraft } from './EagleSpacecraft';

export type LunarEnvironmentMode = 'cinematic' | 'demo' | 'game' | 'touchdown';

interface LunarEnvironmentProps {
  mode: LunarEnvironmentMode;
  progress?: number;
  phaseIndex?: number;
  x?: number;
  altitude?: number;
  horizontalDrift?: number;
  isThrusting?: boolean;
  touchdownStep?: number;
}

const CRATERS = [
  { left: 10, size: 'large' },
  { left: 24, size: 'small' },
  { left: 37, size: 'medium' },
  { left: 72, size: 'large' },
  { left: 88, size: 'medium' },
];

const ROCKS = [
  { left: 33, size: 'small' },
  { left: 67, size: 'medium' },
  { left: 80, size: 'small' },
];

export const LunarEnvironment: React.FC<LunarEnvironmentProps> = ({
  mode,
  progress = 0,
  phaseIndex = 0,
  x = 56,
  altitude = 200,
  horizontalDrift = 0,
  isThrusting = false,
  touchdownStep = 0,
}) => {
  const isGame = mode === 'game' || mode === 'touchdown';
  const showTarget = isGame || (mode === 'demo' && phaseIndex >= 2);
  const altitudeRatio = Math.max(0, Math.min(1, altitude / 200));

  let eagleStyle: React.CSSProperties;
  let eagleThrust = isThrusting;

  if (mode === 'cinematic') {
    eagleStyle = {
      left: `${71 - progress * 18}%`,
      top: `${17 + progress * 22}%`,
      transform: `translate(-50%, -50%) scale(${0.56 + progress * 0.5}) rotate(-8deg)`,
    };
    eagleThrust = true;
  } else if (mode === 'demo') {
    const phasePositions = [
      { start: 22, end: 38, leftStart: 50, leftEnd: 50, rotation: 0 },
      { start: 38, end: 52, leftStart: 50, leftEnd: 50, rotation: -3 },
      { start: 49, end: 61, leftStart: 63, leftEnd: 55, rotation: 2 },
      { start: 58, end: 75, leftStart: 55, leftEnd: 55, rotation: 0 },
    ];
    const position = phasePositions[Math.max(0, Math.min(phasePositions.length - 1, phaseIndex))];
    eagleStyle = {
      left: `${position.leftStart + (position.leftEnd - position.leftStart) * progress}%`,
      top: `${position.start + (position.end - position.start) * progress}%`,
      transform: `translate(-50%, -50%) scale(${0.9 + progress * 0.08}) rotate(${position.rotation}deg)`,
    };
    eagleThrust = phaseIndex !== 2 || progress > 0.7;
  } else {
    eagleStyle = {
      left: `${x}%`,
      bottom: `${17 + altitudeRatio * 39}%`,
      transform: `translateX(-50%) rotate(${Math.max(-8, Math.min(8, horizontalDrift * 2))}deg) scale(${0.9 + altitudeRatio * 0.22})`,
    };
  }

  return (
    <div
      className={`lunar-environment lunar-environment-${mode} ${mode === 'touchdown' ? `touchdown-step-${touchdownStep}` : ''}`}
      aria-label={isGame ? 'Moon landing game scene' : 'View of the Moon and Eagle'}
    >
      <div className="landing-stars landing-stars-one" aria-hidden="true" />
      <div className="landing-stars landing-stars-two" aria-hidden="true" />
      <div className="landing-earth" aria-hidden="true">
        <span>EARTH</span>
      </div>

      {mode === 'cinematic' && (
        <div className="landing-orbiting-columbia" role="img" aria-label="Columbia with Michael Collins aboard">
          <div className="landing-columbia-art"><CommandServiceModule /></div>
          <span>COLUMBIA · MICHAEL COLLINS</span>
        </div>
      )}

      {!isGame ? (
        <>
          <div
            className="landing-moon"
            style={{ transform: `translateX(-50%) scale(${0.84 + progress * 0.36})` }}
            aria-hidden="true"
          >
            <span className="moon-crater moon-crater-one" />
            <span className="moon-crater moon-crater-two" />
            <span className="moon-crater moon-crater-three" />
          </div>
          {mode === 'demo' && showTarget && (
            <div className="landing-safe-zone demo-safe-zone" style={{ left: '54%' }} aria-label="Safer landing area">
              <span>SAFER LANDING AREA</span>
            </div>
          )}
          {mode === 'demo' && phaseIndex === 2 && (
            <div className="landing-hazard-zone" style={{ left: '37%' }} aria-label="Crater: unsafe landing spot">
              <span>CRATER · UNSAFE</span>
            </div>
          )}
        </>
      ) : (
        <div className="landing-game-terrain" aria-hidden="true">
          <div className="landing-horizon" />
          {CRATERS.map((crater, index) => (
            <span
              key={`crater-${index}`}
              className={`landing-crater crater-${crater.size} ${mode === 'game' ? 'hazard-highlight' : ''}`}
              style={{ left: `${crater.left}%` }}
            />
          ))}
          {ROCKS.map((rock, index) => (
            <span
              key={`rock-${index}`}
              className={`landing-rock rock-${rock.size} ${mode === 'game' ? 'hazard-highlight' : ''}`}
              style={{ left: `${rock.left}%` }}
            />
          ))}
          {showTarget && (
            <div className="landing-safe-zone" style={{ left: '54%' }}>
              <span>SAFE LANDING AREA</span>
            </div>
          )}
          {mode === 'touchdown' && (
            <div className="landing-dust" aria-hidden="true">
              <i /><i /><i /><i /><i /><i />
            </div>
          )}
        </div>
      )}

      {mode === 'cinematic' && (
        <div className="landing-cinematic-caption">
          <strong>MOON APPROACH</strong>
          <span>Columbia remains in lunar orbit as Eagle separates.</span>
        </div>
      )}

      <EagleSpacecraft
        className={`${mode === 'touchdown' ? 'landing-eagle-touchdown' : ''}`}
        style={eagleStyle}
        isThrusting={eagleThrust}
        landed={mode === 'touchdown'}
      />

      {mode === 'game' && (
        <div className="landing-target-label" style={{ left: '54%' }}>
          LANDING TARGET
        </div>
      )}
    </div>
  );
};

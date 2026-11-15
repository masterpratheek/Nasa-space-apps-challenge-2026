import React from 'react';
import { LunarModule } from '../spacecraft/LunarModule';

interface EagleSpacecraftProps {
  className?: string;
  style?: React.CSSProperties;
  isThrusting?: boolean;
  landed?: boolean;
}

export const EagleSpacecraft: React.FC<EagleSpacecraftProps> = ({
  className = '',
  style,
  isThrusting = false,
  landed = false,
}) => (
  <div
    className={`landing-eagle ${className} ${isThrusting ? 'is-thrusting' : ''} ${landed ? 'is-landed' : ''}`}
    style={style}
    role="img"
    aria-label="Apollo 11 Eagle lunar module"
  >
    <span className="landing-eagle-label">EAGLE</span>
    <LunarModule />
    {isThrusting && !landed && <span className="landing-engine-exhaust" aria-hidden="true" />}
  </div>
);

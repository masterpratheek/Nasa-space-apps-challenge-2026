import React from 'react';

interface EngineGlowProps {
  active: boolean;
}

export const EngineGlow: React.FC<EngineGlowProps> = ({ active }) => {
  if (!active) return null;
  return (
    <svg width="80" height="60" viewBox="0 0 80 60">
      <defs>
        <radialGradient id="engineGlowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#fef08a" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="40" cy="30" rx="35" ry="25" fill="url(#engineGlowGrad)" opacity={0.8} style={{ animation: 'exhaustPulse 0.1s infinite alternate' }} />
    </svg>
  );
};

export default EngineGlow;
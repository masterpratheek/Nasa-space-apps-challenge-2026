import React from 'react';

interface DockingAlignmentGuideProps {
  progress: number;
  error: number;
}

export const DockingAlignmentGuide: React.FC<DockingAlignmentGuideProps> = ({ progress, error }) => {
  const isAligned = progress >= 90;
  const offset = (Math.sin(Date.now() / 200) * error * 0.5);
  
  return (
    <svg width="200" height="100" viewBox="0 0 200 100" style={{ transform: `translateX(${offset}px)` }}>
      <defs>
        <linearGradient id="guideGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {/* Outer alignment ring */}
      <circle cx="100" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="8,4" opacity="0.6" />
      {/* Inner alignment ring */}
      <circle cx="100" cy="50" r="30" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="6,4" opacity="0.8" />
      {/* Center crosshairs */}
      <line x1="100" y1="5" x2="100" y2="95" stroke="#10b981" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
      <line x1="5" y1="50" x2="195" y2="50" stroke="#10b981" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
      {/* Center target */}
      <circle cx="100" cy="50" r="8" fill="none" stroke="#10b981" strokeWidth="2" />
      <circle cx="100" cy="50" r="4" fill="#10b981" />
      {/* Alignment indicators */}
      <g transform="translate(100, 50)">
        {[0, 90, 180, 270].map(angle => (
          <g key={angle} transform={`rotate(${angle})`}>
            <line x1="0" y1="55" x2="0" y2="70" stroke="#10b981" strokeWidth="2" opacity="0.7" />
          </g>
        ))}
        {/* Progress arc */}
        <path
          d="M0,-45 A45,45 0 0 1 0,45"
          fill="none"
          stroke="url(#guideGrad)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${282 * (progress/100)} ${282}`}
          strokeDashoffset={282 * (1 - progress/100)}
          opacity="0.8"
        />
      </g>
      {/* Status text */}
      <text x="100" y="98" textAnchor="middle" fontFamily="Orbitron" fontSize="8" fill="#10b981" fontWeight="bold">
        ALIGNMENT: {Math.round(progress)}%
      </text>
    </svg>
  );
};

export default DockingAlignmentGuide;
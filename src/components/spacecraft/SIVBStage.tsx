import React from 'react';

export const SIVBStage: React.FC = () => (
  <svg width="80" height="110" viewBox="0 0 80 110" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}>
    <defs>
      <linearGradient id="sivbGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="50%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
      <linearGradient id="sivbEngineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
    </defs>
    {/* Main body */}
    <rect x="15" y="10" width="50" height="80" rx="3" fill="url(#sivbGrad)" stroke="#334155" strokeWidth="1.5" />
    {/* Insulation panels */}
    <rect x="18" y="15" width="12" height="60" rx="1" fill="#334155" opacity="0.5" />
    <rect x="50" y="15" width="12" height="60" rx="1" fill="#334155" opacity="0.5" />
    {/* Stringers */}
    <g stroke="#334155" strokeWidth="0.5" opacity="0.6">
      <line x1="20" y1="10" x2="20" y2="90" />
      <line x1="30" y1="10" x2="30" y2="90" />
      <line x1="40" y1="10" x2="40" y2="90" />
      <line x1="50" y1="10" x2="50" y2="90" />
      <line x1="60" y1="10" x2="60" y2="90" />
    </g>
    {/* Interstage ring */}
    <rect x="10" y="8" width="60" height="6" rx="2" fill="url(#sivbGrad)" stroke="#334155" strokeWidth="1.5" />
    {/* J-2 Engine */}
    <rect x="25" y="90" width="30" height="12" rx="2" fill="url(#sivbEngineGrad)" stroke="#1e293b" strokeWidth="1.5" />
    <ellipse cx="40" cy="96" rx="10" ry="3" fill="#1e293b" />
    {/* Engine nozzle */}
    <path d="M28 100 Q40 110 52 100" fill="none" stroke="#1e293b" strokeWidth="2" />
    <path d="M30 100 Q40 108 50 100" fill="none" stroke="#334155" strokeWidth="1" opacity="0.5" />
    {/* USA marking */}
    <text x="40" y="55" fontFamily="Orbitron" fontSize="6" fontWeight="bold" fill="#fff" textAnchor="middle" opacity="0.8">USA</text>
    <text x="40" y="62" fontFamily="Orbitron" fontSize="4" fill="#fff" textAnchor="middle" opacity="0.6">S-IVB</text>
  </svg>
);

export default SIVBStage;
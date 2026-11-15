import React from 'react';

export const LunarModule: React.FC = () => (
  <svg width="100" height="120" viewBox="-10 0 120 140" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}>
    <defs>
      <linearGradient id="lmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="50%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>
      <linearGradient id="lmGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
      <linearGradient id="lmBlackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
    </defs>
    {/* Ascent stage */}
    <ellipse cx="50" cy="25" rx="22" ry="18" fill="url(#lmGrad)" stroke="#475569" strokeWidth="1.5" />
    {/* Ascent stage windows */}
    <ellipse cx="40" cy="22" rx="5" ry="4" fill="#1e40af" opacity="0.8" />
    <ellipse cx="60" cy="22" rx="5" ry="4" fill="#1e40af" opacity="0.8" />
    {/* Ascent engine */}
    <rect x="38" y="40" width="24" height="10" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="1" />
    <ellipse cx="50" cy="45" rx="8" ry="3" fill="#1e293b" />
    
    {/* Descent stage */}
    <g transform="translate(0, 50)">
      {/* Main body */}
      <rect x="10" y="0" width="80" height="60" rx="3" fill="url(#lmGoldGrad)" stroke="#b45309" strokeWidth="2" />
      {/* Thermal blankets */}
      <rect x="15" y="5" width="70" height="50" rx="2" fill="#fef3c7" opacity="0.3" />
      {/* Landing gear bays */}
      <g stroke="#b45309" strokeWidth="1.5" opacity="0.8">
        <path d="M5 55 L-10 75" strokeWidth="3" />
        <path d="M95 55 L110 75" strokeWidth="3" />
        <path d="M20 60 L5 80" strokeWidth="3" />
        <path d="M80 60 L95 80" strokeWidth="3" />
      </g>
      {/* Landing pads */}
      <g fill="#fbbf24" stroke="#b45309" strokeWidth="1.5">
        <ellipse cx="0" cy="78" rx="12" ry="6" />
        <ellipse cx="100" cy="78" rx="12" ry="6" />
        <ellipse cx="20" cy="85" rx="10" ry="5" />
        <ellipse cx="80" cy="85" rx="10" ry="5" />
      </g>
      {/* Descent engine */}
      <ellipse cx="50" cy="40" rx="15" ry="8" fill="#1e293b" />
      <ellipse cx="50" cy="40" rx="10" ry="5" fill="#334155" />
    </g>
    {/* USA marking */}
    <text x="50" y="75" fontFamily="Orbitron" fontSize="5" fontWeight="bold" fill="#fff" textAnchor="middle" opacity="0.8">USA</text>
  </svg>
);

export default LunarModule;
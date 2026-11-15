import React from 'react';

export const CommandServiceModule: React.FC = () => (
  <svg width="120" height="160" viewBox="0 0 120 160" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))' }}>
    <defs>
      <linearGradient id="csmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="50%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#94a3b8" />
      </linearGradient>
      <linearGradient id="csmGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
      <linearGradient id="csmBlackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
      <radialGradient id="engineGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.8" />
        <stop offset="50%" stopColor="#fef08a" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
      </radialGradient>
    </defs>
    
    {/* Command Module (top) */}
    <g transform="translate(60, 10)">
      {/* Heat shield */}
      <ellipse cx="0" cy="0" rx="35" ry="12" fill="#334155" stroke="#1e293b" strokeWidth="2" />
      {/* Ablation texture */}
      <g fill="#1e293b" opacity="0.3">
        <circle cx="-20" cy="-2" r="3" />
        <circle cx="20" cy="-2" r="3" />
        <circle cx="0" cy="-8" r="2" />
        <circle cx="-10" cy="5" r="2" />
        <circle cx="10" cy="5" r="2" />
      </g>
      {/* CM structure */}
      <ellipse cx="0" cy="0" rx="30" ry="10" fill="url(#csmGrad)" stroke="#94a3b8" strokeWidth="1.5" />
      {/* Windows */}
      <g fill="#1e40af" opacity="0.9">
        <ellipse cx="-15" cy="-2" rx="6" ry="4" />
        <ellipse cx="15" cy="-2" rx="6" ry="4" />
      </g>
      {/* CM top */}
      <ellipse cx="0" cy="-18" rx="20" ry="6" fill="url(#csmGrad)" stroke="#94a3b8" strokeWidth="1" />
      <circle cx="0" cy="-18" r="6" fill="#334155" />
    </g>
    
    {/* Service Module */}
    <g transform="translate(60, 30)">
      {/* SM body */}
      <rect x="-40" y="0" width="80" height="100" rx="3" fill="url(#csmGrad)" stroke="#94a3b8" strokeWidth="1.5" />
      {/* Radiator panels */}
      <rect x="-38" y="5" width="15" height="90" rx="1" fill="#1e293b" opacity="0.8" />
      <rect x="23" y="5" width="15" height="90" rx="1" fill="#1e293b" opacity="0.8" />
      {/* RCS thrusters */}
      <g fill="#475569" stroke="#334155" strokeWidth="1">
        <circle cx="-38" cy="10" r="4" />
        <circle cx="38" cy="10" r="4" />
        <circle cx="-38" cy="90" r="4" />
        <circle cx="38" cy="90" r="4" />
      </g>
      {/* SPS Engine */}
      <ellipse cx="0" cy="115" rx="18" ry="10" fill="url(#csmBlackGrad)" stroke="#1e293b" strokeWidth="2" />
      <ellipse cx="0" cy="115" rx="12" ry="6" fill="#1e293b" />
      <ellipse cx="0" cy="115" rx="8" ry="4" fill="#334155" />
      {/* Engine glow when thrusting */}
      <ellipse cx="0" cy="115" rx="25" ry="20" fill="url(#engineGlow)" opacity="0" />
      
      {/* USA marking */}
      <text x="0" y="60" fontFamily="Orbitron" fontSize="8" fontWeight="bold" fill="#fff" textAnchor="middle" opacity="0.8">USA</text>
    </g>
  </svg>
);

export default CommandServiceModule;
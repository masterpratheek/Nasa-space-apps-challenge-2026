import React, { useState, useEffect } from 'react';

interface TranslunarInjectionProps {
  onComplete: () => void;
}

export const TranslunarInjection: React.FC<TranslunarInjectionProps> = ({ onComplete }) => {
  const [hasTriggered, setHasTriggered] = useState(false);
  const [missionTime, setMissionTime] = useState(0);
  const [spacecraftPos, setSpacecraftPos] = useState(0);

  useEffect(() => {
    if (hasTriggered && missionTime < 100) {
      const timer = setInterval(() => {
        setMissionTime(prev => prev + 1);
        setSpacecraftPos(prev => Math.min(prev + 2, 100));
      }, 60);
      return () => clearInterval(timer);
    }
  }, [hasTriggered, missionTime]);

  const isComplete = missionTime >= 100;

  return (
    <div>
      <div className="stage-header">
        <h2 className="stage-title">STAGE 7: TRANSLUNAR INJECTION (TLI)</h2>
        <p className="stage-subtitle">
          The S-IVB's second engine burn sends Luna toward the Moon. The game speeds up the trip; the real journey took 3 days.
        </p>
      </div>

      <div className="card-glass" data-mentor-focus="moon" style={{ padding: '2rem', marginBottom: '1.5rem', position: 'relative', height: '400px', overflow: 'hidden' }}>
        {/* Earth */}
        <div style={{ 
          position: 'absolute', left: '10%', top: '50%', transform: 'translateY(-50%)',
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'radial-gradient(circle, #3B82F6, #1E40AF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Orbitron'
        }}>
          EARTH
        </div>

        {/* Moon */}
        <div style={{ 
          position: 'absolute', right: '10%', top: '50%', transform: 'translateY(-50%)',
          width: `${isComplete ? '90px' : '50px'}${''}`, height: `${isComplete ? '90px' : '50px'}`,
          borderRadius: '50%', background: 'radial-gradient(circle, #E2E8F0, #94A3B8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155',
          fontFamily: 'Orbitron', transition: 'all 2s ease-in-out'
        }}>
          MOON
        </div>

        {/* Trajectory Path */}
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
          <path 
            d="M 150 200 Q 450 150 850 200" 
            fill="none" 
            stroke="rgba(245, 158, 11, 0.5)" 
            strokeWidth="2" 
            strokeDasharray="10,5"
          />
        </svg>

        {/* Spacecraft */}
        <div style={{
          position: 'absolute',
          left: `${15 + (spacecraftPos * 0.65)}%`,
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '2rem',
          transition: 'left 0.1s linear'
        }}>
          🚀
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card-glass">
          <h3 style={{ fontFamily: 'Orbitron', fontSize: '1.1rem', color: '#94A3B8', marginBottom: '1rem' }}>
            TLI JOURNEY
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '6px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block' }}>TIME IN THIS SIMULATION</span>
              <strong style={{ fontFamily: 'Orbitron', fontSize: '1.2rem', color: '#10B981' }}>
                {Math.floor(missionTime / 12)}h {Math.floor(missionTime % 12) * 2}m
              </strong>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '6px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'block' }}>FLIGHT STATUS</span>
              <strong style={{ fontFamily: 'Orbitron', fontSize: '1.2rem', color: hasTriggered ? '#F59E0B' : '#60A5FA' }}>
                {hasTriggered ? (isComplete ? 'IN TRANSIT TO MOON' : 'TLI BURN ACTIVE') : 'STANDBY'}
              </strong>
            </div>
          </div>

          <button 
            className="btn-primary"
            disabled={hasTriggered}
            onClick={() => setHasTriggered(true)}
            style={{ width: '100%' }}
          >
            {hasTriggered ? '⚡ TLI BURN IN PROGRESS...' : '🔥 START THE TLI BURN'}
          </button>
        </div>

        <div className="card-glass">
          <h3 style={{ fontFamily: 'Orbitron', fontSize: '1.1rem', color: '#94A3B8', marginBottom: '1rem' }}>
            WHAT IS TLI?
          </h3>
          <p style={{ fontSize: '0.95rem', color: '#CBD5E1', marginBottom: '1rem' }}>
            TLI means Translunar Injection—the big engine push that sends Luna from Earth orbit toward the Moon. The S-IVB fires for about 6 minutes, speeding up the spacecraft from about 22,500 km/h to over 39,000 km/h.
          </p>
          <p style={{ fontSize: '0.95rem', color: '#CBD5E1', marginBottom: '1.5rem' }}>
            This push sends Luna along a long, curved path toward the Moon. It is the biggest single engine burn of the mission!
          </p>
          
          {isComplete && (
            <div>
              <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10B981', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>
                <h4 style={{ color: '#10B981', fontFamily: 'Orbitron' }}>✅ LUNA 11 IS ON A FREE-RETURN PATH TO THE MOON!</h4>
              </div>
              <button className="btn-primary" style={{ width: '100%' }} onClick={onComplete}>
                NEXT: COLUMBIA & EAGLE DOCKING ➔
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';

interface EarthOrbitProps {
  onComplete: () => void;
}

export const EarthOrbit: React.FC<EarthOrbitProps> = ({ onComplete }) => {
  const [angle, setAngle] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [showGravity, setShowGravity] = useState(true);

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setAngle(prev => (prev + 2 * speed) % 360);
      }, 40);
      return () => clearInterval(interval);
    }
  }, [isPaused, speed]);

  return (
    <div>
      <div className="stage-header">
        <h2 className="stage-title">STAGE 6: EARTH ORBIT</h2>
        <p className="stage-subtitle">
          The S-IVB puts Luna into Earth parking orbit—a safe path around Earth while the crew gets ready for the Moon.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        {/* Orbital Animation Visual */}
        <div className="card-glass" data-mentor-focus="orbit" style={{ height: '450px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Earth Center */}
          <div style={{ 
            width: '120px', height: '120px', borderRadius: '50%', 
            background: 'radial-gradient(circle, #3B82F6, #1E3A8A)',
            boxShadow: '0 0 40px rgba(59, 130, 246, 0.5)', 
            position: 'absolute',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontFamily: 'Orbitron'
          }}>
            EARTH
          </div>

          {/* Orbit Path Ring */}
          <div style={{ 
            position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
            border: '2px dashed rgba(255, 255, 255, 0.3)' 
          }} />

          {/* Moving Spacecraft (Eagle/Columbia) */}
          <div style={{
            position: 'absolute',
            transform: `rotate(${angle}deg) translate(150px) rotate(${-angle}deg)`,
            transition: 'transform 0.05s linear'
          }}>
            <div style={{ 
              width: '20px', height: '20px', 
              background: '#F59E0B', 
              borderRadius: '50%',
              boxShadow: '0 0 10px rgba(245, 158, 11, 0.8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px'
            }}>
              🚀
            </div>
          </div>

          {showGravity && (
            <div style={{
              position: 'absolute', top: '10px', left: '10px',
              background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)',
              padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', color: '#60A5FA'
            }}>
              Earth's gravity keeps pulling the spacecraft inward. Moving sideways fast helps it stay in orbit!
            </div>
          )}
        </div>

        {/* Controls & Educational Info */}
        <div className="card-glass">
          <h3 style={{ fontFamily: 'Orbitron', fontSize: '1.2rem', marginBottom: '1rem', color: '#94A3B8' }}>
            EXPLORE ORBIT
          </h3>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: '#F59E0B', marginBottom: '0.5rem', fontFamily: 'Orbitron' }}>
              ORBIT SPEED
            </h4>
            <input 
              type="range" min="0.5" max="3" step="0.1" value={speed} 
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              aria-label="Orbit speed"
              style={{ width: '100%' }}
            />
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '0.3rem' }}>
              Move the slider to change how fast the spacecraft circles Earth.
            </p>
          </div>

          <button 
            onClick={() => setIsPaused(!isPaused)}
            className="btn-secondary" style={{ marginBottom: '1.5rem', width: '100%' }}
          >
            {isPaused ? '▶ Resume Orbit' : '⏸ Pause Orbit'}
          </button>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
            <h4 style={{ fontFamily: 'Orbitron', fontSize: '0.95rem', color: '#06B6D4', marginBottom: '0.75rem' }}>
              ORBIT FACTS
            </h4>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong>Orbit:</strong> The spacecraft keeps falling toward Earth but moves sideways fast enough to keep missing it.</li>
              <li><strong>Gravity:</strong> Earth's pull is still there, even when a spacecraft is in orbit.</li>
              <li><strong>Velocity:</strong> How fast and in what direction something moves. It helps shape an orbit.</li>
            </ul>
          </div>

          <button className="btn-primary" style={{ marginTop: '1.5rem', width: '100%' }} onClick={onComplete}>
            NEXT: TRANSLUNAR INJECTION ➔
          </button>
        </div>
      </div>
    </div>
  );
};
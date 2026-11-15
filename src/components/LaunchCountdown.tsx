import React, { useState, useEffect } from 'react';

interface LaunchCountdownProps {
  onLaunchComplete: () => void;
}

export const LaunchCountdown: React.FC<LaunchCountdownProps> = ({ onLaunchComplete }) => {
  const [countdown, setCountdown] = useState<number>(10);
  const [isCounting, setIsCounting] = useState<boolean>(false);
  const [isLaunched, setIsLaunched] = useState<boolean>(false);
  const [rocketPos, setRocketPos] = useState<number>(0);

  useEffect(() => {
    let timer: number | undefined;
    if (isCounting && countdown > 0) {
      timer = window.setInterval(() => setCountdown(prev => prev - 1), 1000);
    } else if (isCounting && countdown === 0) {
      setIsLaunched(true);
    }
    return () => {
      if (timer !== undefined) window.clearInterval(timer);
    };
  }, [isCounting, countdown]);

  useEffect(() => {
    let animation: number | undefined;
    let completion: number | undefined;
    if (isLaunched && rocketPos < 320) {
      animation = window.setInterval(() => setRocketPos(prev => prev + 8), 30);
    } else if (isLaunched && rocketPos >= 320) {
      completion = window.setTimeout(onLaunchComplete, 1200);
    }
    return () => {
      if (animation !== undefined) window.clearInterval(animation);
      if (completion !== undefined) window.clearTimeout(completion);
    }
  }, [isLaunched, rocketPos, onLaunchComplete]);

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="stage-header">
        <h2 className="stage-title">STAGE 3: COUNTDOWN & LIFTOFF</h2>
        <p className="stage-subtitle">July 16, 1969 · Launch Pad 39A, Kennedy Space Center</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
        <div className="card-glass" style={{ padding: '2rem' }}>
          <h3 style={{ fontFamily: 'Orbitron', fontSize: '1.2rem', color: '#94A3B8', marginBottom: '1.5rem' }}>
            LAUNCH COUNTDOWN
          </h3>

          <div style={{ 
            fontFamily: 'Orbitron', fontSize: '4rem', fontWeight: 'bold', 
            color: countdown <= 3 && countdown > 0 ? '#EF4444' : '#10B981', 
            background: 'rgba(0,0,0,0.5)', padding: '1.5rem', borderRadius: '10px', 
            border: '2px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem'
          }}>
            T-MINUS 00:00:{countdown < 10 ? `0${countdown}` : countdown}
          </div>

          <div style={{ marginBottom: '1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {!isCounting && (
              <button className="btn-primary" onClick={() => setIsCounting(true)} style={{ fontSize: '1.2rem' }}>
                🔥 START COUNTDOWN
              </button>
            )}
            {isCounting && countdown > 3 && (
              <p style={{ color: '#F59E0B', fontFamily: 'Orbitron', fontSize: '1.1rem' }}>ENGINES STARTING...</p>
            )}
            {isCounting && countdown <= 3 && countdown > 0 && (
              <p style={{ color: '#EF4444', fontFamily: 'Orbitron', fontSize: '1.2rem' }}>🔥 MAIN ENGINES ON!</p>
            )}
            {isLaunched && (
              <p style={{ color: '#10B981', fontFamily: 'Orbitron', fontSize: '1.3rem' }}>🚀 LIFTOFF! WE HAVE A LIFTOFF!</p>
            )}
          </div>
        </div>

        <div className="card-glass" style={{ height: '400px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(to top, #1e293b, #0f172a 60%, #020617)' }}>
          {/* Launch Pad Tower */}
          <div style={{ position: 'absolute', bottom: '20px', left: '40%', width: '15px', height: '260px', background: '#334155', borderRight: '3px solid #64748b' }} />

          {/* Saturn V Rocket */}
          <div style={{
            position: 'absolute', bottom: `${40 + rocketPos}px`, left: '48%', transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}>
            <div style={{ width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderBottom: '24px solid #fff' }} />
            <div style={{ width: '24px', height: '140px', background: '#fff', borderLeft: '3px solid #000', borderRight: '3px solid #000', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '20px', width: '100%', height: '6px', background: '#000' }} />
              <div style={{ position: 'absolute', top: '70px', width: '100%', height: '6px', background: '#000' }} />
            </div>
            <div style={{ width: '28px', height: '10px', background: '#475569' }} />
            {(isLaunched || (isCounting && countdown <= 2)) && (
              <div style={{ width: '30px', height: '80px', background: 'linear-gradient(to bottom, #f59e0b, #ef4444, transparent)', borderRadius: '0 0 16px 16px' }} />
            )}
          </div>

          <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '40px', background: '#334155', borderTop: '4px solid #475569' }} />
        </div>
      </div>
    </div>
  );
};
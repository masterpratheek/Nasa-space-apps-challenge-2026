import React from 'react';
import { LaunchCountdown } from './LaunchCountdown';

interface LaunchSequenceProps {
  onLaunchComplete: () => void;
  isAuthorized: boolean;
  scenario: {
    name: string;
    weather: { status: 'GO' | 'HOLD'; reason: string };
    comm: { radio: 'GO' | 'HOLD' };
    cameras: { pad: 'online' | 'offline' };
  };
}

export const LaunchSequence: React.FC<LaunchSequenceProps> = ({
  onLaunchComplete,
  isAuthorized,
  scenario,
}) => {
  if (!isAuthorized) {
    const issues: string[] = [];
    if (scenario.weather.status === 'HOLD') {
      issues.push(`Weather: ${scenario.weather.reason}`);
    }
    if (scenario.comm.radio === 'HOLD') {
      issues.push('Radio: No signal');
    }
    if (scenario.cameras.pad === 'offline') {
      issues.push('Cameras: Launch pad camera is off');
    }

    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div className="stage-header">
          <h2 className="stage-title">STAGE 3: LAUNCH SEQUENCE</h2>
          <p className="stage-subtitle">Waiting for the all-clear...</p>
        </div>

        <div className="card-glass" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
          <div style={{ color: '#EF4444', fontFamily: 'Orbitron', fontSize: '1.5rem', marginBottom: '1rem' }}>
            ⚠️ NOT READY TO LAUNCH
          </div>
          <p style={{ color: '#CBD5E1', marginBottom: '1.5rem' }}>
            These checks must be ready before we start the countdown:
          </p>
          <ul style={{ textAlign: 'left', color: '#CBD5E1', paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            {issues.map((issue) => (
              <li key={issue} style={{ marginBottom: '0.5rem' }}>✗ {issue}</li>
            ))}
            {issues.length === 0 && (
              <li style={{ marginBottom: '0.5rem' }}>✗ Check all six rocket systems</li>
            )}
          </ul>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <p style={{ color: '#F59E0B', fontFamily: 'Orbitron', fontSize: '0.9rem', margin: 0 }}>
              Finish the launch checks in the previous stage before starting the countdown.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <LaunchCountdown onLaunchComplete={onLaunchComplete} />;
};

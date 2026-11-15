import React, { useState } from 'react';
import { LaunchSystem } from '../types';

interface LaunchReadinessProps {
  systems: LaunchSystem[];
  onCompleteSystem: (systemId: string) => void;
  onProceedToCountdown: () => void;
}

export const LaunchReadiness: React.FC<LaunchReadinessProps> = ({
  systems,
  onCompleteSystem,
  onProceedToCountdown
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(systems[0]?.id || null);
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);

  const activeSystem = systems.find(s => s.id === selectedId);
  const completedCount = systems.filter(s => s.completed).length;
  const isAllReady = completedCount === systems.length;

  const handleOptionSelect = (option: { label: string; value: 'go' | 'hold'; correct: boolean; explanation: string }) => {
    setFeedback({ message: option.explanation, isCorrect: option.correct });
    if (option.correct && activeSystem) {
      onCompleteSystem(activeSystem.id);
    }
  };

  return (
    <div>
      <div className="stage-header">
        <h2 className="stage-title">STAGE 2: GET READY FOR LAUNCH</h2>
        <p className="stage-subtitle">Check each system. Choose GO if it is ready, or HOLD if it needs attention.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        <div className="card-glass">
          <h3 style={{ fontFamily: 'Orbitron', fontSize: '1rem', marginBottom: '1rem', color: '#94A3B8' }}>
            SYSTEMS CHECK ({completedCount}/{systems.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {systems.map((sys) => (
              <button
                key={sys.id}
                onClick={() => { setSelectedId(sys.id); setFeedback(null); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.6rem 0.8rem', borderRadius: '6px',
                  background: selectedId === sys.id ? 'rgba(37, 99, 235, 0.3)' : 'rgba(255,255,255,0.05)',
                  border: selectedId === sys.id ? '1px solid #3B82F6' : '1px solid transparent',
                  color: '#fff', cursor: 'pointer', textAlign: 'left'
                }}
              >
                <span>{sys.icon} {sys.name}</span>
                {sys.completed ? (
                  <span style={{ background: '#10B981', color: '#fff', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontFamily: 'Orbitron' }}>GO</span>
                ) : (
                  <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontFamily: 'Orbitron' }}>HOLD</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="card-glass">
          {activeSystem && (
            <div>
              <h3 style={{ fontFamily: 'Orbitron', fontSize: '1.2rem', marginBottom: '0.5rem' }}>{activeSystem.icon} {activeSystem.name}</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '1rem' }}>{activeSystem.description}</p>
              
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <p style={{ fontSize: '1rem', color: '#E2E8F0' }}>{activeSystem.question}</p>
              </div>

              {activeSystem.completed ? (
                <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10B981', padding: '0.8rem', borderRadius: '6px', textAlign: 'center' }}>
                  <h4 style={{ color: '#10B981', fontFamily: 'Orbitron' }}>✓ SYSTEM CHECKED AND READY</h4>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {activeSystem.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(opt)}
                      style={{
                        flex: 1, padding: '0.8rem', borderRadius: '6px', border: 'none',
                        background: opt.value === 'go' ? '#10B981' : '#EF4444',
                        color: '#fff', fontFamily: 'Orbitron', fontWeight: 'bold', cursor: 'pointer'
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {feedback && (
                <div style={{ marginTop: '1rem', padding: '0.8rem', borderRadius: '6px', background: feedback.isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', border: `1px solid ${feedback.isCorrect ? '#10B981' : '#EF4444'}` }}>
                  <p style={{ fontSize: '0.9rem' }}>{feedback.message}</p>
                </div>
              )}
            </div>
          )}

          {isAllReady && (
            <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
              <p style={{ color: '#10B981', fontFamily: 'Orbitron', fontSize: '1rem', marginBottom: '0.8rem' }}>
                🌟 ALL SYSTEMS READY! SATURN V CAN LAUNCH!
              </p>
              <button className="btn-primary" onClick={onProceedToCountdown}>
                ⏱️ START THE LAUNCH COUNTDOWN
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
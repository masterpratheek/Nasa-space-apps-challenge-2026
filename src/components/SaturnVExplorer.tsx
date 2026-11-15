import React, { useEffect, useState } from 'react';
import { SATURN_V_STAGES } from '../data/missionData';

interface SaturnVExplorerProps {
  onComplete: () => void;
  onTutorContextChange?: (topic: string | null) => void;
}

export const SaturnVExplorer: React.FC<SaturnVExplorerProps> = ({ onComplete, onTutorContextChange }) => {
  const [selectedStageId, setSelectedStageId] = useState<string>('s-ic');
  const [separatedStages, setSeparatedStages] = useState<string[]>([]);

  const activeStage = SATURN_V_STAGES.find(s => s.id === selectedStageId) || SATURN_V_STAGES[0];

  useEffect(() => {
    onTutorContextChange?.(`saturnv:${selectedStageId}`);
    return () => onTutorContextChange?.(null);
  }, [onTutorContextChange, selectedStageId]);

  const handleSeparate = (stageId: string) => {
    if (!separatedStages.includes(stageId)) {
      setSeparatedStages(prev => [...prev, stageId]);
    }
  };

  return (
    <div>
      <div className="stage-header">
        <h2 className="stage-title">STAGE 5: EXPLORE THE SUPER ROCKET</h2>
        <p className="stage-subtitle">Tap a rocket stage to learn how it helps Super Rocket climb. Empty stages fall away so the rocket can keep going.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
        <div className="card-glass" data-mentor-focus="rocket" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', height: '420px' }}>
          <div style={{ width: '40px', height: '40px', background: '#e2e8f0', borderRadius: '20px 20px 0 0', border: '2px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold', color: '#000' }}>LUNA</div>

          <div onClick={() => setSelectedStageId('s-ivb')} style={{ width: '65px', height: '60px', background: selectedStageId === 's-ivb' ? 'rgba(59, 130, 246, 0.4)' : '#475569', border: '2px solid #3B82F6', marginTop: separatedStages.includes('s-ivb') ? '15px' : '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: '10px', color: '#fff' }}>S-IVB</span>
          </div>

          <div onClick={() => setSelectedStageId('s-ii')} style={{ width: '85px', height: '90px', background: selectedStageId === 's-ii' ? 'rgba(59, 130, 246, 0.4)' : '#334155', border: '2px solid #3B82F6', marginTop: separatedStages.includes('s-ii') ? '20px' : '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: '11px', color: '#fff' }}>S-II</span>
          </div>

          <div onClick={() => setSelectedStageId('s-ic')} style={{ width: '105px', height: '120px', background: selectedStageId === 's-ic' ? 'rgba(59, 130, 246, 0.4)' : '#1e293b', border: '2px solid #3B82F6', marginTop: separatedStages.includes('s-ic') ? '25px' : '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: '12px', color: '#fff' }}>S-IC</span>
          </div>
        </div>

        <div className="card-glass">
          <h3 style={{ fontFamily: 'Orbitron', fontSize: '1.4rem', color: '#fff' }}>{activeStage.name}</h3>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: '0.5rem 0 1rem' }}>{activeStage.description}</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '4px' }}>
              <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>ENGINES:</span>
              <p style={{ fontSize: '0.8rem', color: '#60A5FA', fontWeight: 'bold' }}>{activeStage.engines}</p>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '4px' }}>
              <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>FUEL:</span>
              <p style={{ fontSize: '0.8rem', color: '#60A5FA', fontWeight: 'bold' }}>{activeStage.fuel}</p>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '4px' }}>
              <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>BURN TIME:</span>
              <p style={{ fontSize: '0.8rem', color: '#60A5FA', fontWeight: 'bold' }}>{activeStage.burnTime}</p>
            </div>
          </div>

          <ul style={{ paddingLeft: '1rem', marginBottom: '1.5rem', color: '#CBD5E1', fontSize: '0.85rem' }}>
            {activeStage.facts.map((fact, idx) => <li key={idx}>{fact}</li>)}
          </ul>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
            <button
              onClick={() => handleSeparate(activeStage.id)}
              disabled={separatedStages.includes(activeStage.id)}
              style={{
                background: separatedStages.includes(activeStage.id) ? '#475569' : '#EF4444',
                color: '#fff', border: 'none', padding: '0.6rem 1rem', borderRadius: '6px',
                fontFamily: 'Orbitron', fontWeight: 'bold', cursor: 'pointer'
              }}
            >
              {separatedStages.includes(activeStage.id) ? '✓ STAGE RELEASED' : '💥 RELEASE THIS STAGE'}
            </button>
            <button className="btn-primary" onClick={onComplete}>NEXT: EARTH ORBIT ➔</button>
          </div>
        </div>
      </div>
    </div>
  );
};
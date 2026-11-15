import React, { useState } from 'react';
import { ATMOSPHERE_LAYERS } from '../data/missionData';

interface AtmosphereExplorerProps {
  onComplete: () => void;
}

export const AtmosphereExplorer: React.FC<AtmosphereExplorerProps> = ({ onComplete }) => {
  const [activeLayerIndex, setActiveLayerIndex] = useState<number>(0);
  const activeLayer = ATMOSPHERE_LAYERS[activeLayerIndex];

  return (
    <div>
      <div className="stage-header">
        <h2 className="stage-title">STAGE 4: EXPLORE EARTH'S ATMOSPHERE</h2>
        <p className="stage-subtitle">
          Follow Saturn V through Earth's five atmosphere layers on its way to space. Earth's gravity keeps pulling on the rocket!
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem' }}>
        {/* Vertical Atmospheric Layers Bar */}
        <div className="card-glass" style={{ display: 'flex', flexDirection: 'column-reverse', gap: '0.5rem', padding: '1rem' }}>
          {ATMOSPHERE_LAYERS.map((layer, idx) => (
            <button
              key={layer.name}
              onClick={() => setActiveLayerIndex(idx)}
              style={{
                flex: 1,
                minHeight: '60px',
                padding: '0.8rem',
                borderRadius: '6px',
                border: activeLayerIndex === idx ? '2px solid #fff' : '1px solid transparent',
                background: layer.color,
                color: '#fff',
                fontFamily: 'Orbitron',
                fontWeight: 'bold',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                boxShadow: activeLayerIndex === idx ? '0 0 15px rgba(255,255,255,0.4)' : 'none',
                opacity: activeLayerIndex === idx ? 1 : 0.75,
                transition: 'all 0.2s'
              }}
            >
              <div>
                <span style={{ fontSize: '1rem', display: 'block' }}>{layer.name}</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 'normal' }}>
                  {layer.altitudeRange[0]} - {layer.altitudeRange[1]} km
                </span>
              </div>
              {activeLayerIndex === idx && <span>🚀</span>}
            </button>
          ))}
        </div>

        {/* Selected Layer Info & Scientific Science Panel */}
        <div className="card-glass">
          <div style={{ borderBottom: `3px solid ${activeLayer.color}`, paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ color: '#06B6D4', fontFamily: 'Orbitron', fontSize: '0.85rem' }}>HOW HIGH?</span>
            <h3 style={{ fontFamily: 'Orbitron', fontSize: '1.8rem', color: '#fff' }}>{activeLayer.name} Layer</h3>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', marginTop: '0.4rem' }}>{activeLayer.description}</p>
          </div>

          <h4 style={{ fontFamily: 'Orbitron', fontSize: '1rem', color: '#F59E0B', marginBottom: '0.75rem' }}>
            SPACE FACTS:
          </h4>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem', color: '#CBD5E1', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {activeLayer.facts.map((fact, idx) => (
              <li key={idx}>{fact}</li>
            ))}
          </ul>

          <div style={{ background: 'rgba(37, 99, 235, 0.15)', border: '1px solid rgba(59, 130, 246, 0.4)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
            <h4 style={{ fontFamily: 'Orbitron', fontSize: '0.9rem', color: '#60A5FA', marginBottom: '0.3rem' }}>
              💡 GRAVITY & SPACE:
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
              Earth's air gets thinner and thinner—there are no hard walls between the layers. Earth's gravity still pulls on the rocket, even high above Earth!
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
              Explored {activeLayerIndex + 1} of 5 sky layers
            </span>
            <button className="btn-primary" onClick={onComplete}>
              NEXT STAGE: ROCKET STAGING ➔
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
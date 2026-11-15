import React, { useEffect, useRef, useState, useCallback } from 'react';
import { DockingScene } from '../types';
import { SIVBStage } from './spacecraft/SIVBStage';
import { LunarModule } from './spacecraft/LunarModule';
import { CommandServiceModule } from './spacecraft/CommandServiceModule';
import { DockingAlignmentGuide } from './spacecraft/DockingAlignmentGuide';

interface SpacecraftDockingProps {
  onComplete: () => void;
  onTutorContextChange?: (topic: string | null) => void;
}

const EDUCATIONAL_MESSAGES: Record<string, string> = {
  configuration: 'Meet the spacecraft: the S-IVB rocket stage, Columbia (the Command and Service Module), and Eagle (the Lunar Module).',
  separation: 'Columbia leaves the S-IVB behind. The empty rocket stage stays in Earth orbit.',
  transposition: 'Columbia turns around 180° so its docking end faces Eagle. This turn is called transposition.',
  approach: 'Columbia moves slowly toward Eagle. Their docking ports need to line up.',
  docking: 'The docking probes touch, and latches lock Columbia and Eagle together.',
  extraction: 'Columbia pulls Eagle away from the S-IVB. The two spacecraft head toward the Moon together.',
  complete: 'Docking is complete! Columbia and Eagle are joined and ready to travel to the Moon.'
};

const SCENES: { id: DockingScene; label: string; order: number }[] = [
  { id: 'configuration', label: 'Meet the spacecraft', order: 0 },
  { id: 'separation', label: 'S-IVB separation', order: 1 },
  { id: 'transposition', label: '180\u00b0 turn', order: 2 },
  { id: 'approach', label: 'Move toward Eagle', order: 2 },
  { id: 'docking', label: 'Docking', order: 3 },
  { id: 'extraction', label: 'Eagle leaves the S-IVB', order: 4 },
  { id: 'complete', label: 'Ready for the Moon', order: 5 },
];

const SPACECRAFT_LABELS = [
  { id: 'sivb', name: 'S-IVB Stage', color: '#64748b' },
  { id: 'columbia', name: 'Columbia (CSM)', color: '#f59e0b' },
  { id: 'eagle', name: 'Eagle (LM)', color: '#10b981' },
];

export const SpacecraftDocking: React.FC<SpacecraftDockingProps> = ({ onComplete, onTutorContextChange }) => {
  const [scene, setScene] = useState<DockingScene>('configuration');
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const timer = useRef<number | null>(null);

  const sceneIndex = SCENES.findIndex((item) => item.id === scene);
  const nextScene = SCENES[sceneIndex + 1];
  const isComplete = scene === 'complete';
  const alignmentProgress =
    scene === 'approach' || scene === 'docking'
      ? progress
      : scene === 'extraction' || isComplete
        ? 100
        : 0;

  useEffect(() => {
    onTutorContextChange?.(`docking:${scene}`);
    return () => onTutorContextChange?.(null);
  }, [onTutorContextChange, scene]);

  useEffect(() => () => {
    if (timer.current !== null) window.clearInterval(timer.current);
  }, []);

  const startNextScene = useCallback(() => {
    if (!nextScene || isAnimating) return;

    let nextProgress = 0;
    setProgress(0);
    setIsAnimating(true);
    timer.current = window.setInterval(() => {
      nextProgress = Math.min(nextProgress + 5, 100);
      setProgress(nextProgress);

      if (nextProgress === 100) {
        if (timer.current !== null) window.clearInterval(timer.current);
        timer.current = null;
        setScene(nextScene.id);
        setIsAnimating(false);
      }
    }, 50);
  }, [isAnimating, nextScene]);

  return (
    <div>
      <div className="stage-header">
        <h2 className="stage-title">STAGE 8: COLUMBIA MEETS EAGLE</h2>
        <p className="stage-subtitle">Columbia turns around and docks with Eagle. Together, they head for the Moon.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
        <div className="card-glass">
          <h3 style={{ fontFamily: 'Orbitron', fontSize: '1rem', color: '#94A3B8', marginBottom: '1rem' }}>
            DOCKING SEQUENCE
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {SCENES.map((item, index) => (
              <div
                key={item.id}
                style={{
                  padding: '0.65rem 0.8rem',
                  borderRadius: '6px',
                  border: scene === item.id ? '1px solid #3B82F6' : '1px solid transparent',
                  background: scene === item.id ? 'rgba(37, 99, 235, 0.25)' : 'rgba(255,255,255,0.04)',
                  color: index < sceneIndex ? '#10B981' : scene === item.id ? '#fff' : '#94A3B8',
                  fontFamily: 'Orbitron',
                  fontSize: '0.75rem',
                }}
              >
                {index < sceneIndex ? '✓ ' : ''}{item.label}
              </div>
            ))}
          </div>
        </div>

        <div className="card-glass" data-mentor-focus="docking" style={{ minHeight: '420px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-around', overflow: 'hidden' }}>
            {scene !== 'extraction' && !isComplete && (
              <div style={{ opacity: scene === 'separation' || scene === 'transposition' || scene === 'approach' || scene === 'docking' ? 0.45 : 1 }}>
                <SIVBStage />
              </div>
            )}
            <div style={{ transform: scene === 'transposition' || scene === 'approach' || scene === 'docking' || scene === 'extraction' || isComplete ? 'rotate(180deg)' : 'none', transition: 'transform 0.5s ease' }}>
              <CommandServiceModule />
            </div>
            <LunarModule />
            {(scene === 'approach' || scene === 'docking' || scene === 'extraction' || isComplete) && (
              <div style={{ position: 'absolute', bottom: '0.5rem', left: '50%', transform: 'translateX(-50%)' }}>
                <DockingAlignmentGuide progress={alignmentProgress} error={scene === 'approach' ? 10 : 0} />
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
            <h3 style={{ fontFamily: 'Orbitron', color: '#fff', marginBottom: '0.5rem' }}>
              {SCENES[sceneIndex]?.label}
            </h3>
            <p style={{ color: '#CBD5E1', minHeight: '3rem', marginBottom: '1rem' }}>
              {EDUCATIONAL_MESSAGES[scene]}
            </p>
            {isComplete ? (
              <button className="btn-primary" style={{ width: '100%' }} onClick={onComplete}>
                NEXT: LUNAR ORBIT ➔
              </button>
            ) : (
              <button className="btn-primary" style={{ width: '100%' }} onClick={startNextScene} disabled={isAnimating}>
                {isAnimating ? '🔄 WORKING...' : `▶ ${nextScene?.label.toUpperCase()}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
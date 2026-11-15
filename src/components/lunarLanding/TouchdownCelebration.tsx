import React, { useEffect, useRef, useState } from 'react';
import { LunarEnvironment } from './LunarEnvironment';
import { LandingChecklist } from './LandingChecklist';

interface TouchdownCelebrationProps {
  isPlaying: boolean;
  reducedMotion: boolean;
  onSequenceComplete: () => void;
  onReplayTouchdown: () => void;
  onReplayDemonstration: () => void;
  onContinue: () => void;
}

const CELEBRATION_MESSAGES: Record<number, string> = {
  7: 'CONTACT LIGHT!',
  8: 'ENGINE STOP!',
  9: 'THE EAGLE HAS LANDED!',
};

const COMPLETED_CHECKLIST = [
  { id: 'area', label: 'Safe landing spot found', complete: true },
  { id: 'aligned', label: 'Eagle is steady', complete: true },
  { id: 'speed', label: 'Landing speed is safe', complete: true },
  { id: 'legs', label: 'Landing legs ready', complete: true },
  { id: 'touchdown', label: 'Gentle touchdown', complete: true },
];

export const TouchdownCelebration: React.FC<TouchdownCelebrationProps> = ({
  isPlaying,
  reducedMotion,
  onSequenceComplete,
  onReplayTouchdown,
  onReplayDemonstration,
  onContinue,
}) => {
  const [step, setStep] = useState(0);
  const completed = useRef(false);

  useEffect(() => {
    if (!isPlaying || step >= 9) return;

    const messageDelay = step >= 7 ? 1400 : 500;
    const delay = reducedMotion && step < 7 ? 150 : messageDelay;
    const timer = window.setTimeout(() => setStep((current) => Math.min(current + 1, 9)), delay);
    return () => window.clearTimeout(timer);
  }, [isPlaying, reducedMotion, step]);

  useEffect(() => {
    if (step === 9 && isPlaying && !completed.current) {
      completed.current = true;
      onSequenceComplete();
    }
  }, [isPlaying, onSequenceComplete, step]);

  const message = CELEBRATION_MESSAGES[step];
  const isFinished = step === 9;

  return (
    <section className="landing-celebration" aria-label="Luna 11 lunar touchdown">
      <div className={`landing-celebration-scene ${isFinished ? 'celebration-finished' : ''}`}>
        <LunarEnvironment
          mode="touchdown"
          x={54}
          altitude={0}
          touchdownStep={step}
          isThrusting={step < 4}
        />
        {message && !isFinished && (
          <div className={`landing-celebration-message ${step === 9 ? 'landing-celebration-title' : ''}`} aria-live="assertive">
            {message}
          </div>
        )}
      </div>

      {isFinished && (
        <div className="landing-history-card">
          <p className="landing-eyebrow">JULY 20, 1969 · SEA OF TRANQUILITY</p>
          <h2>THE EAGLE HAS LANDED!</h2>
          <p>
            On July 20, 1969, Luna 11 made history. Eagle landed on the Moon, and Neil Armstrong and Buzz Aldrin explored another world!
          </p>
          <LandingChecklist items={COMPLETED_CHECKLIST} />
          <div className="landing-celebration-actions">
            <button type="button" className="btn-primary" onClick={onContinue}>
              CONTINUE TO THE OUTPOST MISSION
            </button>
            <button type="button" className="btn-secondary" onClick={onReplayTouchdown}>
              ↻ WATCH THE LANDING AGAIN
            </button>
            <button type="button" className="btn-secondary" onClick={onReplayDemonstration}>
              ↻ WATCH LANDING DEMONSTRATION AGAIN
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

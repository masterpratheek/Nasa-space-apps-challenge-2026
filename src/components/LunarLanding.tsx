import React, { useCallback, useEffect, useState } from 'react';
import { LandingDemonstration } from './lunarLanding/LandingDemonstration';
import { LandingGame } from './lunarLanding/LandingGame';
import { TouchdownCelebration } from './lunarLanding/TouchdownCelebration';
import '../styles/lunar-landing.css';

interface LunarLandingProps {
  onComplete: () => void;
  onTutorContextChange?: (topic: string | null) => void;
}

type LandingExperienceMode = 'demonstration' | 'game' | 'touchdown' | 'landed';

export const LunarLanding: React.FC<LunarLandingProps> = ({ onComplete, onTutorContextChange }) => {
  const [mode, setMode] = useState<LandingExperienceMode>('demonstration');
  const [demonstrationRun, setDemonstrationRun] = useState(0);
  const [touchdownRun, setTouchdownRun] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(preference.matches);
    updatePreference();
    preference.addEventListener('change', updatePreference);
    return () => preference.removeEventListener('change', updatePreference);
  }, []);

  const finishDemonstration = useCallback(() => {
    setMode((currentMode) => currentMode === 'demonstration' ? 'game' : currentMode);
  }, []);

  const skipDemonstration = useCallback(() => setMode('game'), []);

  const replayDemonstration = useCallback(() => {
    setDemonstrationRun((run) => run + 1);
    setMode('demonstration');
  }, []);

  const beginTouchdown = useCallback(() => setMode('touchdown'), []);
  const finishTouchdown = useCallback(() => setMode('landed'), []);

  const replayTouchdown = useCallback(() => {
    setTouchdownRun((run) => run + 1);
    setMode('touchdown');
  }, []);

  useEffect(() => {
    onTutorContextChange?.(`landing-${mode}`);
    return () => onTutorContextChange?.(null);
  }, [mode, onTutorContextChange]);

  return (
    <div className="lunar-landing" data-mentor-focus="landing">
      {mode === 'demonstration' && (
        <LandingDemonstration
          key={demonstrationRun}
          reducedMotion={reducedMotion}
          onComplete={finishDemonstration}
          onSkip={skipDemonstration}
        />
      )}

      {mode === 'game' && (
        <LandingGame
          onSuccess={beginTouchdown}
          onReplayDemonstration={replayDemonstration}
        />
      )}

      {(mode === 'touchdown' || mode === 'landed') && (
        <TouchdownCelebration
          key={touchdownRun}
          isPlaying={mode === 'touchdown'}
          reducedMotion={reducedMotion}
          onSequenceComplete={finishTouchdown}
          onReplayTouchdown={replayTouchdown}
          onReplayDemonstration={replayDemonstration}
          onContinue={onComplete}
        />
      )}
    </div>
  );
};

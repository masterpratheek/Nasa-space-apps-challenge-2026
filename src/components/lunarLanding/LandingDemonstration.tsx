import React, { useEffect, useRef, useState } from 'react';
import { LunarEnvironment } from './LunarEnvironment';

interface LandingDemonstrationProps {
  reducedMotion: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const APPROACH_DURATION = 3200;
const PHASE_DURATION = 3000;
const SUMMARY_DURATION = 2200;
const DEMO_DURATION = APPROACH_DURATION + PHASE_DURATION * 4 + SUMMARY_DURATION;

const DEMO_PHASES = [
  {
    name: 'PDI — POWERED DESCENT INITIATION',
    heading: 'TIME TO BEGIN OUR DESCENT!',
    explanation: 'PDI means Powered Descent Initiation. Eagle starts its landing engine and begins moving down toward the Moon!',
  },
  {
    name: 'BRAKING PHASE — P63',
    heading: 'SLOW DOWN, EAGLE!',
    explanation: 'Eagle is moving fast. Its engine pushes back to slow down for a safer landing.',
  },
  {
    name: 'APPROACH PHASE — P64',
    heading: 'FIND A SAFE PLACE TO LAND!',
    explanation: 'The Moon has craters and rocks. The astronauts look for a smooth, clear place to land.',
  },
  {
    name: 'LANDING PHASE — P66',
    heading: 'GENTLE AND STEADY... ALMOST THERE!',
    explanation: 'Eagle is close to the ground. The astronauts guide it gently until its landing pads touch the Moon.',
  },
];

export const LandingDemonstration: React.FC<LandingDemonstrationProps> = ({
  reducedMotion,
  onComplete,
  onSkip,
}) => {
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const completionCalled = useRef(false);

  useEffect(() => {
    if (isPaused || elapsed >= DEMO_DURATION) return;

    const timer = window.setInterval(() => {
      setElapsed((time) => Math.min(time + (reducedMotion ? 100 : 50), DEMO_DURATION));
    }, 50);
    return () => window.clearInterval(timer);
  }, [elapsed, isPaused, reducedMotion]);

  useEffect(() => {
    if (elapsed >= DEMO_DURATION && !completionCalled.current) {
      completionCalled.current = true;
      onComplete();
    }
  }, [elapsed, onComplete]);

  const isApproach = elapsed < APPROACH_DURATION;
  const demoElapsed = Math.max(0, elapsed - APPROACH_DURATION);
  const isSummary = demoElapsed >= PHASE_DURATION * DEMO_PHASES.length;
  const phaseIndex = Math.min(
    DEMO_PHASES.length - 1,
    Math.floor(demoElapsed / PHASE_DURATION),
  );
  const phaseProgress = isSummary
    ? 1
    : isApproach
      ? elapsed / APPROACH_DURATION
      : (demoElapsed % PHASE_DURATION) / PHASE_DURATION;
  const phase = DEMO_PHASES[phaseIndex];

  return (
    <section className="landing-demo" aria-label="Luna 11 landing demonstration">
      <div className="landing-stage-heading">
        <p className="landing-eyebrow">STAGE 10 · LUNA 11 LUNAR LANDING</p>
        <h2>{isApproach ? 'CINEMATIC MOON APPROACH' : isSummary ? 'NOW YOU KNOW HOW EAGLE LANDS!' : phase.heading}</h2>
        <p>
          {isApproach
            ? 'Welcome to the Moon, Junior Mission Controller!'
            : isSummary
              ? 'You watched Eagle leave Columbia, slow down, find a safe spot and land on the Moon.'
              : phase.explanation}
        </p>
      </div>

      <div className={`landing-demo-scene ${isPaused ? 'demo-paused' : ''}`}>
        <LunarEnvironment
          mode={isApproach ? 'cinematic' : 'demo'}
          progress={phaseProgress}
          phaseIndex={phaseIndex}
        />
        <div className="landing-demo-hud">
          <span>{isApproach ? 'MOON APPROACH' : isSummary ? 'DEMONSTRATION COMPLETE' : phase.name}</span>
          <span>LEARNING SIMULATION · NOT REAL LUNA DATA</span>
          {!isApproach && !isSummary && (
            <span>
              SIMULATED ALTITUDE: {Math.max(0, 1000 - phaseIndex * 245 - Math.round(phaseProgress * 240))} m
              {' · '}SIMULATED SPEED: {Math.round(4 + phaseIndex * 3 + phaseProgress * 2)} m/s
            </span>
          )}
        </div>
      </div>

      <div className="landing-demo-story">
        <p>
          Neil Armstrong and Buzz Aldrin are aboard Eagle. Michael Collins stays in Columbia while Eagle gets ready to land.
        </p>
        {phaseIndex === 2 && !isApproach && !isSummary && (
          <p className="landing-history-note">
            Neil Armstrong saw that the computer&apos;s landing spot was rocky and unsafe. He steered Eagle toward a safer place.
          </p>
        )}
      </div>

      <div className="landing-demo-footer">
        <div className="landing-demo-progress" aria-label="Demonstration progress">
          {['Moon approach', 'PDI', 'P63', 'P64', 'P66'].map((step, index) => {
            const activeIndex = isApproach ? 0 : isSummary ? 5 : phaseIndex + 1;
            return (
              <span key={step} className={index < activeIndex ? 'step-done' : index === activeIndex ? 'step-active' : ''}>
                {step}
              </span>
            );
          })}
        </div>
        <div className="landing-demo-actions">
          <button type="button" className="btn-secondary" onClick={() => setIsPaused((paused) => !paused)}>
            {isPaused ? '▶ RESUME DEMONSTRATION' : '⏸ PAUSE DEMONSTRATION'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              completionCalled.current = false;
              setElapsed(0);
              setIsPaused(false);
            }}
          >
            ↻ WATCH DEMONSTRATION AGAIN
          </button>
          <button type="button" className="btn-primary" onClick={onSkip}>
            SKIP TO LANDING CHALLENGE ➔
          </button>
        </div>
        {isSummary && (
          <p className="landing-auto-transition" aria-live="polite">
            The landing challenge starts in a moment.
          </p>
        )}
      </div>
    </section>
  );
};

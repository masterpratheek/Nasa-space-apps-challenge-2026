import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LandingChecklist, LandingChecklistItem } from './LandingChecklist';
import { LandingControl, LandingControls } from './LandingControls';
import { LunarEnvironment } from './LunarEnvironment';

interface LandingGameProps {
  onSuccess: () => void;
  onReplayDemonstration: () => void;
}

type GameStatus = 'active' | 'failed' | 'touchdown';

interface GameState {
  x: number;
  horizontalDrift: number;
  altitude: number;
  descentSpeed: number;
  landingLegsReady: boolean;
  status: GameStatus;
  failureReason: string;
}

const INITIAL_GAME_STATE: GameState = {
  x: 72,
  horizontalDrift: 0,
  altitude: 240,
  descentSpeed: 0,
  landingLegsReady: false,
  status: 'active',
  failureReason: '',
};

const SAFE_ZONE = { min: 48, max: 61, center: 54 };
const OBSTACLES = [10, 24, 33, 37, 67, 72, 80, 88];
const MAX_SAFE_SPEED = 4.5;
const MIN_SAFE_SPEED = 1.2;
const STABLE_DRIFT = 0.3;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const LandingGame: React.FC<LandingGameProps> = ({ onSuccess, onReplayDemonstration }) => {
  const [game, setGame] = useState<GameState>(INITIAL_GAME_STATE);
  const [activeControls, setActiveControls] = useState<ReadonlySet<LandingControl>>(new Set());
  const pointerControls = useRef(new Map<number, LandingControl>());
  const keyboardControls = useRef(new Set<LandingControl>());
  const activeControlsRef = useRef<ReadonlySet<LandingControl>>(new Set());
  const successSent = useRef(false);

  const syncActiveControls = useCallback(() => {
    const controls = new Set<LandingControl>([
      ...pointerControls.current.values(),
      ...keyboardControls.current,
    ]);
    activeControlsRef.current = controls;
    setActiveControls(controls);
  }, []);

  const clearControls = useCallback(() => {
    pointerControls.current.clear();
    keyboardControls.current.clear();
    syncActiveControls();
  }, [syncActiveControls]);

  const handleControlStart = useCallback((control: LandingControl, pointerId: number) => {
    pointerControls.current.set(pointerId, control);
    syncActiveControls();
  }, [syncActiveControls]);

  const handleControlEnd = useCallback((pointerId: number) => {
    pointerControls.current.delete(pointerId);
    syncActiveControls();
  }, [syncActiveControls]);

  useEffect(() => {
    const keyboardMap: Record<string, LandingControl> = {
      ArrowLeft: 'left',
      KeyA: 'left',
      ArrowRight: 'right',
      KeyD: 'right',
      ArrowDown: 'descend',
      KeyS: 'descend',
      Space: 'stabilize',
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const control = keyboardMap[event.code];
      if (!control || game.status !== 'active') return;
      event.preventDefault();
      keyboardControls.current.add(control);
      syncActiveControls();
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const control = keyboardMap[event.code];
      if (!control) return;
      keyboardControls.current.delete(control);
      syncActiveControls();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', clearControls);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', clearControls);
    };
  }, [clearControls, game.status, syncActiveControls]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const controls = activeControlsRef.current;
      const direction = Number(controls.has('right')) - Number(controls.has('left'));
      const stabilize = controls.has('stabilize');
      const descend = controls.has('descend');

      setGame((previous) => {
        if (previous.status !== 'active') return previous;

        let horizontalDrift = clamp(previous.horizontalDrift + direction * 0.22, -1.2, 1.2);
        horizontalDrift *= stabilize ? 0.48 : 0.88;
        const x = clamp(previous.x + horizontalDrift * 2.8, 5, 95);
        if (x === 5 || x === 95) horizontalDrift = 0;

        const descentSpeed = descend
          ? Math.min(previous.descentSpeed + 0.2, 6)
          : Math.max(previous.descentSpeed - 0.15, 0);
        const altitude = Math.max(0, previous.altitude - descentSpeed * 1.15);
        const landingLegsReady = previous.landingLegsReady || altitude <= 35;
        const nextState: GameState = {
          ...previous,
          x,
          horizontalDrift,
          altitude,
          descentSpeed,
          landingLegsReady,
        };

        if (altitude > 0) return nextState;

        if (x < SAFE_ZONE.min || x > SAFE_ZONE.max) {
          return { ...nextState, status: 'failed', failureReason: 'Eagle landed outside the safe zone. Aim for the clear area and try again.' };
        }
        if (descentSpeed > MAX_SAFE_SPEED) {
          return { ...nextState, status: 'failed', failureReason: 'Eagle came down too fast. Slow down before the landing pads touch the Moon.' };
        }
        if (descentSpeed < MIN_SAFE_SPEED) {
          return { ...nextState, status: 'failed', failureReason: 'Eagle slowed down too much. Keep moving gently downward to land.' };
        }
        if (Math.abs(horizontalDrift) > STABLE_DRIFT) {
          return { ...nextState, status: 'failed', failureReason: 'Eagle was still drifting sideways. Steady it before landing.' };
        }

        return { ...nextState, status: 'touchdown' };
      });
    }, 100);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (game.status === 'touchdown' && !successSent.current) {
      successSent.current = true;
      clearControls();
      onSuccess();
    }
    if (game.status !== 'active') clearControls();
  }, [clearControls, game.status, onSuccess]);

  const nearObstacle = OBSTACLES.some((obstacle) => Math.abs(game.x - obstacle) <= 5);
  const inSafeZone = game.x >= SAFE_ZONE.min && game.x <= SAFE_ZONE.max;
  const eagleAligned = inSafeZone && Math.abs(game.horizontalDrift) <= STABLE_DRIFT;
  const speedControlled = game.descentSpeed >= MIN_SAFE_SPEED && game.descentSpeed <= MAX_SAFE_SPEED;
  const progress = Math.round(((INITIAL_GAME_STATE.altitude - game.altitude) / INITIAL_GAME_STATE.altitude) * 100);

  const feedback = nearObstacle
    ? 'LOOK OUT! A CRATER AHEAD!'
    : !inSafeZone
      ? 'STEER TOWARD THE SAFE LANDING AREA!'
      : game.descentSpeed > MAX_SAFE_SPEED
        ? 'TOO FAST! SLOW DOWN!'
        : game.altitude <= 32
          ? 'ALMOST THERE!'
          : !eagleAligned
            ? 'STEADY EAGLE!'
            : speedControlled
              ? 'GREAT JOB! HOLD STEADY!'
              : 'Press DESCEND to start moving down gently.';

  const checklist: LandingChecklistItem[] = [
    { id: 'area', label: 'Safe landing spot found', complete: true },
    { id: 'aligned', label: 'Eagle is steady', complete: eagleAligned },
    { id: 'speed', label: 'Landing speed is safe', complete: speedControlled },
    { id: 'legs', label: 'Landing legs ready', complete: game.landingLegsReady },
    { id: 'touchdown', label: 'Gentle touchdown', complete: false },
  ];

  const retry = () => {
    successSent.current = false;
    clearControls();
    setGame(INITIAL_GAME_STATE);
  };

  return (
    <section className="landing-game">
      <div className="landing-stage-heading">
        <p className="landing-eyebrow">STAGE 10 · YOUR TURN</p>
        <h2>YOUR TURN, JUNIOR MISSION CONTROLLER!</h2>
        <p>Help Eagle find a safe place and land gently on the Moon!</p>
      </div>

      <div className="landing-game-layout">
        <div className="landing-game-visual">
          <LunarEnvironment
            mode="game"
            x={game.x}
            altitude={game.altitude}
            horizontalDrift={game.horizontalDrift}
            isThrusting={activeControls.has('descend') && game.altitude > 0}
          />
          <div className="landing-game-hud">
            <div className="landing-game-status">
              <span className="landing-status-dot" />
              {game.status === 'active' ? 'LANDING IN PROGRESS' : 'TRY AGAIN'}
            </div>
            <p>GAME VALUES · NOT DATA FROM THE REAL APOLLO FLIGHT</p>
            <div className="landing-metrics">
              <div><span>GAME ALTITUDE</span><strong>{Math.round(game.altitude)} m</strong></div>
              <div><span>GAME DESCENT SPEED</span><strong>{game.descentSpeed.toFixed(1)} m/s</strong></div>
              <div><span>LANDING PROGRESS</span><strong>{progress}%</strong></div>
            </div>
            <div className="landing-progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Landing progress">
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="landing-game-side">
          <section className="landing-panel landing-feedback" aria-live="polite">
            <span className="landing-panel-label">MISSION CONTROL</span>
            <strong>{game.status === 'failed' ? 'TRY AGAIN — YOU CAN DO IT!' : feedback}</strong>
            {game.status === 'failed' && <p>{game.failureReason}</p>}
          </section>

          <LandingControls
            activeControls={activeControls}
            disabled={game.status !== 'active'}
            onControlStart={handleControlStart}
            onControlEnd={handleControlEnd}
          />

          {game.status === 'failed' ? (
            <div className="landing-game-actions">
              <button type="button" className="btn-primary" onClick={retry}>↻ RETRY LANDING</button>
              <button type="button" className="btn-secondary" onClick={onReplayDemonstration}>↻ WATCH DEMONSTRATION AGAIN</button>
            </div>
          ) : (
            <button type="button" className="btn-secondary landing-replay-demo" onClick={onReplayDemonstration}>
              ↻ WATCH LANDING DEMONSTRATION
            </button>
          )}

          <LandingChecklist items={checklist} />
        </div>
      </div>
    </section>
  );
};

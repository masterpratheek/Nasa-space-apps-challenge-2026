import React, { useEffect, useState } from 'react';
import { INITIAL_LAUNCH_SYSTEMS } from '../data/missionData';
import { SCENARIOS } from '../data/launchScenarios';
import { MissionStage, MissionState } from '../types';
import { EagleSpacecraft } from './lunarLanding/EagleSpacecraft';
import '../styles/mission-debrief.css';

interface MissionDebriefProps {
  missionState: MissionState;
  onReplayMission: () => void;
  onReplayLanding: () => void;
  onReplayOutpost: () => void;
}

type DebriefPhase = 'return' | 'report' | 'celebration';

const REPORT_MILESTONES: { id: string; label: string; stage?: MissionStage }[] = [
  { id: 'briefing', label: 'Mission briefing', stage: 'welcome' },
  { id: 'readiness', label: 'Ready for launch', stage: 'prelaunch' },
  { id: 'countdown', label: 'Countdown and Super Rocket liftoff', stage: 'countdown' },
  { id: 'ascent', label: 'Climbing through Earth’s atmosphere', stage: 'atmosphere' },
  { id: 'orbit', label: 'Orbiting Earth', stage: 'earthorbit' },
  { id: 'tli', label: 'TLI: engine push toward the Moon', stage: 'translunar' },
  { id: 'docking', label: 'Columbia and Eagle docked', stage: 'docking' },
  { id: 'lunar-orbit', label: 'Luna 11 entered lunar orbit', stage: 'lunarorbit' },
  { id: 'descent', label: 'Eagle’s descent to the Moon', stage: 'landing' },
  { id: 'landing', label: 'Landed safely on the Moon', stage: 'landing' },
  { id: 'outpost-established', label: 'Outpost ready', stage: 'outpost' },
  { id: 'outpost-sustainability', label: 'Crew cared for over 10 days', stage: 'outpost' },
];

export const MissionDebrief: React.FC<MissionDebriefProps> = ({
  missionState,
  onReplayMission,
  onReplayLanding,
  onReplayOutpost,
}) => {
  const [phase, setPhase] = useState<DebriefPhase>('return');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(preference.matches);
    updatePreference();
    preference.addEventListener('change', updatePreference);
    return () => preference.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (phase !== 'return') return;
    const timer = window.setTimeout(
      () => setPhase('report'),
      reducedMotion ? 1600 : 5200,
    );
    return () => window.clearTimeout(timer);
  }, [phase, reducedMotion]);

  const missionSucceeded = missionState.landingComplete
    && missionState.completedStages.has('landing')
    && missionState.completedStages.has('outpost')
    && missionState.outpost?.status === 'success';
  const scenario = SCENARIOS[missionState.selectedScenario];
  const readinessComplete = INITIAL_LAUNCH_SYSTEMS.every(
    (system) => missionState.launchChecks[system.id],
  )
    && scenario?.weather.status === 'GO'
    && scenario?.comm.radio === 'GO'
    && scenario?.cameras.pad === 'online'
    && missionState.completedStages.has('prelaunch');

  const isMilestoneComplete = (id: string, stage?: MissionStage) => {
    if (id === 'readiness') return readinessComplete;
    if (id === 'countdown') {
      return missionState.launchComplete && Boolean(stage && missionState.completedStages.has(stage));
    }
    if (id === 'descent' || id === 'landing') return missionSucceeded;
    if (id === 'outpost-established' || id === 'outpost-sustainability') {
      return missionState.outpost?.status === 'success'
        && missionState.completedStages.has('outpost');
    }
    return Boolean(stage && missionState.completedStages.has(stage));
  };

  if (phase === 'return') {
    return (
      <section className="debrief-return" aria-label="Return to mission control">
        <div className="debrief-return-scene" data-mentor-focus="report">
          <div className="debrief-stars" aria-hidden="true">
            {Array.from({ length: 22 }, (_, index) => <i key={index} />)}
          </div>
          <div className="debrief-return-moon" aria-hidden="true" />
          <div className="debrief-return-earth" aria-hidden="true"><span>EARTH</span></div>
          <div className="debrief-return-capsule" aria-hidden="true">LUNA 11</div>
          <div className="debrief-control-center" aria-hidden="true">
            <span>MISSION CONTROL</span><i /><i /><i />
          </div>
          <div className="debrief-return-copy">
            <p className="debrief-eyebrow">LUNA 11 · WELCOME BACK</p>
            <h1>{missionSucceeded ? 'MISSION COMPLETE!' : 'MISSION REVIEW'}</h1>
            <p>
              {missionSucceeded
                ? 'Welcome back, Junior Mission Controller!'
                : 'Review your progress, Junior Mission Controller.'}
            </p>
          </div>
        </div>
        <button className="btn-primary debrief-return-button" type="button" onClick={() => setPhase('report')}>
          CONTINUE TO MISSION REPORT
        </button>
        <p className="debrief-auto-note" aria-live="polite">
          {missionSucceeded ? 'Arriving at Mission Control…' : 'Opening your mission report…'}
        </p>
      </section>
    );
  }

  if (phase === 'report') {
    return (
      <section className="mission-debrief" data-mentor-focus="report" aria-labelledby="mission-report-title">
        <header className="debrief-header" data-mentor-focus="report">
          <p className="debrief-eyebrow">YOUR LUNA 11 JOURNEY</p>
          <h1 id="mission-report-title">MISSION REPORT</h1>
          <p>See what you did on Luna 11 and how you cared for the outpost crew.</p>
          <strong className={`mission-status ${missionSucceeded ? 'mission-status-success' : 'mission-status-progress'}`}>
            MISSION STATUS: {missionSucceeded ? 'SUCCESS' : 'IN PROGRESS'}
          </strong>
        </header>

        <div className="mission-report-grid">
          {REPORT_MILESTONES.map((milestone, index) => {
            const complete = isMilestoneComplete(milestone.id, milestone.stage);
            return (
              <article
                className={`mission-report-card ${complete ? 'milestone-complete' : 'milestone-pending'}`}
                key={milestone.id}
                style={{ animationDelay: `${index * 65}ms` }}
              >
                <span className="milestone-icon" aria-hidden="true">{complete ? '✓' : '·'}</span>
                <div>
                  <span className="milestone-label">{milestone.label}</span>
                  <small>{complete ? 'DONE' : 'NOT YET'}</small>
                </div>
              </article>
            );
          })}
        </div>

        {missionState.outpost && (
          <article className="outpost-report-summary card-glass">
            <div>
              <p className="debrief-eyebrow">OUTPOST REPORT</p>
              <h2>{missionState.outpost.destination === 'lunar' ? 'LUNAR OUTPOST' : 'MARTIAN OUTPOST'}</h2>
            </div>
            <div className="outpost-report-stats">
              <span><strong>{missionState.outpost.daysSurvived}/10</strong><small>DAYS CREW SUPPORTED</small></span>
              <span><strong>{missionState.outpost.emergenciesHandled}</strong><small>EVENTS HANDLED</small></span>
              <span><strong>{missionState.outpost.crewSafety}%</strong><small>CREW SAFETY</small></span>
            </div>
            <div className="outpost-report-resources" aria-label="Final outpost supplies and systems">
              <span><small>OXYGEN</small><strong>{missionState.outpost.oxygen}%</strong></span>
              <span><small>WATER</small><strong>{missionState.outpost.water}%</strong></span>
              <span><small>FOOD</small><strong>{missionState.outpost.food}%</strong></span>
              <span><small>POWER</small><strong>{missionState.outpost.power}/{100 + missionState.outpost.batteryModules * 25}</strong></span>
              <span><small>RADIATION SHIELDS</small><strong>{missionState.outpost.shielding}%</strong></span>
              <span><small>BUILDING SUPPLIES</small><strong>{missionState.outpost.materials}</strong></span>
            </div>
            {missionState.outpost.lessonsLearned.length > 0 && (
              <div className="outpost-lessons">
                <h3>WHAT YOU LEARNED</h3>
                <ul>
                  {missionState.outpost.lessonsLearned.map((lesson) => <li key={lesson}>{lesson}</li>)}
                </ul>
              </div>
            )}
          </article>
        )}

        <div className="debrief-actions">
          {missionSucceeded ? (
            <button type="button" className="btn-primary" onClick={() => setPhase('celebration')}>
              SEE THE FINAL CELEBRATION
            </button>
          ) : (
            <button type="button" className="btn-primary" onClick={onReplayLanding}>
              GO BACK AND LAND EAGLE
            </button>
          )}
          {missionState.outpost && (
            <button type="button" className="btn-secondary" onClick={onReplayOutpost}>PLAY THE OUTPOST AGAIN</button>
          )}
          <button type="button" className="btn-secondary" onClick={onReplayLanding}>TRY THE LUNAR LANDING AGAIN</button>
          <button type="button" className="btn-secondary" onClick={onReplayMission}>PLAY THE WHOLE MISSION AGAIN</button>
        </div>
      </section>
    );
  }

  return (
    <section className="mission-debrief final-celebration" data-mentor-focus="report" aria-labelledby="celebration-title">
      <div className="final-celebration-scene" aria-label="Earth, Moon, Super Rocket, and Eagle celebrating your achievement">
        <div className="celebration-stars" aria-hidden="true">{Array.from({ length: 24 }, (_, index) => <i key={index} />)}</div>
        <div className="celebration-earth" aria-hidden="true"><span>EARTH</span></div>
        <div className="celebration-moon" aria-hidden="true" />
        <div className="celebration-saturn-v" aria-hidden="true"><i /><i /><i /><b /></div>
        <EagleSpacecraft
          className="celebration-eagle"
          style={{ left: '86%', top: '66%', position: 'absolute' }}
        />
        <div className="celebration-banner">
          <p className="debrief-eyebrow">YOUR JUNIOR ASTRONAUT ACHIEVEMENT</p>
          <h1 id="celebration-title">YOU DID IT, JUNIOR ASTRONAUT!</h1>
          <p>
            You explored space, landed on the Moon and
            {missionSucceeded
              ? ` helped keep the ${missionState.outpost?.destination === 'martian' ? 'Martian' : 'lunar'} outpost crew safe.`
              : ' continued your outpost mission.'}
          </p>
        </div>
        <div className="celebration-medal" aria-label="Junior Astronaut achievement badge">
          <span>★</span><small>JUNIOR<br />ASTRONAUT</small>
        </div>
      </div>

      <div className="celebration-actions">
        <button type="button" className="btn-secondary" onClick={() => setPhase('report')}>SEE MISSION REPORT</button>
        {missionState.outpost && (
          <button type="button" className="btn-secondary" onClick={onReplayOutpost}>PLAY THE OUTPOST AGAIN</button>
        )}
        <button type="button" className="btn-secondary" onClick={onReplayLanding}>TRY THE LUNAR LANDING AGAIN</button>
        <button type="button" className="btn-primary" onClick={onReplayMission}>PLAY THE WHOLE MISSION AGAIN</button>
      </div>
    </section>
  );
};

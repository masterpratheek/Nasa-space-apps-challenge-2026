import React, { useState } from 'react';
import { MissionWelcome } from './components/MissionWelcome';
import { PreLaunch } from './components/Pre-launch';
import { LaunchSequence } from './components/LaunchSequence';
import { AtmosphereExplorer } from './components/AtmosphereExplorer';
import { SaturnVExplorer } from './components/SaturnVExplorer';
import { EarthOrbit } from './components/EarthOrbit';
import { TranslunarInjection } from './components/TranslunarInjection';
import { SpacecraftDocking } from './components/SpacecraftDocking';
import { LunarOrbit } from './components/LunarOrbit';
import { LunarLanding } from './components/LunarLanding';
import { OutpostMission } from './components/OutpostMission';
import { MissionDebrief } from './components/MissionDebrief';
import { INITIAL_LAUNCH_SYSTEMS } from './data/missionData';
import { SCENARIOS } from './data/launchScenarios';
import { MissionStage, MissionState, OutpostProgress, ScenarioId } from './types';
import './styles/app.css';

const STAGE_ORDER: MissionStage[] = ['welcome', 'prelaunch', 'countdown', 'atmosphere', 'saturnv', 'earthorbit', 'translunar', 'docking', 'lunarorbit', 'landing', 'outpost', 'debrief'];

export default function App() {
  const [state, setState] = useState<MissionState>({
    currentStage: 'welcome',
    completedStages: new Set(),
    launchChecks: {},
    countdownStarted: false,
    launchComplete: false,
    atmosphereLayerIndex: 0,
    selectedStage: null,
    orbitView: false,
    tliTriggered: false,
    dockingComplete: false,
    lunarOrbitInserted: false,
    landingComplete: false,
    landingZoneSafe: false,
    selectedScenario: 'all-clear',
    outpost: null,
  });

  const updateLaunchChecks = (id: string) => setState(p => ({ ...p, launchChecks: { ...p.launchChecks, [id]: true } }));

  const completeStage = (stage: MissionStage) => {
    setState(p => {
      const currentIndex = STAGE_ORDER.indexOf(stage);
      const nextStage = STAGE_ORDER[Math.min(currentIndex + 1, STAGE_ORDER.length - 1)];
      return {
        ...p,
        currentStage: nextStage,
        completedStages: new Set([...p.completedStages, stage])
      };
    });
  };

  const handleLaunchSystemComplete = (systemId: string) => updateLaunchChecks(systemId);
  const handleScenarioChange = (scenarioId: ScenarioId) => setState(p => ({ ...p, selectedScenario: scenarioId }));

  const handleLaunchComplete = () => {
    setState(p => ({ ...p, launchComplete: true }));
    completeStage('countdown');
  };

  const handleLandingComplete = () => setState((p) => ({
    ...p,
    currentStage: 'outpost',
    completedStages: new Set([...p.completedStages, 'landing']),
    landingComplete: true,
    outpost: null,
  }));

  const handleLandingReplay = () => setState((p) => ({
    ...p,
    currentStage: 'landing',
    completedStages: new Set([...p.completedStages].filter((stage) => stage !== 'landing' && stage !== 'outpost' && stage !== 'debrief')),
    landingComplete: false,
    landingZoneSafe: false,
    outpost: null,
  }));

  const handleOutpostProgressChange = (outpost: OutpostProgress | null) => {
    setState((p) => ({ ...p, outpost }));
  };

  const handleOutpostComplete = () => setState((p) => ({
    ...p,
    currentStage: 'debrief',
    completedStages: new Set([...p.completedStages, 'outpost']),
  }));

  const handleOutpostReplay = () => setState((p) => ({
    ...p,
    currentStage: 'outpost',
    completedStages: new Set([...p.completedStages].filter((stage) => stage !== 'outpost' && stage !== 'debrief')),
    outpost: null,
  }));

  const handleReplay = () => setState({
    currentStage: 'welcome', completedStages: new Set(), launchChecks: {}, countdownStarted: false, launchComplete: false,
    atmosphereLayerIndex: 0, selectedStage: null, orbitView: false, tliTriggered: false, dockingComplete: false,
    lunarOrbitInserted: false, landingComplete: false, landingZoneSafe: false, selectedScenario: 'all-clear',
    outpost: null,
  });

  const allSystemsGo = INITIAL_LAUNCH_SYSTEMS.every(s => state.launchChecks[s.id]);
  const selectedScenario = SCENARIOS[state.selectedScenario];
  const weatherOk = selectedScenario?.weather.status === 'GO';
  const commsOk = selectedScenario?.comm?.radio === 'GO';
  const camerasOk = selectedScenario?.cameras?.pad === 'online';
  const isAuthorized = allSystemsGo && weatherOk && commsOk && camerasOk;

  const launchSystems = INITIAL_LAUNCH_SYSTEMS.map(system => ({
    ...system,
    completed: Boolean(state.launchChecks[system.id])
  }));

  const renderStage = () => {
    switch (state.currentStage) {
      case 'welcome': return <MissionWelcome onStart={() => completeStage('welcome')} />;
      case 'prelaunch': return <PreLaunch systems={launchSystems} onCompleteSystem={handleLaunchSystemComplete} onProceedToCountdown={() => completeStage('prelaunch')} scenario={state.selectedScenario} onScenarioChange={handleScenarioChange} />;
      case 'countdown': return <LaunchSequence onLaunchComplete={handleLaunchComplete} isAuthorized={isAuthorized} scenario={selectedScenario} />;
      case 'atmosphere': return <AtmosphereExplorer onComplete={() => completeStage('atmosphere')} />;
      case 'saturnv': return <SaturnVExplorer onComplete={() => completeStage('saturnv')} />;
      case 'earthorbit': return <EarthOrbit onComplete={() => completeStage('earthorbit')} />;
      case 'translunar': return <TranslunarInjection onComplete={() => completeStage('translunar')} />;
      case 'docking': return <SpacecraftDocking onComplete={() => completeStage('docking')} />;
      case 'lunarorbit': return <LunarOrbit onComplete={() => completeStage('lunarorbit')} />;
      case 'landing': return <LunarLanding onComplete={handleLandingComplete} />;
      case 'outpost': return (
        <OutpostMission
          outpost={state.outpost}
          onProgressChange={handleOutpostProgressChange}
          onComplete={handleOutpostComplete}
        />
      );
      case 'debrief': return (
        <MissionDebrief
          missionState={state}
          onReplayMission={handleReplay}
          onReplayLanding={handleLandingReplay}
          onReplayOutpost={handleOutpostReplay}
        />
      );
      default: return <MissionWelcome onStart={() => completeStage('welcome')} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <header className="app-header">
        <div className="logo-container">
          <h3 style={{ color: '#fff', fontFamily: 'Orbitron', fontWeight: 600 }}>🚀 APOLLO 11 MISSION TRAINER</h3>
          <span className="logo-badge">NASA SPACE APPS 2026</span>
        </div>
        <div className="mission-nav">
          {STAGE_ORDER.map((stage, i) => (
            <div key={stage}>
              <div className={`nav-step ${state.completedStages.has(stage) ? 'completed' : ''} ${state.currentStage === stage ? 'active' : ''}`}>
                {['Hello', 'Prep', 'Launch', 'Atmos', 'Saturn', 'Orbit', 'TLI', 'Dock', 'Lunar', 'Landing', 'Outpost', 'Report'][i]}
              </div>
            </div>
          ))}
        </div>
      </header>
      <main className="main-container">{renderStage()}</main>
    </div>
  );
}
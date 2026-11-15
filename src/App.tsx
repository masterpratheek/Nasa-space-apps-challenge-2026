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
import { MissionMentor } from './components/MissionMentor';
import { INITIAL_LAUNCH_SYSTEMS } from './data/missionData';
import { SCENARIOS } from './data/launchScenarios';
import { MissionStage, MissionState, OutpostProgress, ScenarioId } from './types';
import './styles/app.css';

const STAGE_ORDER: MissionStage[] = ['welcome', 'prelaunch', 'countdown', 'atmosphere', 'saturnv', 'earthorbit', 'translunar', 'docking', 'lunarorbit', 'landing', 'outpost', 'debrief'];

const NASA_RESOURCES = [
  {
    name: 'Apollo 11 Mission Overview',
    organization: 'NASA',
    url: 'https://www.nasa.gov/missions/apollo/apollo-11/apollo-11-mission-overview/',
    usedFor: 'Historical mission note: launch, crew, docking, lunar orbit, and landing context.',
  },
  {
    name: 'NASA’s Artemis Base Camp on the Moon Will Need Light, Water, Elevation',
    organization: 'NASA',
    url: 'https://www.nasa.gov/humans-in-space/nasas-artemis-base-camp-on-the-moon-will-need-light-water-elevation/',
    usedFor: 'Outpost learning note about sunlight for power and access to lunar water ice.',
  },
  {
    name: 'Moon Facts',
    organization: 'NASA Science',
    url: 'https://science.nasa.gov/moon/facts/',
    usedFor: 'Moon environment context, including its very thin, non-breathable exosphere.',
  },
  {
    name: 'Mars Facts',
    organization: 'NASA Science',
    url: 'https://science.nasa.gov/mars/facts/',
    usedFor: 'Mars environment context for the outpost destination.',
  },
  {
    name: 'Artemis',
    organization: 'NASA',
    url: 'https://www.nasa.gov/humans-in-space/artemis/',
    usedFor: 'Context for NASA’s ongoing lunar exploration program.',
  },
  {
    name: 'DONKI CME 37629, Version 1',
    organization: 'NASA Community Coordinated Modeling Center',
    url: 'https://ccmc.gsfc.nasa.gov/DONKI/events/37629/1/',
    usedFor: 'A historical solar-storm model shown only as context; it is not the game’s storm.',
  },
];

export default function App() {
  const [mentorTopic, setMentorTopic] = useState<string | null>(null);
  const [mentorHighlight, setMentorHighlight] = useState<string | null>(null);
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
      case 'saturnv': return <SaturnVExplorer onComplete={() => completeStage('saturnv')} onTutorContextChange={setMentorTopic} />;
      case 'earthorbit': return <EarthOrbit onComplete={() => completeStage('earthorbit')} />;
      case 'translunar': return <TranslunarInjection onComplete={() => completeStage('translunar')} />;
      case 'docking': return <SpacecraftDocking onComplete={() => completeStage('docking')} onTutorContextChange={setMentorTopic} />;
      case 'lunarorbit': return <LunarOrbit onComplete={() => completeStage('lunarorbit')} />;
      case 'landing': return <LunarLanding onComplete={handleLandingComplete} onTutorContextChange={setMentorTopic} />;
      case 'outpost': return (
        <OutpostMission
          outpost={state.outpost}
          onProgressChange={handleOutpostProgressChange}
          onComplete={handleOutpostComplete}
          onTutorContextChange={setMentorTopic}
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
    <div className="app-shell" style={{ minHeight: '100vh' }} data-mentor-highlight={mentorHighlight ?? undefined}>
      <header className="app-header">
        <div className="logo-container">
          <h3 style={{ color: '#fff', fontFamily: 'Orbitron', fontWeight: 600 }}>🚀 LUNA : BEYOND SURVIVAL</h3>
          <span className="logo-badge">NASA SPACE APPS 2026</span>
        </div>
        <div className="mission-nav">
          {STAGE_ORDER.map((stage, i) => (
            <div key={stage}>
              <div className={`nav-step ${state.completedStages.has(stage) ? 'completed' : ''} ${state.currentStage === stage ? 'active' : ''}`}>
                {['Hello', 'Prep', 'Launch', 'Atmos', 'Super Rocket', 'Orbit', 'TLI', 'Dock', 'Lunar', 'Landing', 'Outpost', 'Report'][i]}
              </div>
            </div>
          ))}
        </div>
      </header>
      <main className="main-container">{renderStage()}</main>
      <footer className="sources-credits">
        <details>
          <summary>Sources &amp; Credits</summary>
          <div className="sources-credits-content">
            <p>NASA resources inform the historical and science notes below. NASA does not sponsor or endorse this game.</p>
            <ul>
              {NASA_RESOURCES.map((resource) => (
                <li key={resource.url}>
                  <strong>{resource.name}</strong> — {resource.organization}. {resource.usedFor}{' '}
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.url}</a>
                </li>
              ))}
            </ul>
            <p>
              Mission events, outpost systems, resource levels, and outcomes are educational simulations, not live NASA data.
              The game’s visuals are in-app educational illustrations, not NASA imagery or official hardware designs.
            </p>
          </div>
        </details>
      </footer>
      <MissionMentor
        stage={state.currentStage}
        topic={mentorTopic}
        landingComplete={state.landingComplete}
        onHighlight={setMentorHighlight}
      />
    </div>
  );
}
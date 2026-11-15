import React, { useState, useEffect, useRef } from 'react';
import { LaunchSystem, ScenarioId } from '../types';
import { SCENARIOS, Scenario } from '../data/launchScenarios';

interface WeatherPanelProps {
  scenario: Scenario;
  aqi: number;
  cloudPct: number;
  windKph: number;
  windDir: string;
  raining: boolean;
  lightning: boolean;
}

const WeatherPanel: React.FC<WeatherPanelProps> = ({scenario, aqi, cloudPct, windKph, windDir, raining, lightning}) => (
  <div style={{background:'rgba(0,0,0,0.3)',padding:'1rem',borderRadius:6}}>
    <div style={{color:'#94A3B8',fontSize:'.7rem',marginBottom:'.3rem'}}>Air quality (AQI · game value)</div>
    <div style={{color:'#fff',fontFamily:'Orbitron',fontSize:'1.5rem',marginBottom:'.3rem'}}>{aqi}<span style={{fontSize:'.6rem',opacity:.8,marginLeft:4}}>({scenario.weather.aqiCategory})</span></div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.3rem',marginBottom:'.3rem'}}><div><div style={{color:'#94A3B8',fontSize:'.6rem'}}>Clouds</div><div style={{fontFamily:'Orbitron',color:'#fff'}}>{cloudPct}%</div></div><div><div style={{color:'#94A3B8',fontSize:'.6rem'}}>Wind</div><div style={{fontFamily:'Orbitron',color:'#fff'}}>{windKph} km/h {windDir}</div></div></div>
    <div style={{marginTop:'.3rem',paddingTop:'.3rem',borderTop:'1px solid rgba(255,255,255,0.2)'}}><div style={{color:raining?'#EF4444':'#10B981',fontFamily:'Orbitron',fontSize:'.7rem'}}>{raining?'☔ Rain':'☀️ No rain'} · {lightning?'⚡ Lightning!':'No lightning'}</div></div>
  </div>
);

interface CommsPanelProps {
  scenario: Scenario;
  runningComms: boolean;
  runningCam: boolean;
  commsResult: 'GO' | 'HOLD' | null;
  camResult: 'online' | 'offline' | null;
  runCommsTest: () => void;
  runCamTest: () => void;
}

const CommsPanel: React.FC<CommsPanelProps> = ({scenario, runningComms, runningCam, commsResult, camResult, runCommsTest, runCamTest}) => (
  <div style={{background:'rgba(0,0,0,0.3)',padding:'1rem',borderRadius:6}}>
    <div style={{marginBottom:'.5rem'}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:'.2rem'}}><span style={{color:'#CBD5E1',fontSize:'.65rem'}}>Radio:</span><span style={{fontFamily:'Orbitron',fontWeight:'bold',color:commsResult==='GO'?'#10B981':'#EF4444'}}>{runningComms?'Testing...':commsResult||'—'}</span></div><div style={{display:'flex',justifyContent:'space-between',marginBottom:'.2rem'}}><span style={{color:'#CBD5E1',fontSize:'.65rem'}}>Launch cameras:</span><span style={{fontFamily:'Orbitron',fontWeight:'bold',color:camResult==='online'?'#10B981':'#EF4444'}}>{runningCam?'Checking...':camResult||'—'}</span></div></div>
    <button className="btn-primary" onClick={runCommsTest} disabled={runningComms} style={{width:'100%',fontSize:'.7rem',marginBottom:'.4rem'}}>{runningComms?'🔄 Testing...':'▶ Check the radio'}</button>
    <button className="btn-primary" onClick={runCamTest} disabled={runningCam} style={{width:'100%',fontSize:'.7rem'}}>{runningCam?'🔄 Checking...':'▶ Check launch cameras'}</button>
  </div>
);

const ScenarioPanel = ({scenario, setScenario}: { scenario: ScenarioId; setScenario: (id: ScenarioId) => void }) => (
  <div style={{background:'rgba(0,0,0,0.3)',padding:'1rem',borderRadius:6}}>
    <div style={{color:'#94A3B8',fontSize:'.65rem',marginBottom:'.3rem'}}>WEATHER SCENARIO</div>
    <div style={{display:'flex',flexWrap:'wrap',gap:'.2rem',marginBottom:'.2rem'}}>
      {(Object.keys(SCENARIOS) as ScenarioId[]).map((key) => (
        <button
          key={key}
          onClick={() => setScenario(key)}
          style={{
            padding: '.3rem .5rem',
            borderRadius: 4,
            border: '2px solid',
            borderColor: scenario === key ? '#10B981' : '#EF4444',
            background: scenario === key ? 'rgba(16,185,129,0.1)' : 'rgba(0,0,0,0.3)',
            color: '#fff',
            fontFamily: 'Orbitron',
            fontSize: '.6rem',
            cursor: 'pointer',
          }}
        >
          {SCENARIOS[key].name}
        </button>
      ))}
    </div>
    <div style={{fontSize:'.5rem',color:'#94A3B8',marginTop:'.2rem'}}>
      {SCENARIOS[scenario].weather.status === 'GO' ? 'Weather is GO for launch' : 'Wait to launch: ' + SCENARIOS[scenario].weather.reason}
    </div>
  </div>
);

interface LaunchStatusPanelProps {
  scenario: Scenario;
  allOk: boolean;
  onProceedToCountdown: () => void;
}

const LaunchStatusPanel: React.FC<LaunchStatusPanelProps> = ({scenario, allOk, onProceedToCountdown}) => (
  <div style={{background:'rgba(0,0,0,0.3)',padding:'1rem',borderRadius:6}}>
    <div style={{color:allOk?'#10B981':'#F59E0B',fontFamily:'Orbitron',fontSize:'.8rem',marginBottom:'.3rem'}}>{allOk?'✅ GO — READY TO LAUNCH':'⏳ WAIT FOR THE ALL-CLEAR'}</div>
    <ul style={{paddingLeft:1,margin:0,color:'#CBD5E1',fontSize:'.65rem',display:'flex',flexDirection:'column',gap:'.1rem'}}><li style={{display:scenario.id!=='all-clear'?'list-item':'none'}}>Weather plan: {scenario.name}</li><li style={{display:scenario.weather.status==='HOLD'?'list-item':'none'}}>Weather: {scenario.weather.reason}</li><li style={{display:scenario.comm.radio==='HOLD'?'list-item':'none'}}>Radio: Not ready</li><li style={{display:scenario.cameras.pad==='offline'?'list-item':'none'}}>Cameras: Not ready</li></ul>
    <button className="btn-primary" onClick={onProceedToCountdown} disabled={!allOk} style={{width:'100%',fontSize:'.85rem',opacity:allOk?1:0.5,cursor:allOk?'pointer':'not-allowed'}}>{allOk?'🚀 START COUNTDOWN':'⏳ WAIT'}</button>
  </div>
);

interface PreLaunchProps {
  systems: LaunchSystem[];
  onCompleteSystem: (systemId: string) => void;
  onProceedToCountdown: () => void;
  scenario: ScenarioId;
  onScenarioChange?: (scenarioId: ScenarioId) => void;
}

export const PreLaunch: React.FC<PreLaunchProps> = ({ systems, onCompleteSystem, onProceedToCountdown, scenario, onScenarioChange }) => {
  const selectedScenario = SCENARIOS[scenario] || SCENARIOS['all-clear'];
  const [localScenario, setLocalScenario] = useState<ScenarioId>(scenario);
  const [runningComms, setRunningComms] = useState(false);
  const [runningCam, setRunningCam] = useState(false);
  const [commsResult, setCommsResult] = useState<'GO' | 'HOLD' | null>(selectedScenario.comm.radio);
  const [camResult, setCamResult] = useState<'online' | 'offline' | null>(selectedScenario.cameras.pad);
  const commsTestTimer = useRef<number | null>(null);
  const cameraTestTimer = useRef<number | null>(null);

  useEffect(() => {
    setLocalScenario(scenario);
    setCommsResult(selectedScenario.comm.radio);
    setCamResult(selectedScenario.cameras.pad);
    setRunningComms(false);
    setRunningCam(false);
    if (commsTestTimer.current !== null) window.clearTimeout(commsTestTimer.current);
    if (cameraTestTimer.current !== null) window.clearTimeout(cameraTestTimer.current);
    commsTestTimer.current = null;
    cameraTestTimer.current = null;
  }, [scenario, selectedScenario]);

  useEffect(() => () => {
    if (commsTestTimer.current !== null) window.clearTimeout(commsTestTimer.current);
    if (cameraTestTimer.current !== null) window.clearTimeout(cameraTestTimer.current);
  }, []);

  const runCommsTest = () => {
    if (runningComms) return;
    setRunningComms(true);
    commsTestTimer.current = window.setTimeout(() => {
      setCommsResult(selectedScenario.comm.radio);
      setRunningComms(false);
      commsTestTimer.current = null;
    }, 600);
  };

  const runCameraTest = () => {
    if (runningCam) return;
    setRunningCam(true);
    cameraTestTimer.current = window.setTimeout(() => {
      setCamResult(selectedScenario.cameras.pad);
      setRunningCam(false);
      cameraTestTimer.current = null;
    }, 600);
  };

  const handleScenarioSelect = (nextScenario: ScenarioId) => {
    setLocalScenario(nextScenario);
    onScenarioChange?.(nextScenario);
  };

  const allSystemsReady = systems.every((system) => system.completed);
  const allOk = allSystemsReady && selectedScenario.weather.status === 'GO' && selectedScenario.comm.radio === 'GO' && selectedScenario.cameras.pad === 'online';

  return (
    <div>
      <div className="stage-header">
        <h2 className="stage-title">STAGE 2: GET READY FOR LAUNCH</h2>
        <p className="stage-subtitle">Check the weather, radio, cameras and rocket systems before liftoff.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <WeatherPanel
          scenario={selectedScenario}
          aqi={selectedScenario.weather.aqi}
          cloudPct={selectedScenario.weather.cloudCoverage}
          windKph={selectedScenario.weather.windSpeed}
          windDir={selectedScenario.weather.windDirection}
          raining={selectedScenario.weather.rain}
          lightning={selectedScenario.weather.lightning}
        />
        <CommsPanel
          scenario={selectedScenario}
          runningComms={runningComms}
          runningCam={runningCam}
          commsResult={commsResult}
          camResult={camResult}
          runCommsTest={runCommsTest}
          runCamTest={runCameraTest}
        />
        <ScenarioPanel
          scenario={localScenario}
          setScenario={handleScenarioSelect}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1rem', alignItems: 'stretch' }}>
        <LaunchStatusPanel
          scenario={selectedScenario}
          allOk={allOk}
          onProceedToCountdown={onProceedToCountdown}
        />
        <div className="card-glass" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontFamily: 'Orbitron', fontSize: '1rem', color: '#94A3B8', margin: 0 }}>ROCKET SYSTEMS</h3>
            <span style={{ fontFamily: 'Orbitron', color: '#10B981' }}>{systems.filter((system) => system.completed).length}/{systems.length} READY</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
            {systems.map((system) => (
              <button
                key={system.id}
                onClick={() => onCompleteSystem(system.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: system.completed ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.05)',
                  border: system.completed ? '1px solid rgba(16, 185, 129, 0.6)' : '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span>
                  <span style={{ marginRight: '0.5rem' }}>{system.icon}</span>
                  <span>{system.name}</span>
                </span>
                <span style={{ fontFamily: 'Orbitron', fontSize: '0.7rem', color: system.completed ? '#10B981' : '#F59E0B' }}>
                  {system.completed ? 'READY' : 'CHECK'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
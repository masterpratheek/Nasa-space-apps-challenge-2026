export type MissionStage =
  | 'welcome'
  | 'prelaunch'
  | 'countdown'
  | 'atmosphere'
  | 'saturnv'
  | 'earthorbit'
  | 'translunar'
  | 'docking'
  | 'lunarorbit'
  | 'landing'
  | 'outpost'
  | 'debrief';

export type ScenarioId = 'all-clear' | 'cloudy' | 'storm' | 'comms' | 'camera';

export type OutpostDestination = 'lunar' | 'martian';
export type OutpostStatus = 'active' | 'success' | 'failed';

export interface OutpostProgress {
  destination: OutpostDestination;
  day: number;
  status: OutpostStatus;
  oxygen: number;
  water: number;
  food: number;
  power: number;
  materials: number;
  nutrients: number;
  shielding: number;
  crewSafety: number;
  temperature: number;
  recyclingLevel: number;
  oxygenScrubberLevel: number;
  greenhouseLevel: number;
  solarPanelDust: number;
  batteryModules: number;
  cropProgress: number;
  recyclerOnline: boolean;
  energyConservation: boolean;
  oxygenConservation: boolean;
  waterRationing: boolean;
  dailyActionUsed: boolean;
  eventHandled: boolean;
  daysSurvived: number;
  emergenciesHandled: number;
  emergencySuppliesUsed: string[];
  reportLog: string[];
  lastReport: string[];
  lessonsLearned: string[];
  failureReason: string | null;
}

export type DockingScene = 
  | 'configuration'
  | 'separation'
  | 'transposition'
  | 'approach'
  | 'docking'
  | 'extraction'
  | 'complete';

export type AnimationState = 'idle' | 'playing' | 'paused' | 'complete';

export interface CrewMember {
  name: string;
  role: string;
  description: string;
  imageColor: string;
  facts: string[];
}

export interface LaunchSystem {
  id: string;
  name: string;
  icon: string;
  description: string;
  question: string;
  options: { label: string; value: 'go' | 'hold'; correct: boolean; explanation: string }[];
  completed: boolean;
}

export interface AtmosphereLayer {
  name: string;
  altitudeRange: [number, number];
  color: string;
  description: string;
  facts: string[];
}

export interface RocketStage {
  id: string;
  name: string;
  description: string;
  facts: string[];
  engines: string;
  fuel: string;
  burnTime: string;
}

export interface MissionEvent {
  time: string;
  event: string;
  stage: MissionStage;
}

export interface MissionState {
  currentStage: MissionStage;
  completedStages: Set<MissionStage>;
  launchChecks: Record<string, boolean>;
  countdownStarted: boolean;
  launchComplete: boolean;
  atmosphereLayerIndex: number;
  selectedStage: string | null;
  orbitView: boolean;
  tliTriggered: boolean;
  dockingComplete: boolean;
  lunarOrbitInserted: boolean;
  landingComplete: boolean;
  landingZoneSafe: boolean;
  selectedScenario: ScenarioId;
  outpost: OutpostProgress | null;
}

export const STAGE_ORDER: MissionStage[] = [
  'welcome',
  'prelaunch',
  'countdown',
  'atmosphere',
  'saturnv',
  'earthorbit',
  'translunar',
  'docking',
  'lunarorbit',
  'landing',
  'outpost',
  'debrief'
];
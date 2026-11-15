import React, { useEffect, useState } from 'react';
import { OutpostDestination, OutpostProgress } from '../types';
import { EagleSpacecraft } from './lunarLanding/EagleSpacecraft';
import '../styles/outpost-mission.css';

type Screen = 'introduction' | 'destination' | 'planning' | 'daily-report' | 'results';
type OutpostSystem = 'life-support' | 'radiation' | 'power' | 'food';
type EventKind = 'solar-storm' | 'panel-dust' | 'recycler-fault' | 'oxygen-leak' | 'crop-stress' | 'battery-low' | 'temperature-shift';

interface OutpostEvent {
  kind: EventKind;
  title: string;
  message: string;
  alert: string;
}

interface EventChoice {
  id: string;
  label: string;
  detail: string;
  disabled?: boolean;
}

interface SystemAction {
  id: string;
  label: string;
  detail: string;
  disabled?: boolean;
}

type CommunicationStatus = 'outbound' | 'returning' | 'reply-ready' | 'delivered';

interface MissionControlMessage {
  eventKind: EventKind;
  eventDay: number;
  status: CommunicationStatus;
  decisionMade: boolean;
  returnDelayMs: number;
}

const OUTPOST_DAYS = 10;
const COMMUNICATION_OUTBOUND_MS = 400;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const maxPower = (progress: OutpostProgress) => 100 + progress.batteryModules * 25;

const createOutpost = (destination: OutpostDestination): OutpostProgress => ({
  destination,
  day: 1,
  status: 'active',
  oxygen: 86,
  water: 80,
  food: 68,
  power: 75,
  materials: 12,
  nutrients: 10,
  shielding: 55,
  crewSafety: 100,
  temperature: 21,
  recyclingLevel: 1,
  oxygenScrubberLevel: 1,
  greenhouseLevel: 1,
  solarPanelDust: 0,
  batteryModules: 0,
  cropProgress: 0,
  recyclerOnline: true,
  energyConservation: false,
  oxygenConservation: false,
  waterRationing: false,
  dailyActionUsed: false,
  eventHandled: true,
  daysSurvived: 0,
  emergenciesHandled: 0,
  emergencySuppliesUsed: [],
  reportLog: [],
  lastReport: [],
  lessonsLearned: [],
  failureReason: null,
});

const getEvent = (destination: OutpostDestination, day: number): OutpostEvent | null => {
  const lunarEvents: Record<number, OutpostEvent> = {
    2: { kind: 'solar-storm', title: 'Solar storm on the way', message: 'A burst of energy from the Sun is heading this way. This solar storm could send more harmful radiation toward the crew.', alert: 'PROTECT THE CREW' },
    3: { kind: 'panel-dust', title: 'Moon dust on the solar panels', message: 'Fine Moon dust covers the panels, so they make less electricity from sunlight.', alert: 'LESS POWER FROM SUNLIGHT' },
    5: { kind: 'recycler-fault', title: 'Water recycler needs a fix', message: 'The water-recycling pump has stopped. The crew can use stored water while you choose how to fix it.', alert: 'CHECK THE WATER SYSTEM' },
    6: { kind: 'oxygen-leak', title: 'Small oxygen leak found', message: 'A sensor found a leak in an outside connection. The crew is safe for now, but the leak needs attention.', alert: 'CHECK THE AIR SYSTEM' },
    8: { kind: 'crop-stress', title: 'Greenhouse plants need help', message: 'The young plants need the right mix of water and nutrients to keep growing.', alert: 'CHECK THE GREENHOUSE' },
    9: { kind: 'battery-low', title: 'Battery power is getting low', message: 'The outpost used more electricity than expected. Choose what to do so important systems keep running.', alert: 'SAVE POWER' },
    10: { kind: 'temperature-shift', title: 'The habitat is getting colder', message: 'The nearby Moon surface is moving into deep shadow. Keep the habitat at a safe, comfortable temperature.', alert: 'CHECK THE HEATER' },
  };
  const martianEvents: Record<number, OutpostEvent> = {
    2: { kind: 'panel-dust', title: 'Dust storm crossing the outpost', message: 'Martian dust is covering the solar panels. The sky is dim, so the panels make less power.', alert: 'MARTIAN DUST STORM' },
    3: { kind: 'temperature-shift', title: 'A cold night on Mars', message: 'The outside temperature has dropped. Keep the habitat warm without using up the batteries.', alert: 'CHECK THE HEATER' },
    5: { kind: 'recycler-fault', title: 'Water recycler needs a fix', message: 'The water-recycling pump has stopped. The crew can use stored water while you choose how to fix it.', alert: 'CHECK THE WATER SYSTEM' },
    6: { kind: 'crop-stress', title: 'Greenhouse plants need help', message: 'The plants need the right mix of water, nutrients and electricity to keep growing.', alert: 'CHECK THE GREENHOUSE' },
    8: { kind: 'solar-storm', title: 'Solar storm on the way', message: 'A burst of energy from the Sun is heading this way. This solar storm could send more harmful radiation toward the crew.', alert: 'PROTECT THE CREW' },
    9: { kind: 'oxygen-leak', title: 'Small oxygen leak found', message: 'A sensor found a leak in an outside connection. The crew is safe for now, but the leak needs attention.', alert: 'CHECK THE AIR SYSTEM' },
    10: { kind: 'battery-low', title: 'Battery power is getting low', message: 'A dusty sky has cut down the sunlight reaching the panels. Choose what to do so important systems keep running.', alert: 'SAVE POWER' },
  };
  return (destination === 'lunar' ? lunarEvents : martianEvents)[day] ?? null;
};

const getMissionControlReply = (eventKind: EventKind): string => {
  const replies: Record<EventKind, string> = {
    'solar-storm': 'Move the crew to shelter or add shielding. These help block harmful space radiation, but no shield blocks it all.',
    'panel-dust': 'Clean the panels if you can spare the supplies. Saving power helps important systems, but pauses plant growth.',
    'recycler-fault': 'Use water carefully. Fixing the recycler costs supplies, but lets the crew reuse more water.',
    'oxygen-leak': 'Keep the crew safe and seal or close off the leaky section. Repairs use supplies needed for other jobs.',
    'crop-stress': 'Plants need water, plant nutrients, power and time. Pausing growth saves supplies but leaves less food.',
    'battery-low': 'Save power for important systems. Power-saving mode also pauses plant growth.',
    'temperature-shift': 'Keep the habitat at a safe temperature. Heaters use stored power.',
  };
  return replies[eventKind];
};

const getConditions = (destination: OutpostDestination, dust: number, day: number) => {
  if (destination === 'lunar') {
    return {
      environment: 'No air to breathe · big day/night temperature swings',
      sunlight: day % 6 === 0 ? 'Less sunlight right now' : 'Plenty of sunlight',
      weather: dust >= 25 ? 'Dust on solar panels' : 'Clear sky over the Moon',
    };
  }
  return {
    environment: 'Thin air we cannot breathe · cold ground',
    sunlight: dust >= 25 ? 'Dim sunlight through dust' : 'Sunlight through thin air',
    weather: dust >= 25 ? 'Dusty conditions' : 'Calm Martian sky',
  };
};

const getLessons = (): string[] => [
  'Air cleaners, water recycling and heaters all need power.',
  'Moon soil (regolith), water and special shields can lower harmful radiation. A shelter adds more protection.',
  'Dust and changing sunlight can make solar panels produce less power, so panels and batteries need care.',
  'Greenhouse plants take days to grow and need water, nutrients and power.',
];

const getEventChoices = (event: OutpostEvent, progress: OutpostProgress): EventChoice[] => {
  switch (event.kind) {
    case 'solar-storm':
      return [
        { id: 'shelter', label: 'Move the crew into the radiation shelter', detail: 'Uses 4 power. Helps protect the crew from space radiation.', disabled: progress.power < 4 },
        { id: 'reinforce', label: 'Add a Moon-soil (regolith) shield', detail: 'Uses 3 materials and 2 power. Adds protection, but leaves fewer supplies for repairs.', disabled: progress.materials < 3 || progress.power < 2 },
        { id: 'pause-work', label: 'Stop outdoor work and shelter the crew', detail: 'Costs no supplies, but the crew gets a little more radiation.' },
      ];
    case 'panel-dust':
      return [
        { id: 'clean-panels', label: 'Clean the solar panels', detail: 'Uses 2 materials and 2 power. Dust-free panels make more electricity.', disabled: progress.materials < 2 || progress.power < 2 },
        { id: 'save-power', label: 'Save power today', detail: 'Leaves dust on the panels, but saves power for important systems.' },
      ];
    case 'recycler-fault':
      return [
        { id: 'repair-recycler', label: 'Fix the water recycler', detail: 'Uses 3 materials and 4 power. The crew can recycle water again.', disabled: progress.materials < 3 || progress.power < 4 },
        { id: 'ration-water', label: 'Use less water and shut off the pump', detail: 'Uses 6 stored water now. The recycler stays off until it is fixed.' },
      ];
    case 'oxygen-leak':
      return [
        { id: 'seal-leak', label: 'Seal the leaky connection', detail: 'Uses 2 materials and 2 power. Saves air and adds some oxygen.', disabled: progress.materials < 2 || progress.power < 2 },
        { id: 'isolate-module', label: 'Close off that habitat section', detail: 'Uses 5 oxygen while the crew shuts it safely.' },
      ];
    case 'crop-stress':
      return [
        { id: 'nurture-crops', label: 'Give the plants extra care', detail: 'Uses 4 water and 2 nutrients. Helps the plants start growing again.', disabled: progress.water < 4 || progress.nutrients < 2 },
        { id: 'pause-crops', label: 'Pause plant growth', detail: 'Saves water and nutrients, but the crew eats 5 stored food.' },
      ];
    case 'battery-low':
      return [
        { id: 'conserve-energy', label: 'Save power for important systems', detail: 'Uses power-saving mode today. Plant growth pauses.' },
        { id: 'use-reserve', label: 'Connect an emergency battery', detail: 'Uses 2 materials and adds 18 power.', disabled: progress.materials < 2 },
      ];
    case 'temperature-shift':
      return [
        { id: 'run-heaters', label: 'Turn on the habitat heaters', detail: 'Uses 6 power to bring the habitat back to a safe temperature.', disabled: progress.power < 6 },
        { id: 'thermal-blankets', label: 'Use the warm emergency blankets', detail: 'Uses 2 materials to help keep the habitat warm.', disabled: progress.materials < 2 },
        { id: 'safe-room', label: 'Move the crew into one warm room', detail: 'Costs no supplies. Close off rooms the crew does not need.' },
      ];
  }
};

const applyEventOnArrival = (progress: OutpostProgress, event: OutpostEvent): OutpostProgress => {
  const next = { ...progress };
  switch (event.kind) {
    case 'solar-storm':
      next.crewSafety = clamp(next.crewSafety - (next.shielding >= 70 ? 2 : 5), 0, 100);
      break;
    case 'panel-dust':
      next.solarPanelDust = clamp(next.solarPanelDust + 35, 0, 100);
      break;
    case 'recycler-fault':
      next.recyclerOnline = false;
      break;
    case 'oxygen-leak':
      next.oxygen = clamp(next.oxygen - 4, 0, 100);
      break;
    case 'crop-stress':
      next.cropProgress = 0;
      next.food = clamp(next.food - 3, 0, 100);
      break;
    case 'battery-low':
      next.power = clamp(next.power - 8, 0, maxPower(next));
      break;
    case 'temperature-shift':
      next.temperature = clamp(next.temperature - 6, 5, 35);
      break;
  }
  return next;
};

const applyEventChoice = (progress: OutpostProgress, event: OutpostEvent, choiceId: string): OutpostProgress => {
  let next = { ...progress };
  switch (choiceId) {
    case 'shelter':
      next.power -= 4;
      next.crewSafety = clamp(next.crewSafety + 5, 0, 100);
      break;
    case 'reinforce':
      next.materials -= 3;
      next.power -= 2;
      next.shielding = clamp(next.shielding + 10, 0, 100);
      next.crewSafety = clamp(next.crewSafety + 3, 0, 100);
      break;
    case 'pause-work':
      next.crewSafety = clamp(next.crewSafety - 4, 0, 100);
      break;
    case 'clean-panels':
      next.materials -= 2;
      next.power -= 2;
      next.solarPanelDust = clamp(next.solarPanelDust - 35, 0, 100);
      break;
    case 'save-power':
    case 'conserve-energy':
      next.energyConservation = true;
      break;
    case 'repair-recycler':
      next.materials -= 3;
      next.power -= 4;
      next.water = clamp(next.water + 4, 0, 100);
      next.recyclerOnline = true;
      break;
    case 'ration-water':
      next.water = clamp(next.water - 6, 0, 100);
      next.recyclerOnline = false;
      break;
    case 'seal-leak':
      next.materials -= 2;
      next.power -= 2;
      next.oxygen = clamp(next.oxygen + 8, 0, 100);
      break;
    case 'isolate-module':
      next.oxygen = clamp(next.oxygen - 5, 0, 100);
      next.crewSafety = clamp(next.crewSafety - 2, 0, 100);
      break;
    case 'nurture-crops':
      next.water -= 4;
      next.nutrients -= 2;
      next.cropProgress = 0;
      next.food = clamp(next.food + 4, 0, 100);
      break;
    case 'pause-crops':
      next.food = clamp(next.food - 5, 0, 100);
      next.cropProgress = 0;
      break;
    case 'use-reserve':
      next.materials -= 2;
      next.power = clamp(next.power + 18, 0, maxPower(next));
      break;
    case 'run-heaters':
      next.power -= 6;
      next.temperature = clamp(next.temperature + (next.temperature < 19 ? 6 : -6), 12, 28);
      break;
    case 'thermal-blankets':
      next.materials -= 2;
      next.temperature = clamp(next.temperature + (next.temperature < 19 ? 5 : -5), 12, 28);
      break;
    case 'safe-room':
      next.temperature = 19;
      next.crewSafety = clamp(next.crewSafety + 2, 0, 100);
      next.energyConservation = true;
      break;
  }
  next.power = clamp(next.power, 0, maxPower(next));
  next.materials = clamp(next.materials, 0, 20);
  next.water = clamp(next.water, 0, 100);
  next.nutrients = clamp(next.nutrients, 0, 20);
  next.eventHandled = true;
  next.emergenciesHandled += 1;
  next.reportLog = [...next.reportLog, `${event.title}: ${getChoiceSummary(choiceId)}.`];
  return next;
};

const getChoiceSummary = (choiceId: string): string => {
  const summaries: Record<string, string> = {
    shelter: 'crew moved to the radiation shelter',
    reinforce: 'Moon-soil shielding added',
    'pause-work': 'outdoor work paused',
    'clean-panels': 'solar panels cleaned',
    'save-power': 'power saved for important systems',
    'repair-recycler': 'water recycler fixed',
    'ration-water': 'water use reduced and pump shut off',
    'seal-leak': 'air leak sealed',
    'isolate-module': 'habitat section closed off',
    'nurture-crops': 'plants given extra care',
    'pause-crops': 'plant growth paused',
    'conserve-energy': 'power use reduced',
    'use-reserve': 'emergency battery connected',
    'run-heaters': 'habitat heaters turned on',
    'thermal-blankets': 'warm blankets used',
  };
  return summaries[choiceId] ?? 'crew response completed';
};

const getSystemActions = (system: OutpostSystem, progress: OutpostProgress): SystemAction[] => {
  const used = progress.dailyActionUsed;
  const enough = (materials: number, power: number) => progress.materials >= materials && progress.power >= power;
  switch (system) {
    case 'life-support':
      return [
        { id: 'oxygen-filter', label: 'Upgrade the oxygen scrubber (air cleaner)', detail: '3 materials · 3 power · cleans more air each day', disabled: used || progress.oxygenScrubberLevel >= 3 || !enough(3, 3) },
        {
          id: progress.recyclerOnline ? 'water-recycler' : 'repair-recycler',
          label: progress.recyclerOnline ? 'Upgrade the water recycler' : 'Fix the water recycler',
          detail: progress.recyclerOnline ? '3 materials · 4 power · saves more water each day' : '3 materials · 4 power · lets the crew recycle water again',
          disabled: used || (progress.recyclerOnline && progress.recyclingLevel >= 3) || !enough(3, 4),
        },
        { id: 'temperature-control', label: 'Set the habitat to 21°C', detail: 'Uses 4 power · brings the room to a comfortable temperature', disabled: used || progress.power < 4 || (progress.temperature >= 20 && progress.temperature <= 22) },
      ];
    case 'radiation':
      return [
        { id: 'add-shielding', label: 'Add a Moon-soil (regolith) shield', detail: '3 materials · 4 power · adds 15% protection', disabled: used || progress.shielding >= 100 || !enough(3, 4) },
      ];
    case 'power':
      return [
        { id: 'clean-solar-panels', label: 'Clean the solar panels', detail: '2 materials · 2 power · removes dust so panels make more electricity', disabled: used || progress.solarPanelDust <= 0 || !enough(2, 2) },
        { id: 'add-battery', label: 'Add a battery', detail: '4 materials · 5 power · stores 25 more power for later', disabled: used || progress.batteryModules >= 2 || !enough(4, 5) },
        { id: 'toggle-conservation', label: progress.energyConservation ? 'Turn power-saving mode off' : 'Save power today', detail: progress.energyConservation ? 'Plants can grow again, but the outpost will use more power' : 'Uses less power, but pauses plant growth today', disabled: used },
      ];
    case 'food':
      return [
        { id: 'upgrade-greenhouse', label: 'Make the greenhouse bigger', detail: '4 materials · 5 power · grows more food, but uses more water and power', disabled: used || progress.greenhouseLevel >= 3 || !enough(4, 5) },
      ];
  }
};

const performSystemAction = (progress: OutpostProgress, actionId: string): OutpostProgress => {
  if (progress.dailyActionUsed) return progress;
  const next = { ...progress, dailyActionUsed: true };
  switch (actionId) {
    case 'oxygen-filter':
      if (progress.oxygenScrubberLevel >= 3 || progress.materials < 3 || progress.power < 3) return progress;
      next.materials -= 3;
      next.power -= 3;
      next.oxygenScrubberLevel += 1;
      break;
    case 'water-recycler':
      if (progress.recyclingLevel >= 3 || progress.materials < 3 || progress.power < 4) return progress;
      next.materials -= 3;
      next.power -= 4;
      next.recyclingLevel += 1;
      break;
    case 'repair-recycler':
      if (progress.recyclerOnline || progress.materials < 3 || progress.power < 4) return progress;
      next.materials -= 3;
      next.power -= 4;
      next.recyclerOnline = true;
      break;
    case 'temperature-control':
      if (progress.power < 4) return progress;
      next.power -= 4;
      next.temperature = 21;
      break;
    case 'add-shielding':
      if (progress.shielding >= 100 || progress.materials < 3 || progress.power < 4) return progress;
      next.materials -= 3;
      next.power -= 4;
      next.shielding = clamp(progress.shielding + 15, 0, 100);
      break;
    case 'clean-solar-panels':
      if (progress.solarPanelDust <= 0 || progress.materials < 2 || progress.power < 2) return progress;
      next.materials -= 2;
      next.power -= 2;
      next.solarPanelDust = clamp(progress.solarPanelDust - 40, 0, 100);
      break;
    case 'add-battery': {
      if (progress.batteryModules >= 2 || progress.materials < 4 || progress.power < 5) return progress;
      next.materials -= 4;
      next.power -= 5;
      next.batteryModules += 1;
      next.power = clamp(next.power + 10, 0, maxPower(next));
      break;
    }
    case 'toggle-conservation':
      next.energyConservation = !progress.energyConservation;
      break;
    case 'upgrade-greenhouse':
      if (progress.greenhouseLevel >= 3 || progress.materials < 4 || progress.power < 5) return progress;
      next.materials -= 4;
      next.power -= 5;
      next.greenhouseLevel += 1;
      break;
  }
  return next;
};

const getEmergencyOptions = (progress: OutpostProgress) => {
  const options: { id: string; label: string; detail: string }[] = [];
  const hasMaterials = progress.materials >= 2;
  if (progress.oxygen <= 28 && !progress.emergencySuppliesUsed.includes('oxygen') && !progress.emergencySuppliesUsed.includes('oxygen-conservation')) {
    options.push(hasMaterials
      ?       { id: 'oxygen', label: 'Open the emergency oxygen supply', detail: '+22 oxygen · uses 2 materials' }
      : { id: 'oxygen-conservation', label: 'Close off rooms the crew does not need', detail: 'Saves oxygen, but those rooms go offline' });
  }
  if (progress.water <= 20 && !progress.emergencySuppliesUsed.includes('water') && !progress.emergencySuppliesUsed.includes('water-rationing')) {
    options.push(hasMaterials
      ? { id: 'water', label: 'Open the emergency water supply', detail: '+20 water · uses 2 materials' }
      : { id: 'water-rationing', label: 'Use less water for now', detail: 'Saves water, but plant growth pauses' });
  }
  if (progress.food <= 18 && !progress.emergencySuppliesUsed.includes('food') && !progress.emergencySuppliesUsed.includes('food-ration')) {
    options.push(hasMaterials
      ? { id: 'food', label: 'Use emergency food packs', detail: '+18 food · uses 2 materials' }
      : { id: 'food-ration', label: 'Open the crew food pack', detail: '+12 food · one-time supply' });
  }
  if (progress.power <= 20 && !progress.emergencySuppliesUsed.includes('power') && !progress.emergencySuppliesUsed.includes('power-saving')) {
    options.push(hasMaterials
      ? { id: 'power', label: 'Connect the emergency battery', detail: '+22 power · uses 2 materials' }
      : { id: 'power-saving', label: 'Turn off equipment we do not need', detail: 'Saves power, but plant growth pauses' });
  }
  if (progress.crewSafety <= 60 && !progress.emergencySuppliesUsed.includes('crew-shelter')) {
    options.push({ id: 'crew-shelter', label: 'Move the crew into the safe shelter', detail: '+15 crew safety · no materials' });
  }
  if ((progress.temperature < 16 || progress.temperature > 28) && !progress.emergencySuppliesUsed.includes('temperature-shelter')) {
    options.push({ id: 'temperature-shelter', label: 'Move the crew into one warm room', detail: 'Brings the habitat to a safer temperature · no materials' });
  }
  return options;
};

const applyEmergency = (progress: OutpostProgress, supply: string): OutpostProgress => {
  const materialSupplies = ['oxygen', 'water', 'food', 'power'];
  if (progress.emergencySuppliesUsed.includes(supply) || (materialSupplies.includes(supply) && progress.materials < 2)) return progress;
  const next = {
    ...progress,
    materials: materialSupplies.includes(supply) ? progress.materials - 2 : progress.materials,
    emergencySuppliesUsed: [...progress.emergencySuppliesUsed, supply],
    emergenciesHandled: progress.emergenciesHandled + 1,
  };
  if (supply === 'oxygen') next.oxygen = clamp(progress.oxygen + 22, 0, 100);
  if (supply === 'water') next.water = clamp(progress.water + 20, 0, 100);
  if (supply === 'food') next.food = clamp(progress.food + 18, 0, 100);
  if (supply === 'power') next.power = clamp(progress.power + 22, 0, maxPower(progress));
  if (supply === 'oxygen-conservation') next.oxygenConservation = true;
  if (supply === 'water-rationing') next.waterRationing = true;
  if (supply === 'food-ration') next.food = clamp(progress.food + 12, 0, 100);
  if (supply === 'power-saving') next.energyConservation = true;
  if (supply === 'crew-shelter') next.crewSafety = clamp(progress.crewSafety + 15, 0, 100);
  if (supply === 'temperature-shelter') next.temperature = progress.temperature < 16 ? 19 : 24;
  next.reportLog = [...next.reportLog, `Emergency ${supply} reserve used.`];
  return next;
};

const getWarnings = (progress: OutpostProgress) => [
  ...(progress.oxygen <= 28 ? ['Oxygen is low. Check the air cleaner or open the emergency oxygen supply.'] : []),
  ...(progress.water <= 20
    ? [progress.waterRationing
      ? 'The crew is saving water. Keep an eye on water use and recycling.'
      : 'Water is low. Check the recycler or open the emergency water supply.']
    : []),
  ...(progress.food <= 18 ? ['Food is running low. Keep the greenhouse growing.'] : []),
  ...(progress.power <= 20 ? ['Power is low. Save power or add a battery.'] : []),
  ...(progress.crewSafety <= 60 ? ['The crew needs more protection. Check the shields and shelter.'] : []),
  ...(progress.temperature < 16 || progress.temperature > 28 ? ['The habitat is too cold or too hot for the crew.'] : []),
];

const advanceSimulationDay = (progress: OutpostProgress): OutpostProgress => {
  const solarBase = progress.destination === 'lunar' ? 15 : 13;
  const dustPenalty = Math.floor(progress.solarPanelDust / 20) * 3;
  const solarGeneration = Math.max(2, solarBase - dustPenalty);
  const powerUse = Math.max(2, 8 + progress.greenhouseLevel * 2 + progress.recyclingLevel + progress.oxygenScrubberLevel - (progress.energyConservation ? 4 : 0));
  const waterUse = Math.max(2, 6 + progress.greenhouseLevel * 2 - (progress.waterRationing ? 3 : 0));
  const waterRecovery = progress.recyclerOnline ? progress.recyclingLevel * 5 : 0;
  const oxygenChange = -5 + progress.oxygenScrubberLevel * 2 + (progress.oxygenConservation ? 2 : 0);
  const waterChange = -waterUse + waterRecovery;
  const powerChange = solarGeneration - powerUse;
  let oxygen = clamp(progress.oxygen + oxygenChange, 0, 100);
  let water = clamp(progress.water + waterChange, 0, 100);
  let food = clamp(progress.food - 7, 0, 100);
  let power = clamp(progress.power + powerChange, 0, maxPower(progress));
  let nutrients = progress.nutrients;
  let cropProgress = progress.cropProgress;
  let cropNote = 'Greenhouse plants are growing.';

  if (!progress.energyConservation && !progress.waterRationing && nutrients > 0 && water >= 4 && power >= 8) {
    cropProgress += 1;
    if (cropProgress >= 3) {
      const harvest = 22 + (progress.greenhouseLevel - 1) * 6;
      food = clamp(food + harvest, 0, 100);
      nutrients = clamp(nutrients - 1, 0, 20);
      cropProgress = 0;
      cropNote = `Greenhouse harvest collected: +${harvest} food.`;
    }
  } else {
    cropNote = progress.energyConservation
      ? 'Power-saving mode paused plant growth today.'
      : progress.waterRationing
        ? 'Saving water paused plant growth today.'
        : 'Plants need enough power, water and nutrients to grow.';
  }

  let temperature = progress.temperature;
  if (power < 15) temperature = clamp(temperature - 2, 5, 35);
  let crewSafety = progress.crewSafety;
  if (progress.shielding < 35) crewSafety = clamp(crewSafety - 5, 0, 100);
  if (temperature < 16 || temperature > 28) crewSafety = clamp(crewSafety - 8, 0, 100);
  if (oxygen < 20) crewSafety = clamp(crewSafety - 8, 0, 100);
  if (water < 10 || food < 10) crewSafety = clamp(crewSafety - 5, 0, 100);

  const report = [
    `Air cleaner: ${oxygenChange > 0 ? '+' : ''}${oxygenChange} oxygen.`,
    `Water used after recycling: ${waterChange > 0 ? '+' : ''}${waterChange} water.`,
    `Solar panels and habitat systems: ${powerChange > 0 ? '+' : ''}${powerChange} power.`,
    cropNote,
    `Crew safety: ${crewSafety}% · Habitat temperature: ${temperature}°C.`,
  ];
  const fatalProblem = oxygen <= 0 ? 'The crew ran out of oxygen.'
    : water <= 0 ? 'The crew ran out of usable water.'
      : food <= 0 ? 'The crew ran out of food.'
        : power <= 0 ? 'The outpost ran out of power.'
          : crewSafety <= 0 ? 'The crew needs urgent help to stay safe.'
            : null;
  const endOfMissionProblem = progress.day === OUTPOST_DAYS && !fatalProblem
    ? oxygen < 5 ? 'The crew had too little oxygen left at the end of the mission.'
      : water < 5 ? 'The crew had too little water left at the end of the mission.'
        : food < 5 ? 'The crew had too little food left at the end of the mission.'
          : power < 5 ? 'The outpost had too little power left at the end of the mission.'
            : crewSafety < 45 ? 'The crew needs more protection before the mission can be complete.'
              : temperature < 16 || temperature > 28 ? 'The habitat needs to be brought back to a safe temperature.'
                : null
    : null;
  const failureReason = fatalProblem ?? endOfMissionProblem;
  const status = failureReason ? 'failed' : progress.day === OUTPOST_DAYS ? 'success' : 'active';
  const daysSurvived = oxygen > 0 && water > 0 && food > 0 && power > 0 && crewSafety > 0
    ? progress.day
    : Math.max(0, progress.day - 1);

  return {
    ...progress,
    oxygen,
    water,
    food,
    power,
    nutrients,
    cropProgress,
    temperature,
    crewSafety,
    status,
    daysSurvived,
    lastReport: report,
    reportLog: [...progress.reportLog, `Day ${progress.day}: ${report.join(' ')}`],
    failureReason,
    lessonsLearned: status === 'active' ? progress.lessonsLearned : getLessons(),
  };
};

const SYSTEM_DETAILS: Record<OutpostSystem, { title: string; description: string; status: (progress: OutpostProgress) => string }> = {
  'life-support': {
    title: 'LIFE SUPPORT',
  description: 'The air cleaner scrubs the air, and the water recycler cleans water so the crew can use it again. Both need power.',
  status: (progress) => `Air cleaner L${progress.oxygenScrubberLevel} · Water recycler ${progress.recyclerOnline ? `L${progress.recyclingLevel}` : 'OFFLINE'} · Habitat ${progress.temperature}°C`,
  },
  radiation: {
  title: 'RADIATION SHIELDS',
  description: 'Radiation is harmful energy from space. Moon soil (regolith), water and special materials can lower the amount that reaches the crew. Thin walls alone are not enough.',
    status: (progress) => `Habitat shielding ${progress.shielding}% · Crew safety ${progress.crewSafety}% · Shelter ready`,
  },
  power: {
    title: 'POWER & BATTERIES',
    description: 'Solar panels make electricity, and batteries save it for later. The recycler and greenhouse need power, too.',
    status: (progress) => `Dust on panels ${progress.solarPanelDust}% · Battery ${progress.power}/${maxPower(progress)} · ${progress.energyConservation ? 'Power-saving mode ON' : 'Normal power use'}`,
  },
  food: {
    title: 'GREENHOUSE & FOOD',
    description: 'Astronauts need food every day. Plants take time to grow and need water, nutrients (plant food) and power.',
    status: (progress) => `Greenhouse L${progress.greenhouseLevel} · Crop cycle ${progress.cropProgress}/3 days · Nutrients ${progress.nutrients}`,
  },
};

const ResourceIndicators: React.FC<{ progress: OutpostProgress }> = ({ progress }) => {
  const resources = [
    { key: 'oxygen', label: 'OXYGEN', value: progress.oxygen, max: 100, display: `${progress.oxygen}%`, icon: '◉' },
    { key: 'water', label: 'WATER', value: progress.water, max: 100, display: `${progress.water}%`, icon: '◆' },
    { key: 'food', label: 'FOOD', value: progress.food, max: 100, display: `${progress.food}%`, icon: '✦' },
    { key: 'power', label: 'POWER', value: progress.power, max: maxPower(progress), display: `${progress.power}/${maxPower(progress)}`, icon: '⚡' },
    { key: 'shielding', label: 'RADIATION SHIELDS', value: progress.shielding, max: 100, display: `${progress.shielding}%`, icon: '⬡' },
    { key: 'materials', label: 'BUILDING SUPPLIES', value: progress.materials, max: 20, display: `${progress.materials}`, icon: '▰' },
    { key: 'crew', label: 'CREW SAFETY', value: progress.crewSafety, max: 100, display: `${progress.crewSafety}%`, icon: '✚' },
  ];
  return (
    <section className="outpost-resource-grid" aria-label="Outpost resource status">
      {resources.map((resource) => {
        const ratio = clamp(resource.value / resource.max * 100, 0, 100);
        const low = ['oxygen', 'water', 'food', 'power'].includes(resource.key) && ratio <= 28;
        return (
          <div className={`outpost-resource ${low ? 'resource-low' : ''}`} key={resource.key}>
            <div className="outpost-resource-heading">
              <span aria-hidden="true">{resource.icon}</span>
              <span>{resource.label}</span>
            </div>
            <strong>{resource.display}</strong>
            <div className="outpost-resource-track" aria-hidden="true">
              <i style={{ width: `${ratio}%` }} />
            </div>
          </div>
        );
      })}
    </section>
  );
};

const HabitatScene: React.FC<{
  progress: OutpostProgress;
  selectedSystem: OutpostSystem;
  eventKind: EventKind | null;
  onSelectSystem: (system: OutpostSystem) => void;
}> = ({ progress, selectedSystem, eventKind, onSelectSystem }) => (
  <section className={`outpost-scene ${progress.destination} ${eventKind ? `event-${eventKind}` : ''}`} data-mentor-focus={selectedSystem} aria-label={`${progress.destination} outpost habitat`}>
    <div className="outpost-scene-stars" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} />)}</div>
    <div className="outpost-sky-body" aria-hidden="true" />
    <div className="outpost-distant-ridge" aria-hidden="true" />
    <div className="outpost-ground" aria-hidden="true" />
    <div className="outpost-base-art" aria-hidden="true">
      <div className="outpost-link-tunnel" />
      <div className={`outpost-habitat-module ${progress.shielding >= 70 ? 'well-shielded' : ''}`}>
        <span>HABITAT</span><i /><i /><i />
      </div>
      <div className={`outpost-life-support-unit ${progress.recyclerOnline ? '' : 'offline'} ${progress.oxygenScrubberLevel > 1 ? 'upgraded' : ''}`} data-mentor-focus="life-support"><span>O₂ L{progress.oxygenScrubberLevel}</span><i /><i /></div>
      <div className={`outpost-greenhouse-module ${progress.greenhouseLevel > 1 ? 'expanded' : ''}`} data-mentor-focus="food">
        <div className={`greenhouse-dome crop-cycle-${progress.cropProgress}`}><i /><i /><i /></div>
        <span>GREENHOUSE</span>
      </div>
      <div className={`outpost-solar-array ${progress.solarPanelDust >= 25 ? 'dusty' : ''}`} data-mentor-focus="power">
        <i /><i /><i /><i /><i /><i />
      </div>
      <div className="outpost-battery-stack">
        <i /><i />{progress.batteryModules > 0 && <i />}
      </div>
      <div className={`outpost-shelter-dome ${progress.shielding >= 70 ? 'reinforced' : ''}`} data-mentor-focus="radiation"><span>RADIATION<br />SHELTER</span></div>
      <div className={`outpost-water-recycler ${progress.recyclerOnline ? 'online' : 'offline'} ${progress.recyclingLevel > 1 ? 'upgraded' : ''}`}><i /><span>WATER<br />RECYCLE</span></div>
    </div>
    <button className={`outpost-hotspot hotspot-life ${selectedSystem === 'life-support' ? 'selected' : ''}`} type="button" onClick={() => onSelectSystem('life-support')} aria-label="View life support systems">LIFE SUPPORT</button>
    <button className={`outpost-hotspot hotspot-radiation ${selectedSystem === 'radiation' ? 'selected' : ''}`} type="button" onClick={() => onSelectSystem('radiation')} aria-label="View radiation shielding">SHIELDING</button>
    <button className={`outpost-hotspot hotspot-power ${selectedSystem === 'power' ? 'selected' : ''}`} type="button" onClick={() => onSelectSystem('power')} aria-label="View solar panels and batteries">POWER</button>
    <button className={`outpost-hotspot hotspot-food ${selectedSystem === 'food' ? 'selected' : ''}`} type="button" onClick={() => onSelectSystem('food')} aria-label="View greenhouse and food production">GREENHOUSE</button>
    <div className="outpost-scene-caption">
      <span>{progress.destination === 'lunar' ? 'SEA OF TRANQUILITY · LUNAR SURFACE' : 'MARS · OUTPOST SITE ALPHA'}</span>
      <strong>CREW HOME {progress.shielding < 35 ? '· CHECK SHIELDS' : '· ALL GOOD'}</strong>
    </div>
  </section>
);

const OutpostMission: React.FC<{
  outpost: OutpostProgress | null;
  onProgressChange: (progress: OutpostProgress | null) => void;
  onComplete: () => void;
  onTutorContextChange?: (topic: string | null) => void;
}> = ({ outpost, onProgressChange, onComplete, onTutorContextChange }) => {
  const [screen, setScreen] = useState<Screen>(outpost ? (outpost.status === 'active' ? 'planning' : 'results') : 'introduction');
  const [selectedDestination, setSelectedDestination] = useState<OutpostDestination>('lunar');
  const [selectedSystem, setSelectedSystem] = useState<OutpostSystem>('life-support');
  const [communication, setCommunication] = useState<MissionControlMessage | null>(null);

  const beginOutpost = (destination: OutpostDestination) => {
    onProgressChange(createOutpost(destination));
    setCommunication(null);
    setSelectedSystem('life-support');
    setScreen('planning');
  };

  const currentEvent = outpost ? getEvent(outpost.destination, outpost.day) : null;
  const tutorTopic = screen === 'planning' && currentEvent && outpost && !outpost.eventHandled
    ? `outpost-event:${currentEvent.kind}`
    : `outpost:${screen === 'planning' ? selectedSystem : screen}`;
  const communicationWaiting = Boolean(
    outpost
    && communication
    && communication.eventDay === outpost.day
    && communication.status !== 'delivered',
  );

  useEffect(() => {
    onTutorContextChange?.(tutorTopic);
    return () => onTutorContextChange?.(null);
  }, [onTutorContextChange, tutorTopic]);

  useEffect(() => {
    if (!communication || !['outbound', 'returning'].includes(communication.status)) return;
    const timer = window.setTimeout(() => {
      setCommunication((message) => {
        if (!message) return message;
        if (message.status === 'outbound') return { ...message, status: 'returning' };
        return { ...message, status: message.decisionMade ? 'delivered' : 'reply-ready' };
      });
    }, communication.status === 'outbound' ? COMMUNICATION_OUTBOUND_MS : communication.returnDelayMs);
    return () => window.clearTimeout(timer);
  }, [communication?.status, communication?.returnDelayMs]);

  const requestMissionControl = () => {
    if (!outpost || !currentEvent || outpost.eventHandled || communication) return;
    setCommunication({
      eventKind: currentEvent.kind,
      eventDay: outpost.day,
      status: 'outbound',
      decisionMade: false,
      returnDelayMs: outpost.destination === 'lunar' ? 900 : 5600,
    });
  };

  const chooseEventResponse = (choiceId: string) => {
    if (!outpost || !currentEvent || outpost.eventHandled) return;
    const choice = getEventChoices(currentEvent, outpost).find((candidate) => candidate.id === choiceId);
    if (!choice || choice.disabled) return;
    onProgressChange(applyEventChoice(outpost, currentEvent, choiceId));
    setCommunication((message) => {
      if (!message || message.eventDay !== outpost.day) return message;
      return {
        ...message,
        decisionMade: true,
        status: message.status === 'reply-ready' ? 'delivered' : message.status,
      };
    });
  };

  const chooseSystemAction = (actionId: string) => {
    if (!outpost || outpost.dailyActionUsed) return;
    const action = getSystemActions(selectedSystem, outpost).find((candidate) => candidate.id === actionId);
    if (!action || action.disabled) return;
    onProgressChange(performSystemAction(outpost, actionId));
  };

  const useEmergencySupply = (supply: string) => {
    if (!outpost) return;
    onProgressChange(applyEmergency(outpost, supply));
  };

  const advanceDay = () => {
    if (!outpost || (currentEvent && !outpost.eventHandled) || communicationWaiting) return;
    const next = advanceSimulationDay(outpost);
    onProgressChange(next);
    setScreen(next.status === 'active' ? 'daily-report' : 'results');
  };

  const continueAfterReport = () => {
    if (!outpost || outpost.status !== 'active') return;
    const nextDay = outpost.day + 1;
    const nextEvent = getEvent(outpost.destination, nextDay);
    const progressAtDayStart = nextEvent ? applyEventOnArrival(outpost, nextEvent) : outpost;
    onProgressChange({
      ...progressAtDayStart,
      day: nextDay,
      eventHandled: nextEvent === null,
      dailyActionUsed: false,
      lastReport: [],
    });
    setScreen('planning');
  };

  const retryOutpost = () => {
    if (!outpost) return;
    onProgressChange(createOutpost(outpost.destination));
    setCommunication(null);
    setSelectedSystem('life-support');
    setScreen('planning');
  };

  if (screen === 'introduction') {
    return (
      <section className="outpost-introduction">
        <div className="outpost-intro-scene">
          <div className="outpost-scene-stars" aria-hidden="true">{Array.from({ length: 20 }, (_, index) => <i key={index} />)}</div>
          <div className="outpost-intro-earth" aria-hidden="true" />
          <div className="outpost-intro-moon" aria-hidden="true" />
          <EagleSpacecraft className="outpost-landed-eagle" style={{ left: '12%', bottom: '12%', position: 'absolute' }} />
          <div className="outpost-mission-message card-glass">
            <p className="outpost-eyebrow">MISSION CONTROL · NEW ASSIGNMENT</p>
            <h1>JUNIOR MISSION CONTROLLER, READY FOR YOUR NEXT MISSION?</h1>
            <p>You helped Luna 11 reach the Moon. Now it's time to help astronauts live and work there.</p>
            <p>Keep their space home safe, warm and ready for each new day.</p>
            <strong>YOUR NEXT MISSION: CARE FOR A LUNAR OUTPOST!</strong>
            <button type="button" className="btn-primary" onClick={() => setScreen('destination')}>CONTINUE THE MISSION</button>
          </div>
          <div className="outpost-transmission" aria-hidden="true">EAGLE · MOON LANDING COMPLETE</div>
        </div>
      </section>
    );
  }

  if (screen === 'destination') {
    return (
      <section className="outpost-destination-screen" aria-labelledby="outpost-destination-title">
        <header className="stage-header">
          <p className="outpost-eyebrow">MISSION CONTROL · CHOOSE A HOME FOR THE CREW</p>
          <h1 className="stage-title" id="outpost-destination-title">WHERE SHOULD WE BUILD?</h1>
          <p className="stage-subtitle">The Moon continues the Luna 11 mission. Mars is another place to explore. Both need careful planning.</p>
        </header>
        <div className="outpost-destination-grid">
          <button type="button" className={`outpost-destination-card card-glass ${selectedDestination === 'lunar' ? 'chosen' : ''}`} onClick={() => setSelectedDestination('lunar')}>
            <span className="destination-badge">RECOMMENDED · KEEP EXPLORING THE MOON</span>
            <div className="destination-moon-art" aria-hidden="true" />
            <h2>LUNAR OUTPOST</h2>
            <p>There is no air to breathe. Space radiation, very hot and cold days, and short sunlight periods make water and power precious.</p>
            <strong>MOON · SEA OF TRANQUILITY</strong>
          </button>
          <button type="button" className={`outpost-destination-card card-glass ${selectedDestination === 'martian' ? 'chosen' : ''}`} onClick={() => setSelectedDestination('martian')}>
            <span className="destination-badge destination-badge-alt">ANOTHER PLACE TO EXPLORE</span>
            <div className="destination-mars-art" aria-hidden="true" />
            <h2>MARTIAN OUTPOST</h2>
            <p>Mars has thin air we cannot breathe. Radiation, cold and dust storms can make solar power less reliable.</p>
            <strong>MARS · OUTPOST SITE ALPHA</strong>
          </button>
        </div>
        {selectedDestination === 'lunar' && (
          <aside className="outpost-data-attribution" aria-label="NASA Artemis Base Camp learning connection">
            NASA’s Artemis Base Camp concept discusses long sunlight for power and access to water ice near the lunar South Pole.
            This game uses those ideas to teach power and water planning. Its Sea of Tranquility outpost, resource values, and events are simulated,
            not NASA’s base design.{' '}
            <a href="https://www.nasa.gov/humans-in-space/nasas-artemis-base-camp-on-the-moon-will-need-light-water-elevation/" target="_blank" rel="noopener noreferrer">
              Read NASA’s Artemis Base Camp article
            </a>
          </aside>
        )}
        <div className="outpost-destination-action">
          <button type="button" className="btn-primary" onClick={() => beginOutpost(selectedDestination)}>
            ESTABLISH {selectedDestination === 'lunar' ? 'LUNAR' : 'MARTIAN'} OUTPOST
          </button>
        </div>
      </section>
    );
  }

  if (!outpost) return null;

  const conditions = getConditions(outpost.destination, outpost.solarPanelDust, outpost.day);
  const warnings = getWarnings(outpost);
  const emergencyOptions = getEmergencyOptions(outpost);
  const eventChoices = currentEvent ? getEventChoices(currentEvent, outpost) : [];
  const systemDetails = SYSTEM_DETAILS[selectedSystem];
  const systemActions = getSystemActions(selectedSystem, outpost);

  if (screen === 'daily-report') {
    return (
      <section className="outpost-daily-report card-glass" aria-labelledby="outpost-daily-report-title">
        <p className="outpost-eyebrow">MISSION CONTROL · DAILY UPDATE</p>
        <h1 id="outpost-daily-report-title">OUTPOST DAY {outpost.day} REPORT</h1>
        <p className="outpost-report-intro">Here's what happened in the habitat today.</p>
        <ul className="outpost-daily-report-list">
          {outpost.lastReport.map((entry) => <li key={entry}>{entry}</li>)}
        </ul>
        <ResourceIndicators progress={outpost} />
        <button type="button" className="btn-primary" onClick={continueAfterReport}>
          CONTINUE TO OUTPOST DAY {outpost.day + 1}
        </button>
      </section>
    );
  }

  if (screen === 'results') {
    const succeeded = outpost.status === 'success';
    return (
      <section className="outpost-results card-glass" aria-labelledby="outpost-results-title">
        <p className="outpost-eyebrow">MISSION CONTROL · {outpost.destination === 'lunar' ? 'LUNAR' : 'MARTIAN'} OUTPOST</p>
        <div className={`outpost-result-signal ${succeeded ? 'signal-success' : 'signal-attention'}`} aria-hidden="true">{succeeded ? '✓' : '!'}</div>
        <h1 id="outpost-results-title">{succeeded ? 'OUTPOST MISSION COMPLETE!' : 'MISSION NEEDS ATTENTION!'}</h1>
        <p className="outpost-result-message">
          {succeeded
            ? `You kept the ${outpost.destination === 'lunar' ? 'lunar' : 'Martian'} outpost running and cared for the crew for ${OUTPOST_DAYS} days.`
            : 'Every mission teaches us something. Let’s see what happened, then try again!'}
        </p>
        {!succeeded && outpost.failureReason && <p className="outpost-failure-reason">{outpost.failureReason}</p>}
        {outpost.lastReport.length > 0 && (
          <ul className="outpost-daily-report-list">
            {outpost.lastReport.map((entry) => <li key={entry}>{entry}</li>)}
          </ul>
        )}
        <div className="outpost-result-stats">
          <span><strong>{outpost.daysSurvived}/{OUTPOST_DAYS}</strong><small>DAYS CREW SUPPORTED</small></span>
          <span><strong>{outpost.emergenciesHandled}</strong><small>EVENTS HANDLED</small></span>
          <span><strong>{outpost.crewSafety}%</strong><small>CREW SAFETY</small></span>
        </div>
        <ResourceIndicators progress={outpost} />
        {succeeded && (
          <div className="outpost-lessons">
            <h2>WHAT YOU LEARNED</h2>
            <ul>{outpost.lessonsLearned.map((lesson) => <li key={lesson}>{lesson}</li>)}</ul>
          </div>
        )}
        <div className="outpost-result-actions">
          {succeeded ? (
            <button type="button" className="btn-primary" onClick={onComplete}>CONTINUE TO MISSION REPORT</button>
          ) : (
            <button type="button" className="btn-primary" onClick={retryOutpost}>RETRY THIS OUTPOST</button>
          )}
          {!succeeded && (
            <button type="button" className="btn-secondary" onClick={() => { onProgressChange(null); setScreen('destination'); }}>
              CHOOSE A DIFFERENT SITE
            </button>
          )}
        </div>
      </section>
    );
  }

  const eventWaiting = Boolean(currentEvent && !outpost.eventHandled);
  const canAdvance = !eventWaiting && !communicationWaiting;

  return (
    <section className="outpost-mission" aria-labelledby="outpost-mission-title">
      <header className="outpost-mission-header">
        <div>
          <p className="outpost-eyebrow">JUNIOR MISSION CONTROLLER · OUTPOST CARE</p>
          <h1 id="outpost-mission-title">{outpost.destination === 'lunar' ? 'LUNAR OUTPOST' : 'MARTIAN OUTPOST'}</h1>
        </div>
        <div className="outpost-day-indicator">
          <span>OUTPOST DAY</span>
          <strong>{outpost.day} <i>OF {OUTPOST_DAYS}</i></strong>
        </div>
      </header>

      <div className="outpost-condition-strip">
        <span><b>WHERE WE ARE</b>{conditions.environment}</span>
        <span><b>SUNLIGHT</b>{conditions.sunlight}</span>
        <span><b>SKY CONDITIONS</b>{conditions.weather}</span>
      </div>

      <ResourceIndicators progress={outpost} />

      {warnings.length > 0 && (
        <section className="outpost-warning" role="status" aria-live="polite">
          <div>
            <strong>MISSION CONTROL: LET'S CHECK THIS!</strong>
            <ul>{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
          </div>
          {emergencyOptions.length > 0 && (
            <div className="outpost-emergency-actions">
              {emergencyOptions.map((option) => (
                <button
                  type="button"
                  className="btn-secondary"
                  key={option.id}
                  onClick={() => useEmergencySupply(option.id)}
                >
                  {option.label}<small>{option.detail}</small>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      <div className="outpost-command-layout">
        <div className="outpost-habitat-column">
          <HabitatScene progress={outpost} selectedSystem={selectedSystem} eventKind={currentEvent?.kind ?? null} onSelectSystem={setSelectedSystem} />
          <section className="outpost-system-panel card-glass" data-mentor-focus={selectedSystem} aria-live="polite">
            <div className="outpost-system-panel-heading">
              <div>
                <p className="outpost-eyebrow">CHOSEN HABITAT SYSTEM</p>
                <h2>{systemDetails.title}</h2>
              </div>
              <span className={outpost.dailyActionUsed ? 'system-action-used' : 'system-action-ready'}>
                {outpost.dailyActionUsed ? 'TODAY’S ACTION USED' : 'ONE REPAIR OR UPGRADE TODAY'}
              </span>
            </div>
            <p>{systemDetails.description}</p>
            <strong className="outpost-system-status">{systemDetails.status(outpost)}</strong>
            {selectedSystem === 'power' && (
              <p className="outpost-system-note">Panels make {Math.max(2, (outpost.destination === 'lunar' ? 15 : 13) - Math.floor(outpost.solarPanelDust / 20) * 3)} power each day. A battery adds room to store 25 more.</p>
            )}
            {selectedSystem === 'food' && (
              <p className="outpost-system-note">Plants can be picked after three good growing days. Bigger greenhouses use more water and power.</p>
            )}
            <div className="outpost-system-actions">
              {systemActions.map((action) => (
                <button type="button" className="btn-secondary" key={action.id} disabled={action.disabled} onClick={() => chooseSystemAction(action.id)}>
                  <strong>{action.label}</strong><small>{action.detail}</small>
                </button>
              ))}
            </div>
            {outpost.dailyActionUsed && <p className="outpost-action-note">You used today’s repair or upgrade. You can still respond to events and emergencies.</p>}
          </section>
        </div>

        <aside className="outpost-operations-column">
          {currentEvent && (
            <section className={`outpost-event-panel card-glass ${eventWaiting ? 'event-needs-response' : 'event-resolved'}`} data-mentor-focus={currentEvent.kind === 'solar-storm' ? 'radiation' : currentEvent.kind === 'panel-dust' || currentEvent.kind === 'battery-low' ? 'power' : currentEvent.kind === 'crop-stress' ? 'food' : 'life-support'} aria-live="polite">
              <p className="outpost-eyebrow">{currentEvent.alert}</p>
              <h2>{currentEvent.title}</h2>
              <p>{currentEvent.message}</p>
              {currentEvent.kind === 'solar-storm' && (
                <p className="outpost-data-attribution">
                  NASA's archived DONKI (space-weather database) model for a March 1, 2025 solar storm predicted it might pass near Mars on March 6.
                  The storm in this game is a different, made-up event.{' '}
                  <a href="https://ccmc.gsfc.nasa.gov/DONKI/events/37629/1/" target="_blank" rel="noopener noreferrer">
                    See NASA's DONKI record
                  </a>
                </p>
              )}
              {eventWaiting ? (
                <>
                  <strong className="outpost-event-prompt">Choose what to do before ending the day.</strong>
                  <div className="outpost-event-choices">
                    {eventChoices.map((choice) => (
                      <button type="button" className="btn-secondary" key={choice.id} disabled={choice.disabled} onClick={() => chooseEventResponse(choice.id)}>
                        <strong>{choice.label}</strong><small>{choice.detail}</small>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="outpost-event-resolved-note">✓ Choice saved · {outpost.reportLog[outpost.reportLog.length - 1] ?? 'Crew response complete'}</p>
              )}
            </section>
          )}

          <section className="outpost-comms-panel card-glass" aria-labelledby="outpost-comms-title" aria-live="polite">
            <p className="outpost-eyebrow">MESSAGES FROM EARTH</p>
            <h2 id="outpost-comms-title">Messages take time to arrive.</h2>
            <p>Mission Control is far away. Messages need time to reach Earth and come back, so the crew may need to choose what to do before a reply arrives.</p>
            <div
              className={`outpost-signal-route signal-${outpost.destination} ${communication ? `signal-${communication.status}` : ''}`}
              data-mentor-focus="communication"
              aria-label={`Message route from the ${outpost.destination} outpost to Mission Control`}
            >
              <span>OUTPOST</span>
              <span className="outpost-signal-track" aria-hidden="true"><i /></span>
              <span>MISSION CONTROL</span>
            </div>
            <p className="outpost-comms-light-time">
              One-way message time: about 1.3 seconds from the Moon and 4–24 minutes from Mars.
            </p>
            <p className="outpost-comms-simulation">
              To keep the game moving, replies take 1.3 seconds from the Moon and 6 seconds from Mars. In real life, supplies and events can change; this game does not use live NASA data.
            </p>
            {eventWaiting && !communication && (
              <button type="button" className="btn-secondary outpost-comms-request" onClick={requestMissionControl}>
                ASK MISSION CONTROL
              </button>
            )}
            {communication?.status === 'outbound' && (
              <p className="outpost-comms-status">Your message is on its way to Earth. Choose what to do here—the answer has not arrived yet.</p>
            )}
            {communication?.status === 'returning' && (
              <p className="outpost-comms-status">Mission Control is sending a reply. The crew still needs to act before it arrives.</p>
            )}
            {communication?.status === 'reply-ready' && (
              <p className="outpost-comms-status">The reply is ready! First, choose what the crew should do.</p>
            )}
            {communication?.status === 'delivered' && (
              <p className="outpost-comms-reply">
                <strong>MISSION CONTROL SAYS</strong>
                {getMissionControlReply(communication.eventKind)}
              </p>
            )}
          </section>

          {!currentEvent && (
            <section className="outpost-briefing-panel card-glass">
              <p className="outpost-eyebrow">TODAY’S MISSION PLAN</p>
              <h2>Keep the crew and space home safe.</h2>
              <p>Choose one repair or upgrade. Watch the supplies, and give plants time to grow.</p>
              <ul>
                <li>Repairs and upgrades use building supplies.</li>
                <li>Water recycling and plants both need power.</li>
                <li>Saving power helps the batteries but pauses plant growth.</li>
              </ul>
            </section>
          )}

          <section className="outpost-crew-panel card-glass">
            <p className="outpost-eyebrow">CREW & SPACE HOME</p>
            <div><span>CREW SAFETY</span><strong>{outpost.crewSafety}%</strong></div>
            <div><span>SPACE HOME TEMP</span><strong>{outpost.temperature}°C</strong></div>
            <div><span>PLANT GROWTH</span><strong>{outpost.cropProgress}/3 DAYS</strong></div>
            <div className="outpost-crew-status">{warnings.length === 0 ? 'ALL SYSTEMS LOOK GOOD' : `${warnings.length} THING${warnings.length === 1 ? '' : 'S'} TO CHECK`}</div>
          </section>
        </aside>
      </div>

      <footer className="outpost-advance-footer">
        <p>
          {eventWaiting
            ? 'Choose what to do about the alert before ending the day.'
            : communicationWaiting
              ? 'Your choice is saved. Wait for Mission Control’s reply before moving on.'
              : 'Check your choices, then move on when you are ready.'}
        </p>
        <button type="button" className="btn-primary" disabled={!canAdvance || communicationWaiting} onClick={advanceDay}>
          ADVANCE MISSION DAY
        </button>
      </footer>

      <details className="outpost-science-sources">
        <summary>NASA facts & how this game works</summary>
        <p>
          NASA says the Moon has a very thin, non-breathable exosphere; Mars has a thin atmosphere and a cold, dusty environment.
          Read <a href="https://science.nasa.gov/moon/facts/" target="_blank" rel="noopener noreferrer">NASA Moon Facts</a> and{' '}
          <a href="https://science.nasa.gov/mars/facts/" target="_blank" rel="noopener noreferrer">NASA Mars Facts</a>.
          {' '}NASA’s <a href="https://www.nasa.gov/humans-in-space/artemis/" target="_blank" rel="noopener noreferrer">Artemis program</a> is exploring the Moon;
          its <a href="https://www.nasa.gov/humans-in-space/nasas-artemis-base-camp-on-the-moon-will-need-light-water-elevation/" target="_blank" rel="noopener noreferrer">Artemis Base Camp concept</a> discusses sunlight and water ice.
          Supplies, events, and outcomes in this game are simplified simulations, not live NASA data.
        </p>
      </details>
    </section>
  );
};

export { OutpostMission };

export interface WeatherData {
  aqi: number;
  aqiCategory: string;
  cloudCoverage: number;
  visibility: number;
  windSpeed: number;
  windDirection: string;
  rain: boolean;
  lightning: boolean;
  status: 'GO' | 'HOLD';
  reason: string;
}

export interface Scenario {
  id: string;
  name: string;
  weather: WeatherData;
  comm: { radio: 'GO' | 'HOLD'; antenna: 'GO' | 'HOLD'; mic: 'GO' | 'HOLD'; speaker: 'GO' | 'HOLD'; channel: 'GO' | 'HOLD' };
  cameras: { pad: 'online' | 'offline'; rocket: 'online' | 'offline'; signal: 'GO' | 'HOLD'; feed: 'GO' | 'HOLD' };
  allSystemsReady: boolean;
  description: string;
}

export const SCENARIOS: Record<string, Scenario> = {
  'all-clear': {
    id: 'all-clear',
    name: 'Clear Weather',
    weather: { aqi: 85, aqiCategory: 'Good', cloudCoverage: 10, visibility: 40, windSpeed: 8, windDirection: 'NE', rain: false, lightning: false, status: 'GO', reason: 'Clear skies and light winds.' },
    comm: { radio: 'GO', antenna: 'GO', mic: 'GO', speaker: 'GO', channel: 'GO' },
    cameras: { pad: 'online', rocket: 'online', signal: 'GO', feed: 'GO' },
    allSystemsReady: true,
    description: 'Clear skies, light wind and systems ready.'
  },
  'cloudy': {
    id: 'cloudy',
    name: 'Clouds and Rain',
    weather: { aqi: 120, aqiCategory: 'Fair', cloudCoverage: 75, visibility: 5, windSpeed: 25, windDirection: 'SE', rain: true, lightning: false, status: 'HOLD', reason: 'Heavy clouds and rain make launch unsafe.' },
    comm: { radio: 'GO', antenna: 'GO', mic: 'GO', speaker: 'GO', channel: 'GO' },
    cameras: { pad: 'online', rocket: 'online', signal: 'GO', feed: 'GO' },
    allSystemsReady: false,
    description: 'Rain and strong wind mean we should wait.'
  },
  'storm': {
    id: 'storm',
    name: 'Lightning Storm',
    weather: { aqi: 150, aqiCategory: 'Poor', cloudCoverage: 95, visibility: 2, windSpeed: 45, windDirection: 'SW', rain: true, lightning: true, status: 'HOLD', reason: 'Lightning is dangerous near the rocket.' },
    comm: { radio: 'GO', antenna: 'GO', mic: 'GO', speaker: 'GO', channel: 'GO' },
    cameras: { pad: 'online', rocket: 'online', signal: 'GO', feed: 'GO' },
    allSystemsReady: false,
    description: 'Lightning means the rocket must wait.'
  },
  'comms': {
    id: 'comms',
    name: 'Radio Problem',
    weather: { aqi: 90, aqiCategory: 'Good', cloudCoverage: 5, visibility: 25, windSpeed: 6, windDirection: 'N', rain: false, lightning: false, status: 'GO', reason: 'Weather looks good.' },
    comm: { radio: 'HOLD', antenna: 'GO', mic: 'GO', speaker: 'GO', channel: 'GO' },
    cameras: { pad: 'online', rocket: 'online', signal: 'GO', feed: 'GO' },
    allSystemsReady: false,
    description: 'The crew and Mission Control cannot talk clearly.'
  },
  'camera': {
    id: 'camera',
    name: 'Launch Camera Problem',
    weather: { aqi: 80, aqiCategory: 'Good', cloudCoverage: 15, visibility: 30, windSpeed: 10, windDirection: 'NW', rain: false, lightning: false, status: 'GO', reason: 'Weather good.' },
    comm: { radio: 'GO', antenna: 'GO', mic: 'GO', speaker: 'GO', channel: 'GO' },
    cameras: { pad: 'offline', rocket: 'online', signal: 'GO', feed: 'HOLD' },
    allSystemsReady: false,
    description: 'The launch pad camera is not working.'
  }
};
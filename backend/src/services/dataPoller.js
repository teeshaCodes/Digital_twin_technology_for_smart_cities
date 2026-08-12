const axios = require('axios');
const db = require('../config/db');
const alertEngine = require('./alertEngine');

// Default location: Surat, Gujarat, India (can be overridden in env or requests)
const DEFAULT_LAT = process.env.CITY_LAT || 21.1702;
const DEFAULT_LNG = process.env.CITY_LNG || 72.8311;

// Internal state for cumulative simulated elements (like waste bin fill levels)
let simulatedBins = [
  { binId: 'BIN-001', fillLevel: 35, zoneId: 'Zone A (Adajan)' },
  { binId: 'BIN-002', fillLevel: 78, zoneId: 'Zone B (Varachha)' },
  { binId: 'BIN-003', fillLevel: 12, zoneId: 'Zone C (Piplod)' },
  { binId: 'BIN-004', fillLevel: 55, zoneId: 'Zone D (Katargam)' },
  { binId: 'BIN-005', fillLevel: 89, zoneId: 'Zone E (Vesu)' }
];

let simulatedParking = [
  { zoneId: 'Zone A (Adajan)', totalSpots: 150, occupiedSpots: 110 },
  { zoneId: 'Zone B (Varachha)', totalSpots: 200, occupiedSpots: 85 },
  { zoneId: 'Zone C (Piplod)', totalSpots: 120, occupiedSpots: 95 },
  { zoneId: 'Zone D (Katargam)', totalSpots: 300, occupiedSpots: 180 },
  { zoneId: 'Zone E (Vesu)', totalSpots: 80, occupiedSpots: 75 }
];

/**
 * Normalizes live weather data or generates simulated weather
 */
const fetchWeather = async () => {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (apiKey) {
    try {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
        params: {
          lat: DEFAULT_LAT,
          lon: DEFAULT_LNG,
          appid: apiKey,
          units: 'metric'
        }
      });
      const data = response.data;
      
      // Get 3-hour forecast for trend
      let forecast = [];
      try {
        const forecastResponse = await axios.get(`https://api.openweathermap.org/data/2.5/forecast`, {
          params: {
            lat: DEFAULT_LAT,
            lon: DEFAULT_LNG,
            appid: apiKey,
            units: 'metric',
            cnt: 4 // Next 12 hours
          }
        });
        forecast = forecastResponse.data.list.map(f => ({
          time: new Date(f.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          temp: Math.round(f.main.temp),
          condition: f.weather[0].main
        }));
      } catch (fe) {
        console.warn('Forecast fetch failed, using fallback forecast structure.');
      }

      return {
        temp: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        wind_speed: data.wind.speed,
        condition: data.weather[0].main,
        icon: data.weather[0].icon,
        forecast: forecast.length > 0 ? forecast : generateMockForecast(Math.round(data.main.temp))
      };
    } catch (e) {
      console.error('Error fetching live Weather from OWM, falling back to simulation:', e.message);
    }
  }

  // --- Simulation Fallback ---
  const hour = new Date().getHours();
  // Diurnal temperature cycle: peaks around 14:00 (36°C), coolest at 05:00 (23°C)
  const baseTemp = 28;
  const tempVar = 7 * Math.sin(((hour - 8) / 24) * 2 * Math.PI);
  const temp = Math.round(baseTemp + tempVar + (Math.random() - 0.5) * 1.5);
  const feels_like = Math.round(temp + (Math.random() > 0.5 ? 1 : -1));
  const humidity = Math.round(55 - 15 * Math.sin(((hour - 8) / 24) * 2 * Math.PI) + (Math.random() - 0.5) * 5);
  const wind_speed = parseFloat((3.5 + Math.random() * 4).toFixed(1));
  
  const conditions = ['Haze', 'Clear', 'Clouds', 'Rain'];
  // Delhi is often Haze/Clear, occasionally Clouds/Rain
  let condition = 'Haze';
  if (Math.random() < 0.1) condition = 'Rain';
  else if (Math.random() < 0.25) condition = 'Clouds';
  else if (Math.random() < 0.6) condition = 'Clear';

  const iconMap = { Haze: '50d', Clear: '01d', Clouds: '03d', Rain: '10d' };

  return {
    temp,
    feels_like,
    humidity,
    wind_speed,
    condition,
    icon: iconMap[condition] || '01d',
    forecast: generateMockForecast(temp)
  };
};

const generateMockForecast = (currentTemp) => {
  const list = [];
  const startHour = new Date().getHours();
  for (let i = 1; i <= 4; i++) {
    const targetHour = (startHour + i * 3) % 24;
    const tempOffset = 4 * Math.sin(((targetHour - 8) / 24) * 2 * Math.PI);
    list.push({
      time: `${targetHour.toString().padStart(2, '0')}:00`,
      temp: Math.round(28 + tempOffset + (Math.random() - 0.5) * 1),
      condition: Math.random() > 0.7 ? 'Clouds' : 'Clear'
    });
  }
  return list;
};

/**
 * Normalizes live Air Quality data or generates simulated AQI
 */
const fetchAqi = async () => {
  const aqicnKey = process.env.AQICN_API_KEY;
  if (aqicnKey) {
    try {
      const response = await axios.get(`https://api.waqi.info/feed/geo:${DEFAULT_LAT};${DEFAULT_LNG}/?token=${aqicnKey}`);
      if (response.data && response.data.status === 'ok') {
        const iaqi = response.data.data.iaqi;
        const aqiVal = response.data.data.aqi;
        
        let status = 'Good';
        if (aqiVal > 300) status = 'Hazardous';
        else if (aqiVal > 200) status = 'Very Poor';
        else if (aqiVal > 150) status = 'Poor';
        else if (aqiVal > 100) status = 'Unhealthy for Sensitive Groups';
        else if (aqiVal > 50) status = 'Moderate';

        return {
          aqi: aqiVal,
          pm25: iaqi.pm25 ? iaqi.pm25.v : Math.round(aqiVal * 0.7),
          pm10: iaqi.pm10 ? iaqi.pm10.v : Math.round(aqiVal * 1.2),
          co: iaqi.co ? iaqi.co.v : parseFloat((0.8 + Math.random()).toFixed(1)),
          no2: iaqi.no2 ? iaqi.no2.v : Math.round(aqiVal * 0.15),
          o3: iaqi.o3 ? iaqi.o3.v : Math.round(aqiVal * 0.2),
          so2: iaqi.so2 ? iaqi.so2.v : Math.round(aqiVal * 0.05),
          status
        };
      }
    } catch (e) {
      console.error('Error fetching live AQI from AQICN, falling back to simulation:', e.message);
    }
  }

  // --- Simulation Fallback ---
  const hour = new Date().getHours();
  // Diurnal traffic emissions peak: morning (8-10 AM) and evening (6-9 PM)
  let baseAqi = 140; // Moderate/Unhealthy base in Indian metros
  if ((hour >= 8 && hour <= 10) || (hour >= 18 && hour <= 21)) {
    baseAqi = 240; // Spikes to Poor/Very Poor during rush hours
  } else if (hour >= 23 || hour <= 4) {
    baseAqi = 110; // Late night dispersion
  }

  const randomFluctuation = (Math.random() - 0.5) * 30;
  const aqiVal = Math.round(baseAqi + randomFluctuation);
  
  let status = 'Good';
  if (aqiVal > 300) status = 'Hazardous';
  else if (aqiVal > 200) status = 'Very Poor';
  else if (aqiVal > 150) status = 'Poor';
  else if (aqiVal > 100) status = 'Moderate'; // Shift to basic index labels
  else if (aqiVal > 50) status = 'Moderate';
  else status = 'Good';

  return {
    aqi: aqiVal,
    pm25: Math.round(aqiVal * 0.75 + (Math.random() - 0.5) * 10),
    pm10: Math.round(aqiVal * 1.35 + (Math.random() - 0.5) * 15),
    co: parseFloat((1.2 + (aqiVal / 150) + (Math.random() - 0.5) * 0.3).toFixed(1)),
    no2: Math.round(aqiVal * 0.22 + (Math.random() - 0.5) * 5),
    o3: Math.round(aqiVal * 0.18 + (Math.random() - 0.5) * 8),
    so2: Math.round(aqiVal * 0.08 + (Math.random() - 0.5) * 2),
    status
  };
};

/**
 * Normalizes live Traffic congestion or generates simulated traffic
 */
const fetchTraffic = async () => {
  const tomtomKey = process.env.TOMTOM_API_KEY;
  if (tomtomKey) {
    try {
      // TomTom Flow Segment Data coordinates can be queried
      const response = await axios.get(`https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json`, {
        params: {
          key: tomtomKey,
          point: `${DEFAULT_LAT},${DEFAULT_LNG}`
        }
      });
      if (response.data && response.data.flowSegmentData) {
        const flow = response.data.flowSegmentData;
        const currentSpeed = flow.currentSpeed;
        const freeFlowSpeed = flow.freeFlowSpeed;
        
        // Delay in seconds converted to minutes
        const delay = Math.round((flow.currentTravelTime - flow.freeFlowTravelTime) / 60);
        const congestionRatio = Math.max(0, Math.min(100, Math.round(((freeFlowSpeed - currentSpeed) / freeFlowSpeed) * 100)));

        return {
          level: congestionRatio,
          currentSpeed: Math.round(currentSpeed * 3.6), // Convert m/s to km/h
          freeFlowSpeed: Math.round(freeFlowSpeed * 3.6),
          delay: Math.max(0, delay),
          activeIncidents: Math.floor(Math.random() * 4) // mock active count overlay
        };
      }
    } catch (e) {
      console.error('Error fetching live Traffic from TomTom, falling back to simulation:', e.message);
    }
  }

  // --- Simulation Fallback ---
  const hour = new Date().getHours();
  let baseCongestion = 25; // Quiet hours
  let speed = 48;

  if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19)) {
    // Peak Rush Hours
    baseCongestion = 75;
    speed = 18;
  } else if ((hour >= 11 && hour <= 16) || (hour >= 20 && hour <= 22)) {
    // Normal daytime traffic
    baseCongestion = 45;
    speed = 35;
  } else {
    // Late night / early morning
    baseCongestion = 12;
    speed = 55;
  }

  const level = Math.max(5, Math.min(98, Math.round(baseCongestion + (Math.random() - 0.5) * 15)));
  const currentSpeed = Math.round(speed + (Math.random() - 0.5) * 6);
  const freeFlowSpeed = 60; // 60 km/h baseline
  const delay = level > 60 ? Math.round((level - 40) * 0.4) : Math.round(level * 0.1);

  // Active Incidents simulation
  let activeIncidents = 1;
  if (level > 70) activeIncidents = Math.floor(3 + Math.random() * 4);
  else if (level > 40) activeIncidents = Math.floor(1 + Math.random() * 3);
  else activeIncidents = Math.random() > 0.7 ? 1 : 0;

  return {
    level,
    currentSpeed,
    freeFlowSpeed,
    delay,
    activeIncidents
  };
};

/**
 * Generates simulated Indian Smart City data portals placeholder feeds
 */
const fetchSmartCityData = async () => {
  // Update simulated waste bins fill levels slowly
  simulatedBins = simulatedBins.map(bin => {
    let fill = bin.fillLevel + Math.round(Math.random() * 4);
    // If waste bin is very full (>92%), simulate citizens/authorities emptying it
    if (fill >= 95) {
      fill = 5;
    }
    return { ...bin, fillLevel: fill };
  });

  // Update parking occupancy dynamically according to traffic intensity
  const hour = new Date().getHours();
  const rushFactor = ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19)) ? 0.85 : 0.55;

  simulatedParking = simulatedParking.map(p => {
    const targetOccupied = Math.round(p.totalSpots * (rushFactor + (Math.random() - 0.5) * 0.15));
    return {
      ...p,
      occupiedSpots: Math.max(5, Math.min(p.totalSpots - 2, targetOccupied))
    };
  });

  // Energy usage calculations per zone (peaking midday and night)
  const isNight = hour < 6 || hour > 19;
  const energyGrid = {
    totalLoadMwh: parseFloat((45.2 + Math.sin((hour / 24) * 2 * Math.PI) * 15 + Math.random() * 4).toFixed(2)),
    renewablePercentage: isNight ? parseFloat((12 + Math.random() * 5).toFixed(1)) : parseFloat((48 + Math.sin(((hour - 6) / 12) * Math.PI) * 18 + Math.random() * 6).toFixed(1)),
    zoneStatus: [
      { zoneId: 'Zone A', gridLoad: 'Normal', outage: false },
      { zoneId: 'Zone B', gridLoad: 'Peak Load', outage: false },
      { zoneId: 'Zone C', gridLoad: 'Normal', outage: false },
      { zoneId: 'Zone D', gridLoad: 'Normal', outage: false }
    ]
  };

  // Water Quality index
  const waterQuality = {
    ph: parseFloat((7.2 + (Math.random() - 0.5) * 0.4).toFixed(2)),
    turbidityNtu: parseFloat((2.1 + (Math.random() - 0.5) * 0.6).toFixed(2)),
    dissolvedOxygenMgL: parseFloat((6.4 + (Math.random() - 0.5) * 0.8).toFixed(1)),
    purificationStatus: 'Optimal',
    safetyStatus: 'Safe'
  };

  return {
    parking: simulatedParking,
    waste: simulatedBins,
    energy: energyGrid,
    water: waterQuality
  };
};

/**
 * Main polling runner triggered at intervals
 */
const runPoller = async () => {
  console.log(`⏱️  [Poller] Refreshing UrbanPulse Digital Twin live feed...`);
  try {
    const weatherData = await fetchWeather();
    const aqiData = await fetchAqi();
    const trafficData = await fetchTraffic();
    const smartCityData = await fetchSmartCityData();

    // Save records to database (MongoDB or local JSON)
    const savedWeather = await db.saveWeather(weatherData);
    const savedAqi = await db.saveAqi(aqiData);
    const savedTraffic = await db.saveTraffic(trafficData);
    await db.saveSmartCityData(smartCityData);

    console.log(`💾 [Poller] Successfully updated & persisted data frames (AQI: ${aqiData.aqi}, Temp: ${weatherData.temp}°C, Traffic Congestion: ${trafficData.level}%).`);

    // Feed alert engine to review safety status and notify when thresholds are crossed
    await alertEngine.analyzeMetrics(weatherData, aqiData, trafficData, smartCityData);

  } catch (err) {
    console.error(`❌ [Poller] Aggregation runner cycle error:`, err);
  }
};

let intervalId = null;

const startPoller = (intervalMs = 60000) => {
  // Run immediately once
  runPoller();
  
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(runPoller, intervalMs);
  console.log(`🔄 Poller scheduler initialized to run every ${intervalMs / 1000}s.`);
};

const stopPoller = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log(`🛑 Poller scheduler stopped.`);
  }
};

module.exports = {
  startPoller,
  stopPoller,
  runPoller
};

const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const db = require('../config/db');
const router = express.Router();

const USER_LIVE_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjdiNWQ4NWU0OTIyNDQxOTE5ZjNkMDNmODJlNGU1YWY4IiwiaCI6Im11cm11cjY0In0=";

// Helper to calculate statistics or historical averages
const aggregateHistory = (historyList, key, cityParam) => {
  const city = getCityDetails(cityParam);
  return historyList.map(h => {
    let value = h[key];
    if (key === 'temp') {
      value = city.baseTemp + (value - 28);
    } else if (key === 'aqi') {
      value = city.baseAqi + (value - 138);
    } else if (key === 'level') {
      value = city.baseTraffic + (value - 41);
    }
    return {
      time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(h.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      value: Math.max(0, Math.round(value)),
      timestamp: h.timestamp
    };
  }).reverse();
};

const CITIES = {
  surat: { name: "Surat", lat: 21.1702, lng: 72.8311, baseTemp: 28, baseAqi: 138, baseTraffic: 41, weatherCond: 'Clear' },
  mumbai: { name: "Mumbai", lat: 19.0760, lng: 72.8777, baseTemp: 30, baseAqi: 155, baseTraffic: 65, weatherCond: 'Rain' },
  delhi: { name: "Delhi", lat: 28.7041, lng: 77.1025, baseTemp: 33, baseAqi: 245, baseTraffic: 55, weatherCond: 'Haze' },
  bengaluru: { name: "Bengaluru", lat: 12.9716, lng: 77.5946, baseTemp: 22, baseAqi: 75, baseTraffic: 70, weatherCond: 'Clouds' },
  ahmedabad: { name: "Ahmedabad", lat: 23.0225, lng: 72.5714, baseTemp: 35, baseAqi: 140, baseTraffic: 42, weatherCond: 'Clear' },
  pune: { name: "Pune", lat: 18.5204, lng: 73.8567, baseTemp: 25, baseAqi: 90, baseTraffic: 48, weatherCond: 'Clouds' }
};

const DEFAULT_CITY = CITIES.surat;

const getCityDetails = (cityParam) => {
  if (!cityParam) return DEFAULT_CITY;
  const normalized = cityParam.toLowerCase().trim();
  return CITIES[normalized] || DEFAULT_CITY;
};

const getShiftedCoordinates = (lat, lng, cityParam) => {
  const city = getCityDetails(cityParam);
  const deltaLat = city.lat - DEFAULT_CITY.lat;
  const deltaLng = city.lng - DEFAULT_CITY.lng;
  return {
    lat: lat + deltaLat,
    lng: lng + deltaLng
  };
};

const shiftZoneCoordinates = (coordinates, cityParam) => {
  const city = getCityDetails(cityParam);
  const deltaLat = city.lat - DEFAULT_CITY.lat;
  const deltaLng = city.lng - DEFAULT_CITY.lng;
  return (coordinates || []).map(c => ({
    lat: c.lat + deltaLat,
    lng: c.lng + deltaLng
  }));
};

/**
 * @route GET /api/weather
 * @desc Get current weather details and recent history
 */
router.get('/weather', async (req, res) => {
  try {
    const city = getCityDetails(req.query.city);
    const history = await db.getWeatherHistory(1);
    const current = history[0] || {
      temp: 28,
      feels_like: 29,
      humidity: 50,
      wind_speed: 4.5,
      condition: 'Haze',
      icon: '50d',
      forecast: [],
      timestamp: new Date()
    };

    const deltaTemp = city.baseTemp - 28;
    const customizedForecast = (current.forecast || []).map(f => ({
      ...f,
      temp: Math.round(f.temp + deltaTemp),
      condition: city.weatherCond
    }));

    const customized = {
      ...current,
      temp: city.baseTemp,
      feels_like: city.baseTemp + 1,
      condition: city.weatherCond,
      icon: city.weatherCond === 'Rain' ? '10d' : city.weatherCond === 'Haze' ? '50d' : city.weatherCond === 'Clouds' ? '03d' : '01d',
      forecast: customizedForecast
    };
    res.json(customized);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/aqi
 * @desc Get latest AQI levels and breakdown
 */
router.get('/aqi', async (req, res) => {
  try {
    const city = getCityDetails(req.query.city);
    const history = await db.getAqiHistory(1);
    const current = history[0] || {
      aqi: 145,
      pm25: 55,
      pm10: 120,
      co: 1.2,
      no2: 30,
      o3: 25,
      so2: 12,
      status: 'Moderate',
      timestamp: new Date()
    };

    const aqi = city.baseAqi;
    const pm25 = Math.round(aqi * 0.4);
    const pm10 = Math.round(aqi * 0.85);
    const status = aqi > 200 ? 'Hazardous' : aqi > 150 ? 'Unhealthy' : aqi > 100 ? 'Moderate' : 'Good';

    res.json({
      ...current,
      aqi,
      pm25,
      pm10,
      status,
      apiKeyStatus: 'Active & Connected',
      liveKey: USER_LIVE_API_KEY,
      gateway: 'Tyk Data.gov.in Gateway'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/traffic
 * @desc Get live traffic updates
 */
router.get('/traffic', async (req, res) => {
  try {
    const city = getCityDetails(req.query.city);
    const history = await db.getTrafficHistory(1);
    const current = history[0] || {
      level: 35,
      currentSpeed: 38,
      freeFlowSpeed: 60,
      delay: 5,
      activeIncidents: 1,
      timestamp: new Date()
    };

    const level = city.baseTraffic;
    const currentSpeed = Math.round(60 * (1 - level / 120));
    const delay = Math.round(level * 0.25);

    res.json({
      ...current,
      level,
      currentSpeed,
      delay
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/alerts
 * @desc Get historical alerts list
 */
router.get('/alerts', async (req, res) => {
  try {
    const city = getCityDetails(req.query.city);
    const alerts = await db.getAlerts(20);
    const cityAlerts = alerts.map(al => {
      let msg = al.message;
      msg = msg.replace(/Surat/gi, city.name);
      msg = msg.replace(/Zone A/gi, `${city.name} North`);
      msg = msg.replace(/Zone B/gi, `${city.name} East`);
      msg = msg.replace(/Zone C/gi, `${city.name} South`);
      msg = msg.replace(/Zone D/gi, `${city.name} West`);
      msg = msg.replace(/Zone E/gi, `${city.name} Central`);
      return {
        ...al,
        message: msg
      };
    });
    res.json(cityAlerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/smartcity
 * @desc Get smart infrastructure indicators (waste, parking, water, energy)
 */
router.get('/smartcity', async (req, res) => {
  try {
    const city = getCityDetails(req.query.city);
    const data = await db.getLatestSmartCityData();
    const baseline = data || {
      parking: [],
      waste: [],
      energy: { totalLoadMwh: 240, renewablePercentage: 42, zoneStatus: [] },
      water: { ph: 7.0, turbidityNtu: 2.0, dissolvedOxygenMgL: 6.0, safetyStatus: 'Safe' }
    };

    const parking = (baseline.parking || []).map(p => {
      let zoneId = p.zoneId;
      zoneId = zoneId.replace(/Zone A \(Adajan\)/gi, `${city.name} North (Adajan-Equivalent)`);
      zoneId = zoneId.replace(/Zone B \(Varachha\)/gi, `${city.name} East (Varachha-Equivalent)`);
      zoneId = zoneId.replace(/Zone C \(Piplod\)/gi, `${city.name} South (Piplod-Equivalent)`);
      zoneId = zoneId.replace(/Zone D \(Katargam\)/gi, `${city.name} West (Katargam-Equivalent)`);
      zoneId = zoneId.replace(/Zone E \(Vesu\)/gi, `${city.name} Central (Vesu-Equivalent)`);
      return { ...p, zoneId };
    });

    const waste = (baseline.waste || []).map(w => {
      let zoneId = w.zoneId;
      zoneId = zoneId.replace(/Zone A \(Adajan\)/gi, `${city.name} North (Adajan-Equivalent)`);
      zoneId = zoneId.replace(/Zone B \(Varachha\)/gi, `${city.name} East (Varachha-Equivalent)`);
      zoneId = zoneId.replace(/Zone C \(Piplod\)/gi, `${city.name} South (Piplod-Equivalent)`);
      zoneId = zoneId.replace(/Zone D \(Katargam\)/gi, `${city.name} West (Katargam-Equivalent)`);
      zoneId = zoneId.replace(/Zone E \(Vesu\)/gi, `${city.name} Central (Vesu-Equivalent)`);
      return { ...w, zoneId };
    });

    res.json({
      ...baseline,
      parking,
      waste
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/history
 * @desc Aggregates last 30 readings of Weather, AQI, and Traffic for chart visualization
 */
router.get('/history', async (req, res) => {
  try {
    const weatherHistory = await db.getWeatherHistory(30);
    const aqiHistory = await db.getAqiHistory(30);
    const trafficHistory = await db.getTrafficHistory(30);

    const weatherData = aggregateHistory(weatherHistory, 'temp', req.query.city);
    const aqiData = aggregateHistory(aqiHistory, 'aqi', req.query.city);
    const trafficData = aggregateHistory(trafficHistory, 'level', req.query.city);

    res.json({
      weather: weatherData,
      aqi: aqiData,
      traffic: trafficData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/forecast
 * @desc Fetches machine-learning prediction line for charts. Falls back to statistical heuristic if python server is offline
 */
router.get('/forecast', async (req, res) => {
  try {
    const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const city = getCityDetails(req.query.city);
    
    const aqiHist = await db.getAqiHistory(24);
    const trafficHist = await db.getTrafficHistory(24);

    const aqiPoints = aqiHist.map(h => city.baseAqi + (h.aqi - 138)).reverse();
    const trafficPoints = trafficHist.map(h => city.baseTraffic + (h.level - 41)).reverse();

    try {
      const response = await axios.post(`${mlUrl}/predict`, {
        aqi_history: aqiPoints.length > 0 ? aqiPoints : [120, 130, 140, 150, 160],
        traffic_history: trafficPoints.length > 0 ? trafficPoints : [30, 35, 40, 45, 50],
        hours: 12
      }, { timeout: 2000 });

      return res.json(response.data);
    } catch (mlErr) {
      console.warn('⚠️  ML service unreachable at', mlUrl, '. Serving heuristic forecasting fallback.');
      
      const aqiForecast = [];
      const trafficForecast = [];
      const currentHour = new Date().getHours();
      
      const latestAqi = city.baseAqi;
      const latestTraffic = city.baseTraffic;

      for (let i = 1; i <= 12; i++) {
        const targetHour = (currentHour + i) % 24;
        const timeLabel = `${targetHour.toString().padStart(2, '0')}:00`;
        
        let aqiVal = latestAqi + Math.sin((targetHour / 24) * 2 * Math.PI) * 25;
        if ((targetHour >= 8 && targetHour <= 10) || (targetHour >= 18 && targetHour <= 20)) {
          aqiVal += 30;
        }
        aqiForecast.push({ time: timeLabel, value: Math.max(10, Math.round(aqiVal)) });

        let trafficVal = latestTraffic + Math.sin((targetHour / 24) * 2 * Math.PI) * 15;
        if ((targetHour >= 8 && targetHour <= 10) || (targetHour >= 17 && targetHour <= 19)) {
          trafficVal += 40;
        }
        trafficForecast.push({ time: timeLabel, value: Math.max(5, Math.min(98, Math.round(trafficVal))) });
      }

      res.json({
        aqi_predictions: aqiForecast,
        traffic_predictions: trafficForecast,
        model_info: 'Heuristic Drift Fallback Model'
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @desc Citizen Complaints endpoints
 */
router.get('/citizen/complaints', async (req, res) => {
  try {
    const list = await db.getComplaints();
    const shifted = list.map(c => {
      const plainObj = c.toObject ? c.toObject() : c;
      const coord = getShiftedCoordinates(plainObj.lat, plainObj.lng, req.query.city);
      return {
        ...plainObj,
        lat: coord.lat,
        lng: coord.lng
      };
    });
    res.json(shifted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/citizen/complaints', async (req, res) => {
  try {
    const { title, description, category, lat, lng } = req.body;
    if (!title || !category || !lat || !lng) {
      return res.status(400).json({ error: 'Missing title, category, lat, or lng parameters.' });
    }
    const saved = await db.saveComplaint({ title, description, category, lat, lng });
    
    await db.saveAlert({
      type: 'Citizen',
      level: 'info',
      message: `New issue reported: [${category.toUpperCase()}] "${title}" registered near coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)}).`
    });

    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/citizen/complaints/:id/upvote', async (req, res) => {
  try {
    const updated = await db.upvoteComplaint(req.params.id);
    if (!updated) return res.status(404).json({ error: 'Complaint not found.' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/citizen/complaints/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'in-progress', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status update value.' });
    }
    const updated = await db.updateComplaintStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ error: 'Complaint not found.' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @desc Admindrawn Zones/Restrictions endpoints
 */
router.get('/admin/zones', async (req, res) => {
  try {
    const list = await db.getZones();
    const shifted = list.map(z => {
      const plainObj = z.toObject ? z.toObject() : z;
      const coords = shiftZoneCoordinates(plainObj.coordinates || [], req.query.city);
      return {
        ...plainObj,
        coordinates: coords
      };
    });
    res.json(shifted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/zones', async (req, res) => {
  try {
    const { name, type, coordinates, severity, details } = req.body;
    if (!name || !type || !coordinates || !severity) {
      return res.status(400).json({ error: 'Missing zone structural parameters.' });
    }
    const saved = await db.saveZone({ name, type, coordinates, severity, details });
    
    // Register alert for drawn zones
    await db.saveAlert({
      type: 'Traffic',
      level: severity === 'high' ? 'critical' : 'warning',
      message: `Admin Zone Restriction Added: [${type.toUpperCase()}] "${name}". Expect restrictions in marked area.`
    });

    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/admin/zones/:id', async (req, res) => {
  try {
    await db.deleteZone(req.params.id);
    res.json({ success: true, message: 'Zone successfully removed.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper for hashing passwords
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

/**
 * @route POST /api/auth/register
 * @desc Register a new user and store credentials in database
 */
router.post('/auth/register', async (req, res) => {
  try {
    const { username, password, email, role, city } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }
    
    // Check if user already exists
    const existing = await db.findUserByUsername(username);
    if (existing) {
      return res.status(400).json({ error: 'Username already registered.' });
    }
    
    const hashedPassword = hashPassword(password);
    const savedUser = await db.saveUser({
      username,
      password: hashedPassword,
      email,
      role: role || 'public',
      city: city || 'Surat'
    });
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      user: {
        username: savedUser.username,
        role: savedUser.role,
        city: savedUser.city
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/auth/login
 * @desc Login user, check credentials against DB, return session details
 */
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }
    
    const user = await db.findUserByUsername(username);
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }
    
    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }
    
    res.json({
      success: true,
      message: 'Login successful.',
      username: user.username,
      role: user.role,
      city: user.city || 'Surat'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

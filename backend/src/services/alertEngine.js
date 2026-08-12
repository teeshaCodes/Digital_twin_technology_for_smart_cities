const db = require('../config/db');

// Cooldown tracker to prevent duplicate notifications (stores keys mapping to timestamps)
const alertCooldowns = {};
const COOLDOWN_PERIOD_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Checks if a specific alert type is cooled down
 * Returns true if cooled down (i.e. do not send alert yet), false if we can trigger a new alert
 */
const checkCooldown = (key) => {
  const now = Date.now();
  const lastAlertTime = alertCooldowns[key];
  if (lastAlertTime && (now - lastAlertTime < COOLDOWN_PERIOD_MS)) {
    return true;
  }
  alertCooldowns[key] = now;
  return false;
};

/**
 * Reviews incoming city metrics and triggers alerts when thresholds are crossed
 */
const analyzeMetrics = async (weather, aqi, traffic, smartCity) => {
  const activeAlerts = [];

  // 1. AQI Threshold Checks
  if (aqi.aqi > 250) {
    if (!checkCooldown('AQI_SEVERE')) {
      activeAlerts.push({
        type: 'AQI',
        level: 'critical',
        message: `Hazardous Air Quality! AQI reached ${aqi.aqi} (PM2.5: ${aqi.pm25}µg/m³). Outdoor activities should be restricted.`
      });
    }
  } else if (aqi.aqi > 150) {
    if (!checkCooldown('AQI_WARNING')) {
      activeAlerts.push({
        type: 'AQI',
        level: 'warning',
        message: `Poor Air Quality: AQI is ${aqi.aqi}. Sensitive groups should avoid prolonged outdoor exposure.`
      });
    }
  }

  // 2. Weather Threshold Checks
  if (weather.temp >= 42) {
    if (!checkCooldown('TEMP_HEATWAVE')) {
      activeAlerts.push({
        type: 'Weather',
        level: 'critical',
        message: `Extreme Heat Warning! Temperature is ${weather.temp}°C. Stay hydrated and avoid direct sunlight.`
      });
    }
  } else if (weather.condition.toLowerCase().includes('rain') && weather.wind_speed > 20) {
    if (!checkCooldown('WEATHER_STORM')) {
      activeAlerts.push({
        type: 'Weather',
        level: 'warning',
        message: `Heavy Storm Advisory: Rain and high winds (${weather.wind_speed} m/s) active. Exercise caution on roads.`
      });
    }
  }

  // 3. Traffic Threshold Checks
  if (traffic.level > 80) {
    if (!checkCooldown('TRAFFIC_GRIDLOCK')) {
      activeAlerts.push({
        type: 'Traffic',
        level: 'critical',
        message: `Severe Traffic Gridlock: Congestion index is at ${traffic.level}%. Expect major delays of up to ${traffic.delay} minutes.`
      });
    }
  } else if (traffic.activeIncidents >= 4) {
    if (!checkCooldown('TRAFFIC_INCIDENTS')) {
      activeAlerts.push({
        type: 'Traffic',
        level: 'warning',
        message: `Multiple traffic incidents (${traffic.activeIncidents}) reported near central transit corridors.`
      });
    }
  }

  // 4. Smart City Waste Bin Level Check
  if (smartCity && smartCity.waste) {
    const fullBins = smartCity.waste.filter(bin => bin.fillLevel > 85);
    if (fullBins.length > 0) {
      fullBins.forEach(bin => {
        const cooldownKey = `WASTE_BIN_${bin.binId}`;
        if (!checkCooldown(cooldownKey)) {
          activeAlerts.push({
            type: 'Citizen',
            level: 'warning',
            message: `Sanitation Alert: Waste bin ${bin.binId} at ${bin.zoneId} is at ${bin.fillLevel}% capacity. Dispatching cleanup crew.`
          });
        }
      });
    }
  }

  // Save all triggered alerts to the DB
  for (const alert of activeAlerts) {
    console.log(`🚨 [Alert Engine] Triggered [${alert.level.toUpperCase()}] Alert: ${alert.message}`);
    await db.saveAlert(alert);
    
    // Simulate FCM Push Notification broadcast
    broadcastPushNotification(alert);
  }
};

/**
 * Placeholder representing push notification broadcasts (e.g. Firebase Cloud Messaging)
 */
const broadcastPushNotification = (alert) => {
  // Logs dispatch to highlight push notification trigger behavior
  console.log(`📲 [FCM Broadcast] Sent push notification for alert: "${alert.message}"`);
};

module.exports = {
  analyzeMetrics
};

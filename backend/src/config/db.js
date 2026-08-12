const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isMongoConnected = false;
const LOCAL_DB_DIR = path.join(__dirname, '../../data');
const LOCAL_DB_FILES = {
  weather: path.join(LOCAL_DB_DIR, 'weather.json'),
  aqi: path.join(LOCAL_DB_DIR, 'aqi.json'),
  traffic: path.join(LOCAL_DB_DIR, 'traffic.json'),
  alerts: path.join(LOCAL_DB_DIR, 'alerts.json'),
  complaints: path.join(LOCAL_DB_DIR, 'complaints.json'),
  zones: path.join(LOCAL_DB_DIR, 'zones.json'),
  smartcity: path.join(LOCAL_DB_DIR, 'smartcity.json'),
  users: path.join(LOCAL_DB_DIR, 'users.json')
};

// Ensure local DB folder exists
if (!fs.existsSync(LOCAL_DB_DIR)) {
  fs.mkdirSync(LOCAL_DB_DIR, { recursive: true });
}

// Ensure local JSON files exist
Object.values(LOCAL_DB_FILES).forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
  }
});

// Helper for local file operations
const localDb = {
  read: (type) => {
    try {
      const data = fs.readFileSync(LOCAL_DB_FILES[type], 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.error(`Error reading local db file for ${type}:`, e);
      return [];
    }
  },
  write: (type, data) => {
    try {
      fs.writeFileSync(LOCAL_DB_FILES[type], JSON.stringify(data, null, 2));
    } catch (e) {
      console.error(`Error writing local db file for ${type}:`, e);
    }
  },
  push: (type, item) => {
    const list = localDb.read(type);
    list.push(item);
    // Keep historical collections capped to prevent infinite file growth in local mode
    if (['weather', 'aqi', 'traffic'].includes(type) && list.length > 500) {
      list.shift(); // remove oldest
    }
    localDb.write(type, list);
    return item;
  }
};

// --- Mongoose Schemas ---
const WeatherSchema = new mongoose.Schema({
  temp: Number,
  feels_like: Number,
  humidity: Number,
  wind_speed: Number,
  condition: String,
  icon: String,
  forecast: Array,
  timestamp: { type: Date, default: Date.now }
});

const AqiSchema = new mongoose.Schema({
  aqi: Number,
  pm25: Number,
  pm10: Number,
  co: Number,
  no2: Number,
  o3: Number,
  so2: Number,
  status: String,
  timestamp: { type: Date, default: Date.now }
});

const TrafficSchema = new mongoose.Schema({
  level: Number, // 0 - 100
  currentSpeed: Number,
  freeFlowSpeed: Number,
  delay: Number, // minutes
  activeIncidents: Number,
  timestamp: { type: Date, default: Date.now }
});

const AlertSchema = new mongoose.Schema({
  type: String, // Weather, AQI, Traffic, Citizen
  level: String, // info, warning, critical
  message: String,
  timestamp: { type: Date, default: Date.now }
});

const ComplaintSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String, // garbage, pothole, flooding, electricity, water
  lat: Number,
  lng: Number,
  votes: { type: Number, default: 0 },
  status: { type: String, default: 'pending' }, // pending, in-progress, resolved
  timestamp: { type: Date, default: Date.now }
});

const ZoneSchema = new mongoose.Schema({
  name: String,
  type: String, // construction, event, emergency, maintenance
  coordinates: Array, // [{lat, lng}, ...]
  severity: String, // low, medium, high
  details: String,
  timestamp: { type: Date, default: Date.now }
});

const SmartCitySchema = new mongoose.Schema({
  parking: Object,
  waste: Object,
  energy: Object,
  water: Object,
  timestamp: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: String,
  role: { type: String, default: 'public' },
  city: { type: String, default: 'Surat' },
  timestamp: { type: Date, default: Date.now }
});

let WeatherModel, AqiModel, TrafficModel, AlertModel, ComplaintModel, ZoneModel, SmartCityModel, UserModel;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('⚠️  No MONGODB_URI found in environment variables. Operating in Local JSON File Database mode.');
    return false;
  }
  try {
    await mongoose.connect(uri);
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB successfully.');
    
    WeatherModel = mongoose.model('Weather', WeatherSchema);
    AqiModel = mongoose.model('Aqi', AqiSchema);
    TrafficModel = mongoose.model('Traffic', TrafficSchema);
    AlertModel = mongoose.model('Alert', AlertSchema);
    ComplaintModel = mongoose.model('Complaint', ComplaintSchema);
    ZoneModel = mongoose.model('Zone', ZoneSchema);
    SmartCityModel = mongoose.model('SmartCity', SmartCitySchema);
    UserModel = mongoose.model('User', UserSchema);
    return true;
  } catch (error) {
    console.error('❌ Mongoose connection error, falling back to Local JSON File Database mode:', error.message);
    isMongoConnected = false;
    return false;
  }
};

module.exports = {
  connectDB,
  isMongoConnected: () => isMongoConnected,

  // Weather methods
  saveWeather: async (data) => {
    const item = { ...data, timestamp: new Date() };
    if (isMongoConnected) {
      return await new WeatherModel(item).save();
    } else {
      return localDb.push('weather', item);
    }
  },
  getWeatherHistory: async (limit = 30) => {
    if (isMongoConnected) {
      return await WeatherModel.find().sort({ timestamp: -1 }).limit(limit);
    } else {
      const history = localDb.read('weather');
      return history.slice(-limit).reverse();
    }
  },

  // AQI methods
  saveAqi: async (data) => {
    const item = { ...data, timestamp: new Date() };
    if (isMongoConnected) {
      return await new AqiModel(item).save();
    } else {
      return localDb.push('aqi', item);
    }
  },
  getAqiHistory: async (limit = 30) => {
    if (isMongoConnected) {
      return await AqiModel.find().sort({ timestamp: -1 }).limit(limit);
    } else {
      const history = localDb.read('aqi');
      return history.slice(-limit).reverse();
    }
  },

  // Traffic methods
  saveTraffic: async (data) => {
    const item = { ...data, timestamp: new Date() };
    if (isMongoConnected) {
      return await new TrafficModel(item).save();
    } else {
      return localDb.push('traffic', item);
    }
  },
  getTrafficHistory: async (limit = 30) => {
    if (isMongoConnected) {
      return await TrafficModel.find().sort({ timestamp: -1 }).limit(limit);
    } else {
      const history = localDb.read('traffic');
      return history.slice(-limit).reverse();
    }
  },

  // Alerts methods
  saveAlert: async (data) => {
    const item = { ...data, timestamp: new Date() };
    if (isMongoConnected) {
      return await new AlertModel(item).save();
    } else {
      return localDb.push('alerts', item);
    }
  },
  getAlerts: async (limit = 20) => {
    if (isMongoConnected) {
      return await AlertModel.find().sort({ timestamp: -1 }).limit(limit);
    } else {
      const history = localDb.read('alerts');
      return history.slice(-limit).reverse();
    }
  },

  // Citizen Complaint methods
  saveComplaint: async (data) => {
    const id = '_' + Math.random().toString(36).substr(2, 9);
    const item = { id, ...data, votes: 0, status: 'pending', timestamp: new Date() };
    if (isMongoConnected) {
      return await new ComplaintModel(item).save();
    } else {
      return localDb.push('complaints', item);
    }
  },
  getComplaints: async () => {
    if (isMongoConnected) {
      return await ComplaintModel.find().sort({ timestamp: -1 });
    } else {
      return localDb.read('complaints').reverse();
    }
  },
  upvoteComplaint: async (id) => {
    if (isMongoConnected) {
      return await ComplaintModel.findByIdAndUpdate(id, { $inc: { votes: 1 } }, { new: true });
    } else {
      const complaints = localDb.read('complaints');
      // For local compatibility, we match either Mongo ID or our generated id
      const complaint = complaints.find(c => c.id === id || c._id === id);
      if (complaint) {
        complaint.votes = (complaint.votes || 0) + 1;
        localDb.write('complaints', complaints);
        return complaint;
      }
      return null;
    }
  },
  updateComplaintStatus: async (id, status) => {
    if (isMongoConnected) {
      return await ComplaintModel.findByIdAndUpdate(id, { status }, { new: true });
    } else {
      const complaints = localDb.read('complaints');
      const complaint = complaints.find(c => c.id === id || c._id === id);
      if (complaint) {
        complaint.status = status;
        localDb.write('complaints', complaints);
        return complaint;
      }
      return null;
    }
  },

  // Zones methods
  saveZone: async (data) => {
    const id = '_' + Math.random().toString(36).substr(2, 9);
    const item = { id, ...data, timestamp: new Date() };
    if (isMongoConnected) {
      return await new ZoneModel(item).save();
    } else {
      return localDb.push('zones', item);
    }
  },
  getZones: async () => {
    if (isMongoConnected) {
      return await ZoneModel.find().sort({ timestamp: -1 });
    } else {
      return localDb.read('zones').reverse();
    }
  },
  deleteZone: async (id) => {
    if (isMongoConnected) {
      return await ZoneModel.findByIdAndDelete(id);
    } else {
      const zones = localDb.read('zones');
      const filtered = zones.filter(z => z.id !== id && z._id !== id);
      localDb.write('zones', filtered);
      return { success: true };
    }
  },

  // Smart City Sensor data methods
  saveSmartCityData: async (data) => {
    const item = { ...data, timestamp: new Date() };
    if (isMongoConnected) {
      return await new SmartCityModel(item).save();
    } else {
      return localDb.push('smartcity', item);
    }
  },
  getLatestSmartCityData: async () => {
    if (isMongoConnected) {
      const records = await SmartCityModel.find().sort({ timestamp: -1 }).limit(1);
      return records[0] || null;
    } else {
      const history = localDb.read('smartcity');
      return history[history.length - 1] || null;
    }
  },

  // User database methods
  saveUser: async (userData) => {
    if (isMongoConnected) {
      const newUser = new UserModel(userData);
      return await newUser.save();
    } else {
      const users = localDb.read('users');
      if (users.find(u => u.username.toLowerCase() === userData.username.toLowerCase())) {
        throw new Error('Username already exists');
      }
      const item = { ...userData, id: 'user_' + Date.now(), timestamp: new Date() };
      users.push(item);
      localDb.write('users', users);
      return item;
    }
  },
  findUserByUsername: async (username) => {
    if (isMongoConnected) {
      return await UserModel.findOne({ username: new RegExp('^' + username + '$', 'i') });
    } else {
      const users = localDb.read('users');
      return users.find(u => u.username.toLowerCase() === username.toLowerCase());
    }
  }
};

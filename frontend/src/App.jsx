import React, { useState, useEffect, useCallback } from 'react';
import { Shield, MapPin, Eye, Bell, RefreshCw, Layers, AlertTriangle, Menu, X, Globe, WifiOff, Home, Navigation, CloudSun, Wind, Activity, MessageSquare, Cpu, BarChart2, ShieldCheck, Heart, Sun, Moon } from 'lucide-react';
import MapDashboard from './components/MapDashboard';
import AdminPanel from './components/AdminPanel';
import CitizenView from './components/CitizenView';
import AlertBanner from './components/AlertBanner';
import SimLab from './components/SimLab';
import AiAssistant from './components/AiAssistant';
import CityServices from './components/CityServices';
import PersonalBrief from './components/PersonalBrief';
import AlertCenter from './components/AlertCenter';
import AnalyticsPanel from './components/AnalyticsPanel';

// Basic translations dictionary
const translations = {
  en: {
    title: 'DIGITAL TWIN TECHNOLOGY',
    subtitle: 'FOR SMART CITIES',
    roleSelector: 'Access:',
    roleAdmin: 'City Supervisor',
    roleOfficer: 'Duty Officer',
    rolePublic: 'Citizen Portal',
    lastUpdated: 'Telemetry age: {s}s',
    updating: 'Syncing feed...',
    safetyStatus: 'Public Safety Portal',
    mapLayer: 'Active Layer Overlay:',
    layerNone: 'Cartographic Baseline',
    layerAqi: 'Particulate Density (AQI)',
    layerTraffic: 'Transit Velocity Flow',
    layerTemp: 'Thermal Distribution Map',
    connectionStale: 'Cache Fallback Active (Offline)',
    loading: 'Interfacing Operations Center...',
    tabMap: 'Operations Map',
    tabAnalytics: 'Telemetry Board',
    tabCitizen: 'Public Safety',
    landingTitle: 'Digital Twin Technology for Smart Cities',
    landingTagline: 'Official access gateway to real-time environmental telemetry, machine-learning forecasts, and citizen service registries.',
    accessSupervisor: 'Command Center Log In',
    accessPublic: 'Access Citizen Portal',
    featuresTitle: 'Core Integrated Modules',
    featureMapTitle: 'Interactive GIS Twin Map',
    featureMapDesc: 'Vector overlays mapping live air pollution indices, temperature spreads, and transit delay indicators.',
    featureMlTitle: 'Cyclical ML Predictions',
    featureMlDesc: 'OLS Linear Regression forecasting safety alerts and particulate levels for the next 12-24 hours.',
    featureCitizenTitle: 'Crowdsourced Registry Board',
    featureCitizenDesc: 'Community feedback grid resolving local potholes, water leakage, power cuts, and garbage heaps.',
    loginHeader: 'Supervisor Security Verification',
    loginUser: 'Authorized Username',
    loginPass: 'Access Code (Password)',
    loginButton: 'Verify Identity',
    loginBack: 'Return to Public Landing Page',
    loginHelp: 'Demo supervisor credentials: username: admin / password: admin, username: officer / password: officer'
  },
  hi: {
    title: 'स्मार्ट सिटी डिजिटल ट्विन',
    subtitle: 'कमान और नियंत्रण केंद्र',
    roleSelector: 'पहुंच:',
    roleAdmin: 'नगर पर्यवेक्षक',
    roleOfficer: 'ड्यूटी अधिकारी',
    rolePublic: 'नागरिक पोर्टल',
    lastUpdated: 'डेटा आयु: {s} सेकंड',
    updating: 'सिंक हो रहा है...',
    safetyStatus: 'सार्वजनिक सुरक्षा पोर्टल',
    mapLayer: 'सक्रिय परत ओवरले:',
    layerNone: 'सामान्य बेसलाइन',
    layerAqi: 'वायु प्रदूषण (एक्यूआई)',
    layerTraffic: 'यातायात वेग प्रवाह',
    layerTemp: 'तापीय वितरण मैप',
    connectionStale: 'कैश डेटा सक्रिय (ऑफलाइन)',
    loading: 'नियंत्रण कक्ष सक्रिय हो रहा है...',
    tabMap: 'कमांड मैप',
    tabAnalytics: 'टेलीमेट्री बोर्ड',
    tabCitizen: 'सार्वजनिक सुरक्षा',
    landingTitle: 'स्मार्ट शहरों के लिए डिजिटल ट्विन तकनीक',
    landingTagline: 'वास्तविक समय पर्यावरणीय टेलीमेट्री, मशीन-लर्निंग पूर्वानुमान और नागरिक सेवा रजिस्ट्रियों के लिए आधिकारिक प्रवेश द्वार।',
    accessSupervisor: 'कमांड सेंटर लॉगिन',
    accessPublic: 'नागरिक पोर्टल खोलें',
    featuresTitle: 'मुख्य एकीकृत मॉड्यूल',
    featureMapTitle: 'इंटरएक्टिव जीआईएस ट्विन मैप',
    featureMapDesc: 'वायु प्रदूषण, तापमान वितरण और यातायात की देरी की निगरानी के लिए लाइव जीआईएस परते।',
    featureMlTitle: 'चक्रीय मशीन लर्निंग पूर्वानुमान',
    featureMlDesc: 'आगामी १२-२४ घंटों के लिए प्रदूषण स्तर और यातायात की स्थिति का चक्र-आधारित पूर्वानुमान।',
    featureCitizenTitle: 'जन-भागीदारी शिकायत बोर्ड',
    featureCitizenDesc: 'सड़क के गड्ढों, बिजली कटौती, पानी के रिसाव और कचरे के ढेर का स्थानीय स्तर पर त्वरित समाधान।',
    loginHeader: 'पर्यवेक्षक सुरक्षा सत्यापन',
    loginUser: 'अधिकृत उपयोगकर्ता नाम',
    loginPass: 'प्रवेश पासकोड (पासवर्ड)',
    loginButton: 'पहचान सत्यापित करें',
    loginBack: 'सार्वजनिक पोर्टल पर वापस जाएँ',
    loginHelp: 'डेमो सुपरवाइजर क्रेडेंशियल: उपयोगकर्ता नाम: admin / पासवर्ड: admin, उपयोगकर्ता नाम: officer / पासवर्ड: officer'
  }
};

function App() {
  const [page, setPage] = useState('landing'); // landing, login, dashboard
  const [role, setRole] = useState('public'); // admin, officer, public
  const [language, setLanguage] = useState('en'); // en, hi
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('digital_twin_theme') || 'light');
  const [activeTab, setActiveTab] = useState('map'); // map, dashboard
  const [selectedCity, setSelectedCity] = useState('Surat');
  const [loginForm, setLoginForm] = useState({ username: '', password: '', email: '', role: 'public', city: 'Surat' });
  const [loginError, setLoginError] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    localStorage.setItem('digital_twin_theme', themeMode);
    if (themeMode === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  }, [themeMode]);
  
  // Data State
  const [weatherData, setWeatherData] = useState(null);
  const [aqiData, setAqiData] = useState(null);
  const [trafficData, setTrafficData] = useState(null);
  const [smartCityData, setSmartCityData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [zones, setZones] = useState([]);
  
  const [historyData, setHistoryData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  
  // UI States
  const [activeMapLayer, setActiveMapLayer] = useState('aqi'); // none, aqi, traffic, temp
  const [isLoading, setIsLoading] = useState(true);
  const [isStale, setIsStale] = useState(false);
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [landingLogs, setLandingLogs] = useState([]);
  const [activeRoute, setActiveRoute] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const t = translations[language];

  const getCityHealthScore = () => {
    const temp = weatherData ? weatherData.temp : 28;
    const aqi = aqiData ? aqiData.aqi : 120;
    const traffic = trafficData ? trafficData.level : 30;
    const parkingPct = smartCityData?.parking && smartCityData.parking.length > 0
      ? Math.round(smartCityData.parking.reduce((acc, p) => acc + (p.occupiedSpots / p.totalSpots), 0) / smartCityData.parking.length * 100)
      : 60;
    const renewablePct = smartCityData?.energy?.renewablePercentage || 42;

    const climateComfort = Math.max(0, Math.min(100, Math.round(100 - Math.abs(temp - 24) * 3.5)));
    const mobilityScore = Math.max(0, Math.min(100, 100 - traffic));
    const environmentScore = Math.max(0, Math.min(100, Math.round(100 - aqi / 3)));
    const safetyScore = Math.max(0, Math.min(100, Math.round(100 - (trafficData?.activeIncidents || 1) * 12)));
    const sustainabilityScore = Math.round((renewablePct + (100 - parkingPct)) / 2);

    const overall = Math.round((climateComfort + mobilityScore + environmentScore + safetyScore + sustainabilityScore) / 5);

    return {
      overall,
      climateComfort,
      mobilityScore,
      environmentScore,
      safetyScore,
      sustainabilityScore
    };
  };

  const healthScore = getCityHealthScore();

  const getAiCityBrief = () => {
    const weatherCond = weatherData ? weatherData.condition : 'Clear';
    const aqi = aqiData ? aqiData.aqi : 120;
    const traffic = trafficData ? trafficData.level : 30;
    
    let brief = "Traffic is currently moderate. ";
    if (traffic > 70) brief = "Severe traffic congestion reported on arterial channels. Dumas road is saturated. ";
    else if (traffic > 40) brief = "Traffic is sluggish near intersections. ";

    if (weatherCond.toLowerCase().includes('rain')) {
      brief += "Active rainfall expected to continue. Waterlogging risks exist near Katargam underpasses. ";
    } else {
      brief += `Weather is currently ${weatherCond} and comfortable. `;
    }

    if (aqi > 200) {
      brief += "Air quality is highly hazardous. Smog alert active; please restrict outdoor cardio.";
    } else if (aqi > 100) {
      brief += "Particulate density is elevated. Sensitive groups should wear air filters.";
    } else {
      brief += "Air quality index is perfect. Ideal for outdoor jogging and travel.";
    }

    return brief;
  };

  // Fetch all endpoints
  const fetchAllData = useCallback(async () => {
    try {
      setIsStale(false);
      
      const [resWeather, resAqi, resTraffic, resSmartCity, resAlerts, resComplaints, resZones, resHistory, resForecast] = await Promise.all([
        fetch(`/api/weather?city=${selectedCity}`).then(r => r.json()),
        fetch(`/api/aqi?city=${selectedCity}`).then(r => r.json()),
        fetch(`/api/traffic?city=${selectedCity}`).then(r => r.json()),
        fetch(`/api/smartcity?city=${selectedCity}`).then(r => r.json()),
        fetch(`/api/alerts?city=${selectedCity}`).then(r => r.json()),
        fetch(`/api/citizen/complaints?city=${selectedCity}`).then(r => r.json()),
        fetch(`/api/admin/zones?city=${selectedCity}`).then(r => r.json()),
        fetch(`/api/history?city=${selectedCity}`).then(r => r.json()),
        fetch(`/api/forecast?city=${selectedCity}`).then(r => r.json())
      ]);

      setWeatherData(resWeather);
      setAqiData(resAqi);
      setTrafficData(resTraffic);
      setSmartCityData(resSmartCity);
      setAlerts(resAlerts);
      setComplaints(resComplaints);
      setZones(resZones);
      setHistoryData(resHistory);
      setForecastData(resForecast);

      setIsLoading(false);
      setSecondsSinceUpdate(0);
    } catch (err) {
      console.error('Failed to sync digital twin data, falling back to current local cache:', err);
      setIsStale(true);
      setIsLoading(false);
    }
  }, [selectedCity]);

  // Poll intervals
  useEffect(() => {
    fetchAllData();
  }, [updateTrigger, fetchAllData]);

  useEffect(() => {
    // Refresh indices every 20 seconds
    const dataTimer = setInterval(() => {
      setUpdateTrigger(prev => prev + 1);
    }, 20000);

    // Refresh UI seconds-since-update counter every second
    const secondTimer = setInterval(() => {
      setSecondsSinceUpdate(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(dataTimer);
      clearInterval(secondTimer);
    };
  }, []);

  useEffect(() => {
    if (page !== 'landing') return;
    
    // Initial logs seed
    const initial = [
      `[${new Date().toLocaleTimeString()}] ICCC System: Initializing digital twin base interface...`,
      `[${new Date().toLocaleTimeString()}] API Client: Syncing OpenWeatherMap core metrics...`,
      `[${new Date().toLocaleTimeString()}] API Client: Synced PM2.5 and NO2 AQI values`,
      `[${new Date().toLocaleTimeString()}] API Client: Synchronized TomTom transit flow velocities`,
      `[${new Date().toLocaleTimeString()}] Forecast Service: Cyclical linear regressions rebuilt`,
      `[${new Date().toLocaleTimeString()}] Alert Engine: Active restriction audits running...`
    ];
    setLandingLogs(initial);

    const interval = setInterval(() => {
      const phrases = [
        'Checked Ward-4 edge sensor: Status nominal',
        'Refreshed traffic delay averages: Flow rate 85%',
        'Linear Regression forecasting: Temperature peak predicted at 2 PM',
        'Database synced: Fallback JSON logs written successfully',
        'Alert check completed: Cooldown validation clear',
        'Ward-1 sensor report: Particulates density stable',
        'Crowdsourced feedback board updated: 0 unresolved critical tasks'
      ];
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      setLandingLogs(prev => [
        `[${new Date().toLocaleTimeString()}] ${randomPhrase}`,
        ...prev.slice(0, 8)
      ]);
    }, 2800);

    return () => clearInterval(interval);
  }, [page]);

  // Dynamic Theme Styling depending on average AQI & active theme mode
  const getThemeClass = () => {
    if (themeMode === 'light') {
      return 'from-slate-100 via-slate-50 to-zinc-100 text-slate-800';
    }
    if (!aqiData) return 'from-zinc-950 via-zinc-900 to-zinc-950';
    const a = aqiData.aqi;
    if (a > 200) {
      // Hazardous Theme: Red ambient tint
      return 'from-zinc-950 via-red-950/20 to-zinc-950 border-red-500/20';
    } else if (a > 100) {
      // Moderate/Unhealthy Theme: Amber ambient tint
      return 'from-zinc-950 via-amber-950/20 to-zinc-950 border-amber-500/20';
    }
    // Good/Satisfactory Theme: Emerald ambient tint
    return 'from-zinc-950 via-emerald-950/15 to-zinc-950 border-emerald-500/10';
  };

  const getHeaderAlertClass = () => {
    if (!aqiData) return '';
    const a = aqiData.aqi;
    if (a > 200) return 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]';
    if (a > 100) return 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]';
    return 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]';
  };

  // Helper trigger to manually reload
  const handleManualRefresh = () => {
    setIsLoading(true);
    setUpdateTrigger(prev => prev + 1);
  };

  // On-mount: check localStorage for session persistence
  useEffect(() => {
    const savedUser = localStorage.getItem('digital_twin_user');
    if (savedUser) {
      try {
        const { username, role: savedRole, city: savedCity } = JSON.parse(savedUser);
        setRole(savedRole);
        setSelectedCity(savedCity || 'Surat');
        setPage('dashboard');
        setActiveTab('map');
      } catch (e) {
        localStorage.removeItem('digital_twin_user');
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoginLoading(true);
    
    const url = isRegistering ? '/api/auth/register' : '/api/auth/login';
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginForm.username,
          password: loginForm.password,
          email: loginForm.email,
          role: loginForm.role,
          city: loginForm.city
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || (language === 'en' ? 'Server connection issue.' : 'सर्वर कनेक्शन की समस्या।'));
      }

      if (isRegistering) {
        alert(language === 'en' ? 'User successfully registered! You can now log in.' : 'उपयोगकर्ता सफलतापूर्वक पंजीकृत! अब आप लॉगिन कर सकते हैं।');
        setIsRegistering(false);
        setLoginForm({ username: loginForm.username, password: '', email: '', role: 'public', city: 'Surat' });
      } else {
        setRole(data.role);
        setSelectedCity(data.city || 'Surat');
        setPage('dashboard');
        setActiveTab('map');
        localStorage.setItem('digital_twin_user', JSON.stringify({ username: data.username, role: data.role, city: data.city || 'Surat' }));
      }
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setIsLoginLoading(false);
    }
  };

  if (isLoading && !weatherData) {
    return (
      <div className="h-screen w-screen flex flex-col justify-center items-center bg-zinc-950 text-zinc-400 font-sans">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-zinc-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-lg font-medium tracking-wide animate-pulse">{t.loading}</p>
      </div>
    );
  }

  if (page === 'landing') {
    const landingHealth = healthScore.overall;
    const landingBrief = getAiCityBrief();
    const isRainy = (weatherData?.condition || '').toLowerCase().includes('rain');

    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative overflow-x-hidden select-none font-sans">
        {/* Loop video background of smart city traffic night time-lapse */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover opacity-[0.32] pointer-events-none filter saturate-75 contrast-125 brightness-90"
          >
            <source 
              src="https://codecademy-content.s3.amazonaws.com/courses/Semantic+HTML/nyc-skyline-timelapse.mp4" 
              type="video/mp4" 
            />
          </video>
          {/* Futuristic grid mesh overlay */}
          <div className="tech-grid-overlay"></div>
          {/* Vignette gradient layer to protect text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-zinc-950/40 to-zinc-950 z-10"></div>
        </div>



        {/* Header bar on landing */}
        <header className="h-16 shrink-0 bg-zinc-900/60 border-b border-white/10 px-6 flex items-center justify-between z-40 backdrop-blur relative">
          <div className="flex items-center gap-2.5">
            <svg className="w-6 h-6 text-amber-500 shrink-0 filter drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.905 0-5.62-.977-7.843-2.618m15.686 0A9.005 9.005 0 0112 21a9.005 9.005 0 01-7.843-12.218" />
            </svg>
            <span className="text-xs font-black tracking-widest leading-none text-zinc-200 font-mono">DIGITAL TWIN TECHNOLOGY FOR SMART CITIES</span>
          </div>
          <div className="flex items-center gap-3">
            {/* City Selector */}
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="text-zinc-450 animate-pulse" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="text-xs bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-zinc-300 hover:text-white font-extrabold focus:outline-none focus:border-amber-500 transition"
              >
                <option value="Surat">Surat</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="Pune">Pune</option>
              </select>
            </div>

            {/* Theme Mode Toggle */}
            <button
              onClick={() => setThemeMode(m => m === 'light' ? 'dark' : 'light')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-900 border border-white/10 rounded-xl hover:text-white transition font-bold"
              title={themeMode === 'light' ? 'Switch to Dark Theme' : 'Switch to White Theme'}
            >
              {themeMode === 'light' ? <Moon size={13} className="text-indigo-400" /> : <Sun size={13} className="text-amber-400" />}
              <span>{themeMode === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>

            <button 
              onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-900 border border-white/10 rounded-xl hover:text-white transition"
            >
              <Globe size={13} />
              <span>{language === 'en' ? 'Hindi' : 'English'}</span>
            </button>
          </div>
        </header>

        {/* Hero & Workspace grid Section */}
        <main className="flex-1 max-w-6xl mx-auto px-6 py-10 flex flex-col justify-center relative z-10 gap-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Interactive texts, buttons, and stats counter */}
            <div className="lg:col-span-6 text-left flex flex-col gap-6">
              <div className="flex items-center gap-2 bg-zinc-900/80 border border-white/10 py-1.5 px-3 rounded-full w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 font-mono">Operations Feed: Active</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight font-mono">
                {t.landingTitle}
              </h1>
              
              <p className="text-zinc-400 text-xs md:text-sm leading-relaxed max-w-2xl font-medium">
                {t.landingTagline}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full max-w-md">
                <button
                  onClick={() => {
                    setRole('public');
                    setPage('dashboard');
                    setActiveTab('map');
                  }}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-emerald-500/50 text-emerald-400 hover:text-white font-bold py-3.5 px-6 rounded-xl transition text-xs shadow-md flex items-center justify-center gap-2"
                >
                  <Globe size={14} />
                  <span>{t.accessPublic}</span>
                </button>
                <button
                  onClick={() => {
                    setPage('login');
                    setLoginForm({ username: '', password: '' });
                    setLoginError('');
                  }}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-black py-3.5 px-6 rounded-xl transition text-xs shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  <Shield size={14} />
                  <span>{t.accessSupervisor}</span>
                </button>
              </div>

              {/* Administrative Stats Counters */}
              <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6 mt-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block font-mono">Telemetry Logs</span>
                  <span className="text-xl md:text-2xl font-black text-zinc-200 block mt-0.5 font-mono">12,482+</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block font-mono">Active Nodes</span>
                  <span className="text-xl md:text-2xl font-black text-zinc-200 block mt-0.5 font-mono">240 Sensors</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block font-mono">Mesh Uptime</span>
                  <span className="text-xl md:text-2xl font-black text-emerald-400 block mt-0.5 font-mono">99.98%</span>
                </div>
              </div>
            </div>

            {/* Right Column: Quick Status Cards Grid & AI Brief Panel */}
            <div className="lg:col-span-6 flex flex-col gap-5">
              
              {/* Quick Status Cards Grid (7 Indicators) */}
              <div className="glass-card p-5 rounded-2xl border border-white/5 text-left flex flex-col gap-3.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block font-mono">Quick City Status Indicators</span>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 text-slate-100">
                  <div className="bg-slate-900/60 border border-white/5 p-2.5 rounded-xl">
                    <span className="text-[8px] text-slate-500 font-bold block uppercase">Temperature</span>
                    <span className="text-xs font-black text-white font-mono">{weatherData?.temp || 28}°C</span>
                  </div>
                  <div className="bg-slate-900/60 border border-white/5 p-2.5 rounded-xl">
                    <span className="text-[8px] text-slate-500 font-bold block uppercase">Condition</span>
                    <span className="text-xs font-black text-slate-200 truncate block">{weatherData?.condition || 'Clear'}</span>
                  </div>
                  <div className="bg-slate-900/60 border border-white/5 p-2.5 rounded-xl">
                    <span className="text-[8px] text-slate-500 font-bold block uppercase">AQI Index</span>
                    <span className={`text-xs font-black font-mono ${aqiData?.aqi > 150 ? 'text-amber-400' : 'text-emerald-400'}`}>{aqiData?.aqi || 120}</span>
                  </div>
                  <div className="bg-slate-900/60 border border-white/5 p-2.5 rounded-xl">
                    <span className="text-[8px] text-slate-500 font-bold block uppercase">Traffic Level</span>
                    <span className="text-xs font-black text-white font-mono">{trafficData?.level || 30}%</span>
                  </div>
                  <div className="bg-slate-900/60 border border-white/5 p-2.5 rounded-xl">
                    <span className="text-[8px] text-slate-500 font-bold block uppercase">Rain Prob</span>
                    <span className="text-xs font-black text-white font-mono">{weatherData?.rain_probability || 35}%</span>
                  </div>
                  <div className="bg-slate-900/60 border border-white/5 p-2.5 rounded-xl">
                    <span className="text-[8px] text-slate-500 font-bold block uppercase">Flood Risk</span>
                    <span className={`text-xs font-black ${isRainy ? 'text-rose-400 font-black' : 'text-emerald-400'}`}>{isRainy ? 'Medium' : 'Low'}</span>
                  </div>
                  <div className="bg-slate-900/60 border border-white/5 p-2.5 rounded-xl col-span-2 md:col-span-1">
                    <span className="text-[8px] text-slate-500 font-bold block uppercase">Health Score</span>
                    <span className="text-xs font-black text-teal-400 font-mono">{landingHealth}/100</span>
                  </div>
                </div>
              </div>

              {/* AI City Brief Box */}
              <div className="p-4 border rounded-2xl bg-emerald-500/10 border-emerald-500/20 text-left flex items-start gap-3">
                <Cpu className="text-emerald-400 shrink-0 mt-0.5 animate-pulse" size={18} />
                <div className="text-xs">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono block">AI City Brief</span>
                  <p className="mt-1 leading-relaxed text-slate-200 font-semibold">{landingBrief}</p>
                </div>
              </div>

              {/* Data Stream Console Terminal */}
              <div className="glass-card p-5 rounded-2xl border border-white/5 text-left h-[180px] flex flex-col justify-between">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-300 block font-mono">Operational Data Stream</span>
                  <span className="text-[8px] bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono uppercase tracking-widest animate-pulse">Live</span>
                </div>
                
                {/* Monospace scroll logs */}
                <div className="flex-1 overflow-y-auto font-mono text-[9px] text-emerald-450 flex flex-col gap-1 pr-1 py-2.5 scrollbar-none select-text">
                  {landingLogs.length === 0 ? (
                    <span className="text-zinc-600 italic">Interfacing stream...</span>
                  ) : (
                    landingLogs.map((log, idx) => (
                      <div key={`log-${idx}`} className="leading-relaxed truncate">
                        <span className="text-zinc-550 select-none mr-1.5">&gt;</span>
                        {log}
                      </div>
                    ))
                  )}
                </div>
                
                <div className="text-[8px] text-zinc-600 uppercase font-semibold border-t border-white/5 pt-2 flex justify-between select-none font-mono">
                  <span>Stream Desk: ICCC-DESK-04</span>
                  <span>Port: 5000/api</span>
                </div>
              </div>

            </div>
          </div>

          {/* Core Modules Information Board */}
          <div className="w-full text-left mt-8 border-t border-white/10 pt-8">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-zinc-550 mb-6 text-center">{t.featuresTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col gap-2">
                <span className="font-extrabold text-zinc-200 text-xs uppercase tracking-wider block">{t.featureMapTitle}</span>
                <p className="text-zinc-400 text-[11px] leading-relaxed">{t.featureMapDesc}</p>
              </div>
              <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col gap-2">
                <span className="font-extrabold text-zinc-200 text-xs uppercase tracking-wider block">{t.featureMlTitle}</span>
                <p className="text-zinc-400 text-[11px] leading-relaxed">{t.featureMlDesc}</p>
              </div>
              <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col gap-2">
                <span className="font-extrabold text-zinc-200 text-xs uppercase tracking-wider block">{t.featureCitizenTitle}</span>
                <p className="text-zinc-400 text-[11px] leading-relaxed">{t.featureCitizenDesc}</p>
              </div>
            </div>
          </div>
        </main>

        <footer className="h-12 shrink-0 flex items-center justify-center border-t border-white/5 text-[9px] text-zinc-650 font-bold uppercase tracking-wider relative z-10 bg-zinc-950/80 backdrop-blur">
          Surat Smart City Council &copy; 2026 - Operations Command Desk
        </footer>
      </div>
    );
  }

  if (page === 'login') {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center relative overflow-hidden font-sans p-6 select-none">
        {/* Loop video background of smart city traffic night time-lapse */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover opacity-[0.24] pointer-events-none filter saturate-75 contrast-125 brightness-90"
          >
            <source 
              src="https://codecademy-content.s3.amazonaws.com/courses/Semantic+HTML/nyc-skyline-timelapse.mp4" 
              type="video/mp4" 
            />
          </video>
          <div className="tech-grid-overlay"></div>
          <div className="absolute inset-0 bg-zinc-950/60 z-10"></div>
        </div>

        {/* Decorative ambient background rings */}
        <div className="absolute w-[600px] h-[600px] rounded-full border border-white/5 -top-40 -left-40 animate-pulse-slow"></div>

        <div className="w-full max-w-sm glass-card p-6 md:p-8 rounded-2xl relative z-10 border border-white/10 flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <svg className="w-10 h-10 text-amber-500 filter drop-shadow-[0_2px_6px_rgba(245,158,11,0.2)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.905 0-5.62-.977-7.843-2.618m15.686 0A9.005 9.005 0 0112 21a9.005 9.005 0 01-7.843-12.218" />
            </svg>
            <h2 className="text-lg font-black tracking-widest text-zinc-100 uppercase text-center leading-none">
              {isRegistering ? (language === 'en' ? 'Create Account' : 'खाता बनाएं') : t.title}
            </h2>
            <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">
              {isRegistering ? (language === 'en' ? 'Register Credentials' : 'साख पंजीकृत करें') : t.loginHeader}
            </p>
          </div>

          {loginError && (
            <div className="bg-rose-950/40 border border-rose-500/20 text-rose-300 text-xs px-3 py-2 rounded-xl text-center font-bold">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t.loginUser}</label>
              <input
                type="text"
                required
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full text-xs bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-3 text-zinc-200 focus:outline-none focus:border-amber-500 transition placeholder-zinc-600 font-bold"
                placeholder="Enter Username"
              />
            </div>

            {isRegistering && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="w-full text-xs bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-3 text-zinc-200 focus:outline-none focus:border-amber-500 transition placeholder-zinc-600"
                  placeholder="Enter Email Address"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t.loginPass}</label>
              <input
                type="password"
                required
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full text-xs bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-3 text-zinc-200 focus:outline-none focus:border-amber-500 transition placeholder-zinc-600"
                placeholder="Enter Password"
              />
            </div>

             {isRegistering && (
               <div className="flex flex-col gap-3">
                 <div className="flex flex-col gap-1.5">
                   <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Access Tier (Role)</label>
                   <select
                     value={loginForm.role}
                     onChange={(e) => setLoginForm({ ...loginForm, role: e.target.value })}
                     className="w-full text-xs bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-3 text-zinc-200 focus:outline-none focus:border-amber-500 transition font-bold"
                   >
                     <option value="public">Citizen Access</option>
                     <option value="officer">Duty Officer</option>
                     <option value="admin">City Supervisor (Admin)</option>
                   </select>
                 </div>
                 
                 <div className="flex flex-col gap-1.5">
                   <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Home City</label>
                   <select
                     value={loginForm.city}
                     onChange={(e) => setLoginForm({ ...loginForm, city: e.target.value })}
                     className="w-full text-xs bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-3 text-zinc-200 focus:outline-none focus:border-amber-500 transition font-bold"
                   >
                     <option value="Surat">Surat</option>
                     <option value="Mumbai">Mumbai</option>
                     <option value="Delhi">Delhi</option>
                     <option value="Bengaluru">Bengaluru</option>
                     <option value="Ahmedabad">Ahmedabad</option>
                     <option value="Pune">Pune</option>
                   </select>
                 </div>
               </div>
             )}

            <button
              type="submit"
              disabled={isLoginLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-black py-3 rounded-xl transition text-xs shadow-lg shadow-amber-500/10 flex justify-center items-center gap-2"
            >
              {isLoginLoading ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <span>{isRegistering ? (language === 'en' ? 'Register Account' : 'पंजीकरण करें') : t.loginButton}</span>
              )}
            </button>
          </form>

          {/* Toggle Register / Login */}
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setLoginError('');
            }}
            className="text-xs text-amber-500 hover:text-amber-400 font-extrabold transition-all text-center mt-2 underline"
          >
            {isRegistering ? (language === 'en' ? 'Already have an account? Log In' : 'पहले से खाता है? लॉगिन करें') : (language === 'en' ? 'Need a command tier account? Register here' : 'સत्यापन के लिए नया खाता पंजीकृत करें')}
          </button>

          {/* Help & Back buttons */}
          <div className="flex flex-col gap-3 mt-2">
            <button
              onClick={() => setPage('landing')}
              className="text-xs text-zinc-400 hover:text-white transition font-bold"
            >
              &larr; {t.loginBack}
            </button>
            <p className="text-[9px] text-zinc-500 italic text-center mt-2 leading-relaxed bg-white/5 py-2 px-3 rounded-lg border border-white/5">
              {isRegistering ? (language === 'en' ? 'Creating an account stores credentials in MongoDB.' : 'खाता बनाने से क्रेडेंशियल्स मोंगोडीबी में सुरक्षित सहेजे जाते हैं।') : t.loginHelp}
            </p>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className={`h-screen w-screen flex flex-col bg-gradient-to-b ${getThemeClass()} transition-all duration-1000 overflow-hidden relative`}>


      {/* Main Header Bar */}
      <header className="h-16 shrink-0 glass-card px-4 md:px-6 flex items-center justify-between border-b border-white/10 z-40 relative bg-slate-950/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <svg className="w-7 h-7 text-amber-500 shrink-0 filter drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.905 0-5.62-.977-7.843-2.618m15.686 0A9.005 9.005 0 0112 21a9.005 9.005 0 01-7.843-12.218" />
            </svg>
            <div className="flex flex-col select-none text-left">
              <span className="text-[12px] font-black tracking-widest text-slate-100 uppercase leading-none font-mono">
                URBANPULSE
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 mt-0.5 leading-none">
                INTELLIGENT TWIN
              </span>
            </div>
          </div>
        </div>

        {/* Global Controls Grid */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* Stale cache indicator */}
          {isStale && (
            <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-950/40 border border-rose-500/20 px-2 py-1 rounded-full">
              <WifiOff size={12} />
              <span>{t.connectionStale}</span>
            </div>
          )}

          {/* Time tracker */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
            <RefreshCw size={12} className={secondsSinceUpdate < 3 ? 'animate-spin text-teal-400' : ''} />
            <span>{t.lastUpdated.replace('{s}', secondsSinceUpdate)}</span>
          </div>

          {/* City Selector */}
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="text-slate-450 animate-pulse" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="text-xs bg-slate-900/60 hover:bg-slate-800 border border-white/5 rounded-lg text-slate-300 hover:text-white px-2.5 py-1.5 focus:outline-none focus:border-teal-500 font-extrabold transition-all"
            >
              <option value="Surat">Surat</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Pune">Pune</option>
            </select>
          </div>

          {/* Theme Mode Toggle */}
          <button 
            onClick={() => setThemeMode(m => m === 'light' ? 'dark' : 'light')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-slate-900/60 hover:bg-slate-800 border border-white/5 rounded-lg text-slate-300 hover:text-white font-bold transition-all"
            title={themeMode === 'light' ? 'Switch to Dark Theme' : 'Switch to White Theme'}
          >
            {themeMode === 'light' ? <Moon size={13} className="text-indigo-400" /> : <Sun size={13} className="text-amber-400" />}
            <span>{themeMode === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>

          {/* Language Toggle */}
          <button 
            onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-slate-900/60 hover:bg-slate-800 border border-white/5 rounded-lg text-slate-300 hover:text-white font-medium animate-pulse"
          >
            <Globe size={13} />
            <span>{language === 'en' ? 'Hindi' : 'English'}</span>
          </button>

          {/* Role selector */}
          <div className="flex items-center gap-1.5">
            <Shield size={14} className="text-slate-400 hidden sm:inline" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="text-xs bg-slate-900/80 hover:bg-slate-800 border border-white/10 rounded-lg text-slate-200 px-2.5 py-1.5 focus:outline-none focus:border-teal-500 font-medium"
            >
              <option value="admin">{t.roleAdmin}</option>
              <option value="officer">{t.roleOfficer}</option>
              <option value="public">{t.rolePublic}</option>
            </select>
          </div>

          {/* Reload trigger */}
          <button 
            onClick={handleManualRefresh}
            className="p-1.5 hover:bg-white/5 border border-white/5 rounded-lg text-slate-400 hover:text-white transition-all"
            title="Refresh Feed"
          >
            <RefreshCw size={16} />
          </button>

          {/* Exit Portal trigger */}
          <button
            onClick={() => {
              localStorage.removeItem('digital_twin_user');
              setRole('public');
              setPage('landing');
            }}
            className="text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/20 text-rose-300 rounded-xl transition"
          >
            {language === 'en' ? 'Exit Portal' : 'पोर्टल से बाहर'}
          </button>
        </div>
      </header>

      {/* Main Tabbed Viewports with Left Sidebar HUD layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side Navigation Sidebar */}
        <aside className="w-56 bg-slate-950/90 border-r border-white/10 flex flex-col justify-between py-4 select-none shrink-0 pointer-events-auto">
          <div className="flex flex-col gap-1 px-2.5">
            {[
              { id: 'home', label: 'Operations Hub', icon: <Home size={13} /> },
              { id: 'map', label: 'Interactive GIS Map', icon: <Layers size={13} /> },
              { id: 'traffic', label: 'Traffic & Mobility', icon: <Navigation size={13} className="rotate-45" /> },
              { id: 'weather', label: 'Weather Intelligence', icon: <CloudSun size={13} /> },
              { id: 'environment', label: 'Environment & AQI', icon: <Wind size={13} /> },
              { id: 'services', label: 'Infrastructure Services', icon: <Activity size={13} /> },
              { id: 'chatbot', label: 'AI Chat Assistant', icon: <MessageSquare size={13} /> },
              { id: 'simulation', label: 'Simulation Lab', icon: <Cpu size={13} /> },
              { id: 'analytics', label: 'Telemetry Analytics', icon: <BarChart2 size={13} /> },
              { id: 'alerts', label: 'Alert Center', icon: <Bell size={13} /> },
              { id: 'mycity', label: 'My City (Personal)', icon: <ShieldCheck size={13} /> },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-bold text-left transition-all ${
                  activeTab === item.id
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-extrabold shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}

            {/* Command Center link */}
            {(role === 'admin' || role === 'officer') && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-bold text-left transition-all mt-2 ${
                  activeTab === 'admin'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 font-extrabold shadow'
                    : 'text-rose-450 hover:text-rose-300 hover:bg-white/5 border border-transparent'
                }`}
              >
                <Shield size={13} />
                <span>Command Center</span>
              </button>
            )}
          </div>
          
          <div className="px-5 text-[9px] text-slate-600 font-bold uppercase tracking-wider font-mono">
            {selectedCity} Smart Twin v1.2
          </div>
        </aside>

        {/* Viewport content */}
        <main className="flex-1 flex flex-col overflow-y-auto scrollbar-none relative">
          
          {/* Panel 1: Operations Hub */}
          {activeTab === 'home' && (
            <div className="p-4 md:p-6 flex flex-col gap-6 text-slate-100 text-left w-full max-w-7xl mx-auto">
              {/* Row 1: AI Brief Banner */}
              <div className="p-5 border rounded-2xl bg-emerald-500/10 border-emerald-500/25 flex items-start gap-4 shadow-lg">
                <Cpu className="text-emerald-400 shrink-0 animate-pulse" size={24} />
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 font-mono">AI City Operations Brief</span>
                  <h4 className="text-sm font-extrabold text-white mt-0.5">{selectedCity} Telemetry Brief</h4>
                  <p className="text-xs leading-relaxed mt-2 text-slate-350 font-medium">
                    {getAiCityBrief()}
                  </p>
                </div>
              </div>

              {/* Row 2: Diagnostics overview grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-4 rounded-xl border border-white/5">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 block">Overall Health</span>
                  <span className="text-2xl font-black text-emerald-400 mt-1 block font-mono">{healthScore.overall} / 100</span>
                </div>
                <div className="glass-card p-4 rounded-xl border border-white/5">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 block">Climate comfort</span>
                  <span className="text-2xl font-black text-slate-200 mt-1 block font-mono">{healthScore.climateComfort}%</span>
                </div>
                <div className="glass-card p-4 rounded-xl border border-white/5">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 block">Transit mobility</span>
                  <span className="text-2xl font-black text-slate-200 mt-1 block font-mono">{healthScore.mobilityScore}%</span>
                </div>
                <div className="glass-card p-4 rounded-xl border border-white/5">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 block">Eco-sustainability</span>
                  <span className="text-2xl font-black text-slate-200 mt-1 block font-mono">{healthScore.sustainabilityScore}%</span>
                </div>
              </div>

              {/* Section: City Health Breakdowns */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-5 glass-card p-5 rounded-2xl border border-white/5 flex flex-col gap-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Health Score Breakdown</span>
                  <div className="flex flex-col gap-3 font-semibold text-xs text-slate-350">
                    <div className="flex justify-between items-baseline border-b border-white/5 pb-2">
                      <span>Air Quality Environment:</span>
                      <strong className="text-slate-100 font-mono">{healthScore.environmentScore}%</strong>
                    </div>
                    <div className="flex justify-between items-baseline border-b border-white/5 pb-2">
                      <span>Mobility Efficiency:</span>
                      <strong className="text-slate-100 font-mono">{healthScore.mobilityScore}%</strong>
                    </div>
                    <div className="flex justify-between items-baseline border-b border-white/5 pb-2">
                      <span>Climate Comfort Index:</span>
                      <strong className="text-slate-100 font-mono">{healthScore.climateComfort}%</strong>
                    </div>
                    <div className="flex justify-between items-baseline border-b border-white/5 pb-2">
                      <span>Grid safety & reliability:</span>
                      <strong className="text-slate-100 font-mono">{healthScore.safetyScore}%</strong>
                    </div>
                    <div className="flex justify-between items-baseline border-b border-white/5 pb-2">
                      <span>Eco Sustainability share:</span>
                      <strong className="text-slate-100 font-mono">{healthScore.sustainabilityScore}%</strong>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 glass-card p-5 rounded-2xl border border-white/5 text-left flex flex-col gap-3.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Health recommendations</span>
                  <div className="flex flex-col gap-2">
                    <div className="p-3.5 bg-white/5 rounded-xl border border-white/5 flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center font-bold text-emerald-400 shrink-0 text-[10px]">1</div>
                      <p className="text-xs leading-relaxed text-slate-300">
                        Maximize **renewable power share** during morning solar peak hours to increase ecological sustainability metrics.
                      </p>
                    </div>
                    <div className="p-3.5 bg-white/5 rounded-xl border border-white/5 flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center font-bold text-emerald-400 shrink-0 text-[10px]">2</div>
                      <p className="text-xs leading-relaxed text-slate-300">
                        Deploy active traffic signal adjustments along Dumas Road intersections to alleviate the current **mobility congestion index**.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Panel 2: Interactive GIS Map */}
          {activeTab === 'map' && (
            <section className="flex-1 relative h-full w-full min-h-[500px]">
              <MapDashboard 
                weatherData={weatherData}
                aqiData={aqiData}
                trafficData={trafficData}
                complaints={complaints}
                zones={zones}
                activeMapLayer={activeMapLayer}
                setActiveMapLayer={setActiveMapLayer}
                role={role}
                lang={language}
                onComplaintAdded={fetchAllData}
                onZoneAdded={fetchAllData}
                onZoneDeleted={fetchAllData}
                activeRoute={activeRoute}
                setActiveRoute={setActiveRoute}
                userLocation={userLocation}
                setUserLocation={setUserLocation}
                city={selectedCity}
                themeMode={themeMode}
              />

              {/* Floating Map Layer Selector overlay */}
              <div className="absolute top-4 right-4 z-[1000] bg-slate-950/90 backdrop-blur-xl p-3.5 rounded-2xl max-w-[210px] border border-teal-500/30 shadow-[0_15px_35px_rgba(0,0,0,0.5)] pointer-events-auto transition-all hover:border-teal-500/50">
                <div className="flex items-center gap-1.5 mb-2 border-b border-white/10 pb-1.5">
                  <Layers size={13} className="text-teal-400 animate-pulse" />
                  <span className="text-[11px] font-extrabold text-slate-200 tracking-wide font-mono">Active Map Layer</span>
                </div>
                <div className="flex flex-col gap-1">
                  {[
                    { id: 'none', label: t.layerNone },
                    { id: 'aqi', label: t.layerAqi },
                    { id: 'traffic', label: t.layerTraffic },
                    { id: 'temp', label: t.layerTemp }
                  ].map(lyr => (
                    <button
                      key={lyr.id}
                      onClick={() => setActiveMapLayer(lyr.id)}
                      className={`text-left text-xs px-2.5 py-1.5 rounded-xl transition-all ${
                        activeMapLayer === lyr.id 
                          ? 'bg-teal-500/25 border border-teal-500/40 text-teal-300 font-bold shadow-sm' 
                          : 'hover:bg-white/5 text-slate-400 border border-transparent'
                      }`}
                    >
                      {lyr.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Panel 3: Traffic & Route Planner */}
          {activeTab === 'traffic' && (
            <div className="p-4 md:p-6 w-full max-w-5xl mx-auto flex flex-col justify-center">
              <CitizenView 
                weatherData={weatherData}
                aqiData={aqiData}
                trafficData={trafficData}
                smartCityData={smartCityData}
                historyData={historyData}
                forecastData={forecastData}
                complaints={complaints}
                lang={language}
                onComplaintAdded={fetchAllData}
                activeRoute={activeRoute}
                setActiveRoute={setActiveRoute}
                setActiveTab={setActiveTab}
                userLocation={userLocation}
                setUserLocation={setUserLocation}
                zones={zones}
              />
            </div>
          )}

          {/* Panel 4: Weather Intelligence */}
          {activeTab === 'weather' && weatherData && (
            <div className="p-4 md:p-6 flex flex-col gap-6 text-slate-100 text-left w-full max-w-5xl mx-auto">
              <div className="border-b border-white/5 pb-4">
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <CloudSun className="text-amber-400 animate-pulse" size={22} />
                  <span>Weather Intelligence Center</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Real-time local atmosphere diagnostics, 12-hour forecasts, and travel safety alerts.</p>
              </div>

              {/* Weather Stats grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-950/40 border border-white/5 p-4 rounded-xl">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Atmosphere status</span>
                  <span className="text-xl font-black text-slate-200 mt-1 block font-mono">{weatherData.condition}</span>
                </div>
                <div className="bg-slate-950/40 border border-white/5 p-4 rounded-xl">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Temperature Reading</span>
                  <span className="text-xl font-black text-slate-200 mt-1 block font-mono">{weatherData.temp}°C</span>
                </div>
                <div className="bg-slate-950/40 border border-white/5 p-4 rounded-xl">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Relative Humidity</span>
                  <span className="text-xl font-black text-slate-200 mt-1 block font-mono">{weatherData.humidity}%</span>
                </div>
                <div className="bg-slate-950/40 border border-white/5 p-4 rounded-xl">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Anemometer wind</span>
                  <span className="text-xl font-black text-slate-200 mt-1 block font-mono">{weatherData.wind_speed} m/s</span>
                </div>
              </div>

              {/* Weather-to-Real-Life Impact Analysis */}
              <div className="p-5 border rounded-2xl bg-amber-500/10 border-amber-500/25 flex items-start gap-4 shadow-lg text-left">
                <AlertTriangle className="text-amber-400 shrink-0" size={24} />
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-450 font-mono">Weather Impact analysis</span>
                  <h4 className="text-sm font-extrabold text-white mt-0.5">Physical grid consequences</h4>
                  <ul className="text-xs leading-relaxed mt-3 text-slate-350 list-disc pl-4 flex flex-col gap-1.5 font-medium">
                    <li>
                      <strong>Traffic Congestion Risk:</strong> High due to potential precipitation. Slower arterial velocities expected on Ring Road.
                    </li>
                    <li>
                      <strong>Drainage Load Risk:</strong> Medium. Minor localized water pooling on Katargam subways if rainfall threshold exceeds 10mm.
                    </li>
                    <li>
                      <strong>Air Filtration:</strong> Perfect. High atmospheric dispersion index reducing suspended particulate density.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Panel 5: Environment & AQI */}
          {activeTab === 'environment' && aqiData && (
            <div className="p-4 md:p-6 flex flex-col gap-6 text-slate-100 text-left w-full max-w-5xl mx-auto">
              <div className="border-b border-white/5 pb-4">
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Wind className="text-teal-400 animate-pulse" size={22} />
                  <span>Atmospheric Environment & AQI Monitor</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Surat particulate density, gas concentrations, and safety indices.</p>
              </div>

              {/* AQI overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col gap-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Particulate breakdown</span>
                  <div className="flex flex-col gap-2.5 text-xs text-slate-350 font-semibold">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span>Air Quality index:</span>
                      <strong className="text-white font-mono">{aqiData.aqi} AQI ({aqiData.status})</strong>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span>PM2.5 (Fine dust):</span>
                      <strong className="text-white font-mono">{aqiData.pm25} µg/m³</strong>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span>PM10 (Coarse dust):</span>
                      <strong className="text-white font-mono">{aqiData.pm10} µg/m³</strong>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span>Carbon Monoxide (CO):</span>
                      <strong className="text-white font-mono">{aqiData.co} ppm</strong>
                    </div>
                  </div>
                </div>

                {/* Best time to go outside */}
                <div className="p-5 border rounded-2xl bg-teal-500/10 border-teal-500/25 flex flex-col justify-between shadow-lg text-left">
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-450 font-mono block mb-1">Recommended schedule</span>
                    <h4 className="text-base font-extrabold text-white">Best time for outdoor activities</h4>
                    <p className="text-xs leading-relaxed text-slate-300 mt-2 font-medium">
                      The recommended window today is **6:30 AM – 8:30 AM**. AQI is at baseline diurnal levels (approx. 45 AQI), traffic velocities are freeflow, and temperatures are comfortable.
                    </p>
                  </div>
                  <div className="text-[10px] text-teal-400 font-bold uppercase tracking-wider border-t border-teal-500/20 pt-3 mt-4">
                    Environment rating: Satisfactory
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Panel 6: Infrastructure & City Services */}
          {activeTab === 'services' && (
            <CityServices smartCityData={smartCityData} trafficData={trafficData} lang={language} />
          )}

          {/* Panel 7: AI Chat Assistant */}
          {activeTab === 'chatbot' && (
            <div className="p-4 md:p-6 flex-1 flex flex-col justify-center">
              <AiAssistant 
                weatherData={weatherData}
                aqiData={aqiData}
                trafficData={trafficData}
                smartCityData={smartCityData}
                complaints={complaints}
                zones={zones}
                lang={language}
                userLocation={userLocation}
              />
            </div>
          )}

          {/* Panel 8: What-If Simulation Lab */}
          {activeTab === 'simulation' && (
            <SimLab lang={language} />
          )}

          {/* Panel 9: Telemetry Historical Analytics */}
          {activeTab === 'analytics' && (
            <AnalyticsPanel 
              weatherData={weatherData}
              aqiData={aqiData}
              trafficData={trafficData}
              historyData={historyData}
              forecastData={forecastData}
              lang={language}
            />
          )}

          {/* Panel 10: Alert Center */}
          {activeTab === 'alerts' && (
            <AlertCenter alerts={alerts} lang={language} />
          )}

          {/* Panel 11: Personalized My City Brief */}
          {activeTab === 'mycity' && (
            <PersonalBrief 
              weatherData={weatherData}
              aqiData={aqiData}
              trafficData={trafficData}
              lang={language}
              userLocation={userLocation}
              setUserLocation={setUserLocation}
            />
          )}

          {/* Panel 12: Admin Command Center (Supervisor panel) */}
          {activeTab === 'admin' && (role === 'admin' || role === 'officer') && (
            <AdminPanel 
              role={role}
              weatherData={weatherData}
              aqiData={aqiData}
              trafficData={trafficData}
              smartCityData={smartCityData}
              historyData={historyData}
              forecastData={forecastData}
              alerts={alerts}
              zones={zones}
              lang={language}
              onZoneDeleted={fetchAllData}
            />
          )}

        </main>
      </div>
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import { ShieldCheck, MapPin, Eye, Compass, Save, CheckCircle, Navigation, Play } from 'lucide-react';

export default function PersonalBrief({
  weatherData,
  aqiData,
  trafficData,
  lang,
  userLocation,
  setUserLocation
}) {
  const [savedLocs, setSavedLocs] = useState(() => {
    const saved = localStorage.getItem('twin_saved_locations');
    return saved ? JSON.parse(saved) : {
      home: 'Adajan, Surat',
      college: 'Dumas Road, Surat',
      office: 'Varachha Sector, Surat',
      customName: 'Gym',
      customVal: 'Piplod Area, Surat'
    };
  });

  const [alertPref, setAlertPref] = useState({
    weather: true,
    aqi: true,
    traffic: true,
    flood: true
  });

  const [travelPref, setTravelPref] = useState('balanced'); // fastest, cleanest, safest, balanced
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('twin_saved_locations', JSON.stringify(savedLocs));
    setSuccessMsg(lang === 'en' ? 'Profile preferences saved successfully!' : 'प्रोफ़ाइल प्राथमिकताएं सफलतापूर्वक सहेजी गईं!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handlePinCurrentLocation = (field) => {
    if (!('geolocation' in navigator)) {
      alert("Geolocation is not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coordsStr = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        setSavedLocs(prev => ({ ...prev, [field]: coordsStr }));
        if (setUserLocation) setUserLocation([latitude, longitude]);
      },
      (err) => alert("Could not fetch GPS location."),
      { enableHighAccuracy: true }
    );
  };

  // Compile Dynamic Daily Smart Brief
  const getBriefData = () => {
    const temp = weatherData ? weatherData.temp : 29;
    const a = aqiData ? aqiData.aqi : 120;
    const weatherCond = weatherData ? weatherData.condition : 'Clear';
    const isRain = weatherCond.toLowerCase().includes('rain') || weatherCond.toLowerCase().includes('drizzle');
    const baseTrafficDelay = trafficData ? trafficData.level : 30;

    let commuteTime = 25;
    if (baseTrafficDelay > 70) commuteTime = 48;
    else if (baseTrafficDelay > 40) commuteTime = 34;

    let airQualityStatus = 'Good';
    if (a > 200) airQualityStatus = 'Severe Smog alert';
    else if (a > 100) airQualityStatus = 'Moderate Pollution';

    let advice = "Travel times are nominal. Commute looks safe.";
    if (isRain) advice = "Rain expected by evening. Leave for home before 5:00 PM to avoid waterlogging on Dumas Road.";
    else if (baseTrafficDelay > 65) advice = "Severe traffic congestion on Ring Road. We advise using the Green Corridor via Gaurav Path.";

    return { temp, a, weatherCond, commuteTime, airQualityStatus, advice };
  };

  const brief = getBriefData();

  return (
    <div className="flex flex-col gap-6 text-slate-100 p-4 md:p-6 w-full max-w-5xl mx-auto text-left">
      <div>
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Compass className="text-indigo-400" size={22} />
          <span>{lang === 'en' ? 'My City – Personalized Dashboard' : 'माई सिटी - व्यक्तिगत डैशबोर्ड'}</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {lang === 'en'
            ? 'Set alert rules, pin saved commutes, and read your automated AI daily brief.'
            : 'सतर्कता नियम निर्धारित करें, आवागमन स्थानों को सहेजें और स्वचालित दैनिक स्मार्ट ब्रीफ पढ़ें।'}
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs px-4 py-2.5 rounded-xl font-bold font-mono text-center flex items-center justify-center gap-2">
          <CheckCircle size={14} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Daily Smart Brief Card */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-5 border rounded-2xl bg-indigo-500/10 border-indigo-500/25 flex flex-col gap-4 shadow-lg">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-indigo-400" size={20} />
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-200">{lang === 'en' ? 'Daily Smart Brief' : 'दैनिक स्मार्ट ब्रीफ'}</span>
            </div>
            
            <div className="flex flex-col gap-3 font-medium text-slate-200 text-xs leading-relaxed border-t border-indigo-500/20 pt-3">
              <div className="flex justify-between border-b border-indigo-500/10 pb-2">
                <span>Weather Condition:</span>
                <span className="font-extrabold text-white">{brief.temp}°C, {brief.weatherCond}</span>
              </div>
              <div className="flex justify-between border-b border-indigo-500/10 pb-2">
                <span>Air Quality (AQI):</span>
                <span className="font-extrabold text-white">{brief.a} ({brief.airQualityStatus})</span>
              </div>
              <div className="flex justify-between border-b border-indigo-500/10 pb-2">
                <span>Home to College:</span>
                <span className="font-extrabold text-white">{brief.commuteTime} mins</span>
              </div>
            </div>

            <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 text-[11px] leading-relaxed text-slate-300 mt-2 font-mono">
              <p className="font-bold text-indigo-400 mb-1">AI Recommendation:</p>
              {brief.advice}
            </div>
          </div>

          {/* Preferences configuration */}
          <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col gap-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Travel & Routing Preference</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'fastest', label: 'Fastest' },
                { id: 'cleanest', label: 'Cleanest Air' },
                { id: 'safest', label: 'Weather-Safe' },
                { id: 'balanced', label: 'Balanced' }
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setTravelPref(p.id)}
                  className={`py-2 px-3 rounded-xl border text-[11px] font-bold text-center transition-all ${
                    travelPref === p.id 
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow'
                      : 'bg-slate-900 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Saved Locations Inputs */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <form onSubmit={handleSave} className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col gap-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">My Favorite Locations</span>
            
            {/* Input 1: Home */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Home Address or Coordinates</label>
              <div className="relative">
                <input
                  type="text"
                  value={savedLocs.home}
                  onChange={(e) => setSavedLocs({ ...savedLocs, home: e.target.value })}
                  placeholder="e.g. Adajan, Surat"
                  className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl pl-3 pr-10 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600 font-mono"
                />
                <button
                  type="button"
                  onClick={() => handlePinCurrentLocation('home')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/5 text-slate-450 hover:text-indigo-400 rounded-lg transition"
                  title="Pin Current GPS"
                >
                  <Navigation size={13} className="rotate-45" />
                </button>
              </div>
            </div>

            {/* Input 2: College */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">College Address or Coordinates</label>
              <div className="relative">
                <input
                  type="text"
                  value={savedLocs.college}
                  onChange={(e) => setSavedLocs({ ...savedLocs, college: e.target.value })}
                  placeholder="e.g. Dumas Road, Surat"
                  className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl pl-3 pr-10 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600 font-mono"
                />
                <button
                  type="button"
                  onClick={() => handlePinCurrentLocation('college')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/5 text-slate-450 hover:text-indigo-400 rounded-lg transition"
                  title="Pin Current GPS"
                >
                  <Navigation size={13} className="rotate-45" />
                </button>
              </div>
            </div>

            {/* Input 3: Office */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Office Address or Coordinates</label>
              <div className="relative">
                <input
                  type="text"
                  value={savedLocs.office}
                  onChange={(e) => setSavedLocs({ ...savedLocs, office: e.target.value })}
                  placeholder="e.g. Varachha, Surat"
                  className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl pl-3 pr-10 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600 font-mono"
                />
                <button
                  type="button"
                  onClick={() => handlePinCurrentLocation('office')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/5 text-slate-450 hover:text-indigo-400 rounded-lg transition"
                  title="Pin Current GPS"
                >
                  <Navigation size={13} className="rotate-45" />
                </button>
              </div>
            </div>

            {/* Alert Preferences */}
            <div className="border-t border-white/5 pt-4 flex flex-col gap-3 mt-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Personalized Alert Preferences</span>
              <div className="grid grid-cols-2 gap-4">
                {Object.keys(alertPref).map((key) => (
                  <label key={key} className="flex items-center gap-2.5 text-xs text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertPref[key]}
                      onChange={(e) => setAlertPref({ ...alertPref, [key]: e.target.checked })}
                      className="rounded border-white/10 bg-slate-900 text-indigo-500 focus:ring-0 w-4 h-4"
                    />
                    <span className="capitalize">{key} Alerts</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 w-full bg-slate-900 hover:bg-slate-800 border border-white/10 hover:border-indigo-500/40 text-indigo-400 hover:text-white font-extrabold py-3 rounded-xl text-xs transition flex justify-center items-center gap-2 shadow"
            >
              <Save size={13} />
              <span>{lang === 'en' ? 'Save Dashboard Settings' : 'सेटिंग्स सहेजें'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

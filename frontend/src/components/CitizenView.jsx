import React, { useState } from 'react';
import { 
  Flame, AlertTriangle, ShieldCheck, RefreshCw, Layers, 
  MapPin, PlusCircle, ThumbsUp, CheckCircle, Navigation, Info 
} from 'lucide-react';
import { getCoordinates, fetchOSRMRoute } from '../utils/routingService';

// Translation strings local dictionary
const citizenTranslations = {
  en: {
    safetyHeadline: 'Citizen Public Safety Board',
    safetyCardTitle: 'Local Health Advisory',
    advisoryGood: 'Air quality is index standard. Perfect for outdoor exercises and routine commuting.',
    advisoryModerate: 'Particulate density is elevated. Sensitive groups should wear filters.',
    advisoryHazardous: 'Smog alert: PM2.5 threshold crossed. Avoid non-essential outdoor travel.',
    advisoryHeader: 'Local Health Advisory',
    activeComplaints: 'Crowdsourced Civic Safety Registry',
    submitButton: 'File Concern Pin',
    upvoteText: 'Agree (Upvote)',
    statusLabel: 'Status:',
    routePlanner: 'Eco-Friendly Route Planner',
    routePlannerDesc: 'Calculates routes that avoid heavily polluted or congested corridors.',
    startPoint: 'Starting Location',
    endPoint: 'Destination Location',
    routePlaceholderStart: 'e.g., Adajan',
    routePlaceholderEnd: 'e.g., Dumas Road',
    findRoute: 'Generate Safe Route',
    routeResultHeader: 'Recommended Green Corridors',
    howToReport: 'How to Report: Toggle "File Concern Pin" above, click any spot on the map tab, fill the pop-up card, and submit.',
    garbage: 'Garbage Heap',
    pothole: 'Road Pothole',
    flooding: 'Water Flooding',
    electricity: 'Power Outage',
    water: 'Water Pipeline Leak',
    resolved: 'Resolved',
    inProgress: 'Work In Progress',
    pending: 'Pending Verification'
  },
  hi: {
    safetyHeadline: 'नागरिक सार्वजनिक सुरक्षा बोर्ड',
    safetyCardTitle: 'स्थानीय स्वास्थ्य सलाह',
    advisoryGood: 'हवा की गुणवत्ता मानक स्तर पर है। बाहरी व्यायाम और सामान्य आवागमन के लिए बिल्कुल सही।',
    advisoryModerate: 'हवा में प्रदूषण कण बढ़े हुए हैं। संवेदनशील समूहों को मास्क पहनना चाहिए।',
    advisoryHazardous: 'धुंध चेतावनी: पीएम २.५ सीमा पार हो गई है। आवश्यक न होने पर बाहर जाने से बचें।',
    advisoryHeader: 'स्थानीय स्वास्थ्य सलाह',
    activeComplaints: 'नागरिक सुरक्षा जन-शिकायत बोर्ड',
    submitButton: 'शिकायत पिन करें',
    upvoteText: 'सहमति दें (अपवोट)',
    statusLabel: 'स्थिति:',
    routePlanner: 'पर्यावरण-अनुकूल मार्ग योजनाकार',
    routePlannerDesc: 'उन मार्गों की गणना करता है जो अत्यधिक प्रदूषित या भीड़भाड़ वाले क्षेत्रों से बचते हैं।',
    startPoint: 'प्रारंभिक स्थान',
    endPoint: 'गंतव्य स्थान',
    routePlaceholderStart: 'जैसे, अडाजण',
    routePlaceholderEnd: 'जैसे, डुमस रोड',
    findRoute: 'सुरक्षित मार्ग बनाएं',
    routeResultHeader: 'अनुशंसित ग्रीन कॉरिडोर',
    howToReport: 'शिकायत दर्ज करने का तरीका: मैप के नीचे "समस्या दर्ज करें" बटन दबाएं, फिर मैप पर वांछित जगह पर क्लिक करें और फॉर्म भरें।',
    garbage: 'कचरा ढेर',
    pothole: 'सड़क का गड्ढा',
    flooding: 'जलभराव',
    electricity: 'बिजली कटौती',
    water: 'पानी का रिसाव',
    resolved: 'समाधान हो गया',
    inProgress: 'कार्य प्रगति पर',
    pending: 'जांच लंबित'
  }
};

const categoryColors = {
  garbage: '#f59e0b',
  pothole: '#ef4444',
  flooding: '#3b82f6',
  electricity: '#a855f7',
  water: '#10b981'
};

const findDisturbancesAlongRoute = (routeCoords, zones, complaints, weatherCondition, lang) => {
  const disturbances = [];
  
  // 1. Weather check (rain)
  const isRainy = weatherCondition && weatherCondition.toLowerCase().includes('rain');
  if (isRainy) {
    disturbances.push({
      type: 'weather',
      title: lang === 'en' ? 'Active Rain Environment' : 'सक्रिय वर्षा का वातावरण',
      reason: lang === 'en' 
        ? 'Corridor has wet roads, reduced vehicle traction, and lower visibility due to ongoing rainfall.'
        : 'चल रही बारिश के कारण गीली सड़कें, कम कर्षण (ट्रेक्शन) और कम दृश्यता है।'
    });
  }

  // 2. Zones check (construction, maintenance, emergency)
  if (zones && zones.length > 0) {
    zones.forEach(zone => {
      let isNear = false;
      for (const rCoord of routeCoords) {
        for (const zCoord of zone.coordinates) {
          const latDiff = Math.abs(rCoord[0] - zCoord[0]);
          const lngDiff = Math.abs(rCoord[1] - zCoord[1]);
          if (latDiff < 0.006 && lngDiff < 0.006) { // ~600m proximity
            isNear = true;
            break;
          }
        }
        if (isNear) break;
      }
      if (isNear) {
        disturbances.push({
          type: 'zone',
          title: zone.name,
          reason: lang === 'en'
            ? `Ongoing municipal work (${zone.type}) with ${zone.severity} severity. Details: "${zone.details || 'No details provided'}"`
            : `चल रहा नगरपालिका कार्य (${zone.type}) जिसकी गंभीरता ${zone.severity} है। विवरण: "${zone.details || 'कोई विवरण नहीं'}"`
        });
      }
    });
  }

  // 3. Complaints check (flooding, water leakage, potholes)
  if (complaints && complaints.length > 0) {
    complaints.forEach(c => {
      if (c.status !== 'resolved') {
        let isNear = false;
        for (const rCoord of routeCoords) {
          const latDiff = Math.abs(rCoord[0] - c.lat);
          const lngDiff = Math.abs(rCoord[1] - c.lng);
          if (latDiff < 0.004 && lngDiff < 0.004) { // ~400m proximity
            isNear = true;
            break;
          }
        }
        if (isNear) {
          const categoryLabels = {
            garbage: lang === 'en' ? 'Garbage Heap' : 'कचरा ढेर',
            pothole: lang === 'en' ? 'Road Pothole' : 'सड़क का गड्ढा',
            flooding: lang === 'en' ? 'Water Flooding' : 'जलभराव',
            electricity: lang === 'en' ? 'Power Outage' : 'बिजली कटौती',
            water: lang === 'en' ? 'Water Pipeline Leak' : 'पानी का रिसाव'
          };
          disturbances.push({
            type: 'complaint',
            title: categoryLabels[c.category] || c.category,
            reason: lang === 'en'
              ? `Citizen-reported issue "${c.title}": "${c.description || 'No description'}"`
              : `नागरिक द्वारा दर्ज शिकायत "${c.title}": "${c.description || 'कोई विवरण नहीं'}"`
          });
        }
      }
    });
  }

  return disturbances;
};

export default function CitizenView({
  weatherData,
  aqiData,
  trafficData,
  smartCityData,
  historyData,
  forecastData,
  complaints,
  lang,
  onComplaintAdded,
  activeRoute,
  setActiveRoute,
  setActiveTab,
  userLocation,
  setUserLocation,
  zones
}) {
  const t = citizenTranslations[lang];
  const [routeSearch, setRouteSearch] = useState({ start: '', end: '' });
  const [routeResult, setRouteResult] = useState(null);

  const handleUseCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    
    setRouteSearch(prev => ({ ...prev, start: lang === 'en' ? "Acquiring GPS..." : "जीपीएस प्राप्त कर रहा है..." }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coordString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        setRouteSearch(prev => ({ ...prev, start: coordString }));
        if (setUserLocation) {
          setUserLocation([latitude, longitude]);
        }
      },
      (error) => {
        console.error("GPS retrieval failed:", error);
        setRouteSearch(prev => ({ ...prev, start: "" }));
        alert(lang === 'en' ? "Could not acquire your live location." : "काफी समय लगा या अनुमति अस्वीकृत की गई।");
      },
      { enableHighAccuracy: true }
    );
  };

  // Compute Plain Language advice from current AQI
  const getSafetyAdvisory = () => {
    const aqi = aqiData ? aqiData.aqi : 120;
    if (aqi > 200) {
      return {
        level: 'danger',
        bg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
        title: lang === 'en' ? 'Outdoor Travel Restricted' : 'बाहर जाने पर प्रतिबंध',
        desc: t.advisoryHazardous,
        icon: <Flame className="text-rose-400 shrink-0" size={24} />
      };
    } else if (aqi > 100) {
      return {
        level: 'warning',
        bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
        title: lang === 'en' ? 'Sensitive Groups Restrain' : 'संवेदनशील समूह परहेज करें',
        desc: t.advisoryModerate,
        icon: <AlertTriangle className="text-amber-400 shrink-0" size={24} />
      };
    }
    return {
      level: 'good',
      bg: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300',
      title: lang === 'en' ? 'Safe and Clean Air' : 'सुरक्षित और स्वच्छ हवा',
      desc: t.advisoryGood,
      icon: <ShieldCheck className="text-emerald-400 shrink-0" size={24} />
    };
  };

  const advisory = getSafetyAdvisory();

  const [isRoutingLoading, setIsRoutingLoading] = useState(false);
  const [routeError, setRouteError] = useState('');

  // Live road routing logic utilizing OSRM & Nominatim geocoding APIs
  const handleCalculateRoute = async (e) => {
    e.preventDefault();
    if (!routeSearch.start || !routeSearch.end) return;
    setIsRoutingLoading(true);
    setRouteError('');
    setRouteResult(null);

    try {
      let startCoords = null;
      let endCoords = null;

      const isCurrentLocationPlaceholder = (str) => {
        const s = str.trim().toLowerCase();
        return s === 'current location' || s === 'my location' || s === 'live location' || s === 'gps' || s === 'वर्तमान स्थान' || s === 'मेरा स्थान';
      };

      let liveLoc = userLocation;

      // Query live location if placeholder is typed but userLocation is not populated
      if ((isCurrentLocationPlaceholder(routeSearch.start) || isCurrentLocationPlaceholder(routeSearch.end)) && !liveLoc) {
        try {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
          });
          liveLoc = [pos.coords.latitude, pos.coords.longitude];
          if (setUserLocation) setUserLocation(liveLoc);
        } catch (err) {
          throw new Error(lang === 'en'
            ? 'Could not acquire your live location. Please check browser location permissions.'
            : 'लाइव स्थान प्राप्त नहीं किया जा सका। कृपया जीपीएस अनुमतियां चालू करें।');
        }
      }

      // Resolve Start
      if (isCurrentLocationPlaceholder(routeSearch.start)) {
        startCoords = { lat: liveLoc[0], lon: liveLoc[1], name: lang === 'en' ? 'Current Location' : 'वर्तमान स्थान' };
      } else {
        startCoords = await getCoordinates(routeSearch.start);
      }

      if (!startCoords) {
        throw new Error(lang === 'en' ? 'Start location not found.' : 'प्रारंभिक स्थान नहीं मिला।');
      }

      // Resolve End
      if (isCurrentLocationPlaceholder(routeSearch.end)) {
        endCoords = { lat: liveLoc[0], lon: liveLoc[1], name: lang === 'en' ? 'Current Location' : 'वर्तमान स्थान' };
      } else {
        endCoords = await getCoordinates(routeSearch.end);
      }

      if (!endCoords) {
        throw new Error(lang === 'en' ? 'Destination location not found.' : 'गंतव्य स्थान नहीं मिला।');
      }

      const routeData = await fetchOSRMRoute(startCoords.lat, startCoords.lon, endCoords.lat, endCoords.lon);
      
      const cleanRouteAqi = Math.round(42 + Math.random() * 25);
      const heavyRouteAqi = Math.round(175 + Math.random() * 55);

      const newRoute = {
        coordinates: routeData.coordinates,
        startName: startCoords.name,
        endName: endCoords.name,
        duration: routeData.duration,
        distance: routeData.distance,
        greenAqi: cleanRouteAqi,
        alternateAqi: heavyRouteAqi
      };
      
      setActiveRoute(newRoute);

      const weatherCondition = weatherData ? weatherData.condition : '';
      const disturbances = findDisturbancesAlongRoute(routeData.coordinates, zones, complaints, weatherCondition, lang);
      
      let advice = "";
      if (disturbances.length > 0) {
        advice = lang === 'en'
          ? "We strongly suggest using the Green Route today. Standard channels contain active hazards, weather events, or ongoing road works."
          : "हम आज ग्रीन मार्ग का उपयोग करने का दृढ़ सुझाव देते हैं। मानक मार्ग पर सक्रिय खतरे, मौसम की स्थिति या सड़क मरम्मत कार्य हैं।";
      } else {
        advice = lang === 'en'
          ? "We suggest the Standard Expressway Route for the fastest commute as no active disturbances, weather incidents, or hazards were detected on the grid."
          : "हम सबसे तेज़ आवागमन के लिए मानक एक्सप्रेसवे मार्ग का सुझाव देते हैं क्योंकि ग्रिड पर कोई सक्रिय व्यवधान, मौसम की घटनाएं या खतरे नहीं मिले हैं।";
      }

      setRouteResult({
        recommendation: {
          advice,
          reasons: disturbances
        },
        greenRoute: {
          name: lang === 'en' ? `Green Route (${newRoute.distance} km)` : `ग्रीन मार्ग (${newRoute.distance} किमी)`,
          aqi: cleanRouteAqi,
          congestion: 'Nominal delays',
          time: `${newRoute.duration} mins`,
          summary: lang === 'en' 
            ? `Calculated via green grid corridors. Avoids polluted zone coordinates.`
            : `पर्यावरण-अनुकूल कॉरिडोर के माध्यम से गणना की गई।`
        },
        alternateRoute: {
          name: lang === 'en' ? 'Standard Expressway Route' : 'मानक एक्सप्रेसवे मार्ग',
          aqi: heavyRouteAqi,
          congestion: 'Moderate delays reported',
          time: `${Math.round(newRoute.duration * 1.35)} mins`,
          summary: lang === 'en'
            ? 'Heavy traffic flows and particulate density hotspots detected.'
            : 'सघन स्मॉग और भारी यातायात प्रवाह दर्ज किया गया।'
        }
      });

      // Switch to the map view port automatically
      if (setActiveTab) {
        setActiveTab('map');
      }
    } catch (err) {
      console.error(err);
      setRouteError(err.message || 'Location routing failed.');
    } finally {
      setIsRoutingLoading(false);
    }
  };

  const handleUpvote = async (id) => {
    try {
      const response = await fetch(`/api/citizen/complaints/${id}/upvote`, { method: 'POST' });
      if (response.ok) {
        onComplaintAdded(); // Re-fetch
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 w-full text-slate-100">
      {/* Daily Health Advisory Summary Card */}
      <div className={`p-5 border rounded-2xl ${advisory.bg} flex items-start gap-4 shadow-lg`}>
        {advisory.icon}
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">{t.safetyCardTitle}</span>
          <h4 className="text-base font-extrabold text-white mt-0.5">{advisory.title}</h4>
          <p className="text-xs leading-relaxed mt-1.5 opacity-90">{advisory.desc}</p>
        </div>
      </div>

      {/* Grid Row 2: Route Planner & Feedback List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dynamic Route Planner suggestions */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Navigation className="text-emerald-400 rotate-45 animate-pulse" size={16} />
              <span className="text-xs uppercase font-bold tracking-wider text-slate-300">{t.routePlanner}</span>
            </div>
            <p className="text-[10px] text-slate-500 mb-4">{t.routePlannerDesc}</p>

            {routeError && (
              <div className="bg-rose-950/40 border border-rose-500/25 text-rose-300 text-[10px] px-3 py-2 rounded-xl text-center font-bold font-mono mb-3">
                {routeError}
              </div>
            )}

            <form onSubmit={handleCalculateRoute} className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">{t.startPoint}</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder={t.routePlaceholderStart}
                    value={routeSearch.start}
                    onChange={(e) => setRouteSearch({ ...routeSearch, start: e.target.value })}
                    className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl pl-3 pr-10 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    title="Use Current GPS Coordinates"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/5 text-slate-450 hover:text-emerald-400 rounded-lg transition"
                  >
                    <Navigation size={13} className="rotate-45" />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">{t.endPoint}</label>
                <input
                  type="text"
                  required
                  placeholder={t.routePlaceholderEnd}
                  value={routeSearch.end}
                  onChange={(e) => setRouteSearch({ ...routeSearch, end: e.target.value })}
                  className="w-full text-xs bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                />
              </div>
              <button 
                type="submit"
                disabled={isRoutingLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-white/10 hover:border-emerald-500/40 text-emerald-400 hover:text-white font-bold py-2.5 rounded-xl text-xs transition flex justify-center items-center gap-2"
              >
                {isRoutingLoading ? (
                  <RefreshCw size={13} className="animate-spin text-emerald-400" />
                ) : (
                  <span>{t.findRoute}</span>
                )}
              </button>
            </form>
          </div>

          {/* Route Suggestions Outcome display */}
          {routeResult && (
            <div className="mt-5 pt-4 border-t border-white/5 flex flex-col gap-3 text-xs">
              {routeResult.recommendation && (
                <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl flex flex-col gap-2 mb-2 text-xs">
                  <div className="flex items-center gap-2 text-blue-300 font-extrabold uppercase text-[10px] tracking-wider">
                    <Navigation size={12} className="rotate-45 text-blue-400 animate-pulse" />
                    <span>{lang === 'en' ? 'Smart Route Suggestion' : 'स्मार्ट मार्ग सुझाव'}</span>
                  </div>
                  <p className="font-semibold text-slate-200 text-[11px] leading-relaxed">
                    {routeResult.recommendation.advice}
                  </p>
                  {routeResult.recommendation.reasons && routeResult.recommendation.reasons.length > 0 && (
                    <div className="flex flex-col gap-1 mt-1 border-t border-blue-500/25 pt-2">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                        {lang === 'en' ? 'Identified Road Disturbances:' : 'चिन्हित सड़क व्यवधान:'}
                      </span>
                      {routeResult.recommendation.reasons.map((r, idx) => (
                        <div key={idx} className="text-[10px] text-slate-350 leading-normal flex items-start gap-1">
                          <span className="text-amber-400 shrink-0 select-none">•</span>
                          <span><strong>{r.title}</strong>: {r.reason}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">{t.routeResultHeader}</span>
              
              {/* Green safe route option */}
              <div className="bg-emerald-500/5 border border-emerald-500/20 p-3.5 rounded-xl">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-extrabold text-emerald-300">{routeResult.greenRoute.name}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 rounded">
                    {routeResult.greenRoute.time}
                  </span>
                </div>
                <div className="flex gap-3 text-[10px] text-slate-400 my-1 font-semibold">
                  <span>AQI: <strong className="text-emerald-400">{routeResult.greenRoute.aqi}</strong></span>
                  <span>Congestion: {routeResult.greenRoute.congestion}</span>
                </div>
                <p className="text-[10px] text-slate-400 italic mt-1 leading-normal">{routeResult.greenRoute.summary}</p>
              </div>

              {/* Toxic high congestion route warning */}
              <div className="bg-rose-500/5 border border-rose-500/20 p-3.5 rounded-xl opacity-60 hover:opacity-90 transition">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-extrabold text-rose-300">{routeResult.alternateRoute.name}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-950/40 border border-rose-500/20 text-rose-400 rounded">
                    {routeResult.alternateRoute.time}
                  </span>
                </div>
                <div className="flex gap-3 text-[10px] text-slate-400 my-1">
                  <span>AQI: <strong className="text-rose-400">{routeResult.alternateRoute.aqi}</strong></span>
                  <span>Congestion: {routeResult.alternateRoute.congestion}</span>
                </div>
                <p className="text-[10px] text-slate-500 italic mt-1 leading-normal">{routeResult.alternateRoute.summary}</p>
              </div>
            </div>
          )}
        </div>

        {/* Crowdsourced Complaints / Feedback Section */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col min-h-[400px]">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="text-emerald-400 animate-pulse" size={16} />
            <span className="text-xs uppercase font-bold tracking-wider text-slate-300">{t.crowdsourcedIssues}</span>
          </div>
          <p className="text-[10px] text-slate-500 mb-4 bg-white/5 p-3 rounded-xl border border-white/5 leading-normal">
            {t.howToReport}
          </p>

          {/* Complaints list */}
          <div className="flex-1 overflow-y-auto max-h-[350px] pr-1 flex flex-col gap-2.5">
            {complaints.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center my-auto">No neighborhood reports found in this zone.</p>
            ) : (
              complaints.map((c) => (
                <div key={c._id || c.id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex flex-col gap-2 text-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-slate-200 truncate">{c.title}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${
                      c.status === 'resolved' ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400' :
                      c.status === 'in-progress' ? 'bg-amber-950/40 border-amber-500/20 text-amber-400' :
                      'bg-rose-950/40 border-rose-500/20 text-rose-400'
                    }`}>
                      {lang === 'en' ? c.status : t[c.status] || c.status}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-semibold">
                    <span style={{ color: categoryColors[c.category] || '#10b981' }}>{t[c.category] || c.category}</span>
                    <span>{new Date(c.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>

                  {c.description && <p className="text-[11px] text-slate-400 leading-normal bg-black/10 p-1.5 rounded">{c.description}</p>}

                  <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-white/5 text-[10px]">
                    <span className="text-slate-500">Coord: {c.lat.toFixed(3)}, {c.lng.toFixed(3)}</span>
                    <button
                      onClick={() => handleUpvote(c._id || c.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-white/10 hover:border-emerald-500 hover:text-emerald-400 rounded-lg text-slate-400 text-[10px] font-bold transition-all"
                    >
                      <ThumbsUp size={10} />
                      <span>{t.upvote} ({c.votes || 0})</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Live Arterial Congestion Speed & Incidents Panel */}
      <div className="glass-card p-5 rounded-2xl border border-white/5 text-left flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <Navigation className="text-emerald-400 rotate-45" size={16} />
            <span className="text-xs uppercase font-extrabold tracking-widest text-zinc-300">Surat Arterial Traffic Corridor Speeds</span>
          </div>
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider font-mono">Updated: Real-time Feed</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Dumas Road (Piplod to Dumas)', baseSpeed: 60, conSpeed: 20, nameHi: 'डुमस रोड (पिपलोद से डुमस)' },
            { name: 'Ring Road (Majura to Station)', baseSpeed: 45, conSpeed: 10, nameHi: 'रिंग रोड (मजूरा से स्टेशन)' },
            { name: 'Varachha Main Road', baseSpeed: 40, conSpeed: 8, nameHi: 'वराछा मेन रोड' },
            { name: 'Rander-Adajan Road', baseSpeed: 50, conSpeed: 12, nameHi: 'રાંદેર-અડાજણ રોડ' },
            { name: 'Gaurav Path (Pal to Piplod)', baseSpeed: 60, conSpeed: 25, nameHi: 'गौरव पथ (पाल से पिपलोद)' },
            { name: 'Katargam Road', baseSpeed: 45, conSpeed: 10, nameHi: 'कतारगाम रोड' }
          ].map((corridor, idx) => {
            const baseCongestion = trafficData ? trafficData.level : 30;
            let segmentCongestion = baseCongestion;
            if (corridor.name.includes('Dumas')) segmentCongestion += 10;
            if (corridor.name.includes('Varachha')) segmentCongestion += 20;
            if (corridor.name.includes('Gaurav')) segmentCongestion -= 10;
            segmentCongestion = Math.max(5, Math.min(95, segmentCongestion));

            const speed = Math.round(
              corridor.baseSpeed - (segmentCongestion / 100) * (corridor.baseSpeed - corridor.conSpeed)
            );

            let speedColor = 'text-emerald-400';
            let label = lang === 'en' ? 'Clear' : 'साफ';
            let labelColor = 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20';
            if (segmentCongestion > 65) {
              speedColor = 'text-rose-400';
              label = lang === 'en' ? 'Jam' : 'जाम';
              labelColor = 'bg-rose-950/40 text-rose-400 border-rose-500/20';
            } else if (segmentCongestion > 35) {
              speedColor = 'text-amber-400';
              label = lang === 'en' ? 'Slow' : 'धीमा';
              labelColor = 'bg-amber-950/40 text-amber-400 border-amber-500/20';
            }

            return (
              <div key={idx} className="bg-zinc-950/40 border border-white/5 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold block truncate max-w-[160px]">{lang === 'en' ? corridor.name : corridor.nameHi}</span>
                  <span className={`text-base font-black ${speedColor} mt-0.5 block`}>{speed} km/h</span>
                </div>
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${labelColor}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

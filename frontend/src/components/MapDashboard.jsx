import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Search, PlusCircle, PenTool, Trash2, CheckCircle, Navigation, Layers, Box, RefreshCw } from 'lucide-react';

// Reset Leaflet icon resolution defaults to prevent Vite build mapping failures
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Define custom digital SVG pins for aesthetic premium twin layers
const createSvgIcon = (color, pulseClass) => {
  return L.divIcon({
    html: `<div class="relative w-8 h-8 flex items-center justify-center">
            <div class="absolute w-6 h-6 rounded-full ${pulseClass}"></div>
            <svg class="relative w-5 h-5 text-white filter drop-shadow" fill="${color}" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
           </div>`,
    className: 'custom-leaflet-svg-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });
};

const userLocationIcon = L.divIcon({
  html: `<div class="relative w-8 h-8 flex items-center justify-center">
          <div class="absolute w-6 h-6 rounded-full bg-blue-500/40 animate-ping"></div>
          <div class="relative w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg shadow-black"></div>
         </div>`,
  className: 'custom-user-location-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const categoryColors = {
  garbage: '#f59e0b',  // Amber
  pothole: '#ef4444',  // Red
  flooding: '#3b82f6', // Blue
  electricity: '#a855f7', // Purple
  water: '#10b981'     // Emerald
};

// Grid Heat Points baseline (simulates sensors across wards)
const heatSensors = [
  { name: 'Adajan Ward', lat: 21.1925, lng: 72.7997, aqiOffset: -10, trafficOffset: 12, tempOffset: -0.5 },
  { name: 'Varachha Sector', lat: 21.2052, lng: 72.8647, aqiOffset: 45, trafficOffset: 35, tempOffset: 1.8 },
  { name: 'Piplod Area', lat: 21.1444, lng: 72.7744, aqiOffset: -25, trafficOffset: 15, tempOffset: -0.8 },
  { name: 'Katargam Ward', lat: 21.2288, lng: 72.8272, aqiOffset: 35, trafficOffset: 20, tempOffset: 1.2 },
  { name: 'Vesu Zone', lat: 21.1350, lng: 72.7850, aqiOffset: -15, trafficOffset: -5, tempOffset: -0.3 },
  { name: 'Rander Area', lat: 21.2166, lng: 72.7958, aqiOffset: 10, trafficOffset: 18, tempOffset: 0.2 },
  { name: 'Surat Station Area', lat: 21.2050, lng: 72.8390, aqiOffset: 55, trafficOffset: 40, tempOffset: 2.2 },
  { name: 'Udhna Industrial Zone', lat: 21.1610, lng: 72.8420, aqiOffset: 65, trafficOffset: 25, tempOffset: 2.5 }
];

const suratTrafficCorridors = [
  {
    name: 'Dumas Road (Piplod to Dumas)',
    coords: [
      [21.1722, 72.7922],
      [21.1550, 72.7810],
      [21.1390, 72.7710],
      [21.1210, 72.7560],
      [21.0990, 72.7290]
    ],
    baseSpeed: 60,
    congestedSpeed: 20
  },
  {
    name: 'Ring Road (Majura Gate to Surat Station)',
    coords: [
      [21.1780, 72.8220],
      [21.1890, 72.8310],
      [21.2010, 72.8390],
      [21.2040, 72.8450]
    ],
    baseSpeed: 45,
    congestedSpeed: 10
  },
  {
    name: 'Varachha Main Road',
    coords: [
      [21.2050, 72.8490],
      [21.2080, 72.8610],
      [21.2110, 72.8750],
      [21.2140, 72.8900]
    ],
    baseSpeed: 40,
    congestedSpeed: 8
  },
  {
    name: 'Rander-Adajan Road',
    coords: [
      [21.1925, 72.7997],
      [21.2020, 72.7940],
      [21.2120, 72.7910],
      [21.2180, 72.7930]
    ],
    baseSpeed: 50,
    congestedSpeed: 12
  },
  {
    name: 'Gaurav Path (Pal to Piplod)',
    coords: [
      [21.1810, 72.7810],
      [21.1690, 72.7750],
      [21.1540, 72.7744]
    ],
    baseSpeed: 60,
    congestedSpeed: 25
  },
  {
    name: 'Katargam Road',
    coords: [
      [21.2090, 72.8290],
      [21.2190, 72.8260],
      [21.2288, 72.8272]
    ],
    baseSpeed: 45,
    congestedSpeed: 10
  }
];

// Map fly-to helper component
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapDashboard({
  weatherData,
  aqiData,
  trafficData,
  complaints,
  zones,
  activeMapLayer,
  setActiveMapLayer,
  role,
  lang,
  onComplaintAdded,
  onZoneAdded,
  onZoneDeleted,
  activeRoute,
  setActiveRoute,
  userLocation,
  setUserLocation,
  city,
  themeMode
}) {
  const CITIES_COORDINATES = {
    surat: [21.1702, 72.8311],
    mumbai: [19.0760, 72.8777],
    delhi: [28.7041, 77.1025],
    bengaluru: [12.9716, 77.5946],
    ahmedabad: [23.0225, 72.5714],
    pune: [18.5204, 73.8567]
  };

  const defaultCoords = [21.1702, 72.8311];
  const currentCoords = CITIES_COORDINATES[(city || 'surat').toLowerCase()] || CITIES_COORDINATES.surat;
  const dLat = currentCoords[0] - defaultCoords[0];
  const dLng = currentCoords[1] - defaultCoords[1];

  const shiftedHeatSensors = heatSensors.map(s => ({
    ...s,
    lat: s.lat + dLat,
    lng: s.lng + dLng
  }));

  const shiftedTrafficCorridors = suratTrafficCorridors.map(tc => ({
    ...tc,
    coords: tc.coords.map(c => [c[0] + dLat, c[1] + dLng])
  }));

  const [mapCenter, setMapCenter] = useState(currentCoords);
  const [mapZoom, setMapZoom] = useState(13);

  useEffect(() => {
    if (city) {
      const coords = CITIES_COORDINATES[city.toLowerCase()] || CITIES_COORDINATES.surat;
      setMapCenter(coords);
      setMapZoom(13);
    }
  }, [city]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPinDropMode, setIsPinDropMode] = useState(false);
  const [isDrawZoneMode, setIsDrawZoneMode] = useState(false);
  const [is3DView, setIs3DView] = useState(true);
  
  // Pending actions
  const [pendingPin, setPendingPin] = useState(null); // {lat, lng}
  const [complaintForm, setComplaintForm] = useState({ title: '', description: '', category: 'garbage' });
  const [pendingZoneCoords, setPendingZoneCoords] = useState([]); // [{lat, lng}, ...]
  const [zoneForm, setZoneForm] = useState({ name: '', type: 'construction', severity: 'medium', details: '' });
 
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const watchIdRef = useRef(null);

  // Geolocation tracking effect
  useEffect(() => {
    if (isTrackingLocation) {
      if ('geolocation' in navigator) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation([latitude, longitude]);
            setMapCenter([latitude, longitude]);
          },
          (error) => {
            console.error("Error watching position:", error);
            setIsTrackingLocation(false);
          },
          { enableHighAccuracy: true }
        );
      } else {
        alert("Geolocation is not supported by your browser.");
        setIsTrackingLocation(false);
      }
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isTrackingLocation, setUserLocation]);

  const handleLocateMe = () => {
    if (!('geolocation' in navigator)) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setMapCenter([latitude, longitude]);
        setMapZoom(15);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert(lang === 'en' ? "Could not retrieve your location. Please check permissions." : "आपका स्थान प्राप्त नहीं किया जा सका। कृपया अनुमतियाँ जाँचें।");
      },
      { enableHighAccuracy: true }
    );
  };

  const handlePinAtCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setPendingPin({ lat: latitude, lng: longitude });
        setMapCenter([latitude, longitude]);
        setMapZoom(15);
        setIsPinDropMode(false);
      },
      (error) => {
        console.error("Error pinning location:", error);
        alert(lang === 'en' ? "Could not retrieve your location." : "आपका स्थान प्राप्त नहीं किया जा सका।");
      },
      { enableHighAccuracy: true }
    );
  };

  // Fly to starting coordinate when active route updates
  useEffect(() => {
    if (activeRoute && activeRoute.coordinates && activeRoute.coordinates.length > 0) {
      setMapCenter(activeRoute.coordinates[0]);
      setMapZoom(13);
    }
  }, [activeRoute]);
 
  // Map click handler helper for adding complaints/zones
  function MapEvents() {
    const map = useMap();
    useEffect(() => {
      const handleMapClick = (e) => {
        const { lat, lng } = e.latlng;
        
        if (isPinDropMode) {
          setPendingPin({ lat, lng });
          setIsPinDropMode(false);
        } else if (isDrawZoneMode) {
          setPendingZoneCoords(prev => [...prev, [lat, lng]]);
        }
      };
      
      map.on('click', handleMapClick);
      return () => map.off('click', handleMapClick);
    }, [map]);
    return null;
  }

  // Address search query resolver via OSM Nominatim Open API
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Location search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (loc) => {
    const lat = parseFloat(loc.lat);
    const lon = parseFloat(loc.lon);
    setMapCenter([lat, lon]);
    setMapZoom(14);
    setSearchResults([]);
    setSearchQuery(loc.display_name.split(',')[0]);
  };

  // Dispatch complaint to Express Backend
  const submitComplaint = async (e) => {
    e.preventDefault();
    if (!pendingPin) return;

    try {
      const response = await fetch('/api/citizen/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...complaintForm,
          lat: pendingPin.lat,
          lng: pendingPin.lng
        })
      });

      if (response.ok) {
        setPendingPin(null);
        setComplaintForm({ title: '', description: '', category: 'garbage' });
        onComplaintAdded(); // Trigger re-poll
      }
    } catch (err) {
      console.error('Failed to submit citizen complaint:', err);
    }
  };

  // Dispatch drawn restriction zone to Express Backend
  const submitZone = async (e) => {
    e.preventDefault();
    if (pendingZoneCoords.length < 3) return;

    try {
      const response = await fetch('/api/admin/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...zoneForm,
          coordinates: pendingZoneCoords
        })
      });

      if (response.ok) {
        setPendingZoneCoords([]);
        setIsDrawZoneMode(false);
        setZoneForm({ name: '', type: 'construction', severity: 'medium', details: '' });
        onZoneAdded(); // Trigger re-poll
      }
    } catch (err) {
      console.error('Failed to register restriction zone:', err);
    }
  };

  const deleteZone = async (id) => {
    try {
      const response = await fetch(`/api/admin/zones/${id}`, { method: 'DELETE' });
      if (response.ok) {
        onZoneDeleted();
      }
    } catch (err) {
      console.error('Failed to delete zone:', err);
    }
  };

  const handleUpvoteComplaint = async (id) => {
    try {
      const response = await fetch(`/api/citizen/complaints/${id}/upvote`, { method: 'POST' });
      if (response.ok) {
        onComplaintAdded(); // refresh
      }
    } catch (err) {
      console.error('Complaint upvote failed:', err);
    }
  };

  const handleUpdateComplaintStatus = async (id, status) => {
    try {
      const response = await fetch(`/api/citizen/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        onComplaintAdded();
      }
    } catch (err) {
      console.error('Complaint status update failed:', err);
    }
  };

  // Color calculation helper for Heat Sensor circles
  const getHeatColor = (sensor, type) => {
    if (type === 'aqi') {
      const baseAqi = aqiData ? aqiData.aqi : 150;
      const finalAqi = Math.max(20, baseAqi + sensor.aqiOffset);
      if (finalAqi > 200) return '#ef4444'; // Red
      if (finalAqi > 100) return '#f59e0b'; // Amber
      return '#10b981'; // Emerald
    }
    if (type === 'traffic') {
      const baseTraffic = trafficData ? trafficData.level : 40;
      const finalTraffic = Math.max(5, Math.min(100, baseTraffic + sensor.trafficOffset));
      if (finalTraffic > 70) return '#ef4444';
      if (finalTraffic > 40) return '#f59e0b';
      return '#10b981';
    }
    if (type === 'temp') {
      const baseTemp = weatherData ? weatherData.temp : 30;
      const finalTemp = baseTemp + sensor.tempOffset;
      if (finalTemp > 38) return '#f97316'; // Deep Orange
      if (finalTemp > 30) return '#f59e0b'; // Yellow
      return '#3b82f6'; // Blue
    }
    return '#64748b';
  };

  const getHeatValue = (sensor, type) => {
    if (type === 'aqi') return `${Math.max(20, (aqiData ? aqiData.aqi : 150) + sensor.aqiOffset)} AQI`;
    if (type === 'traffic') return `${Math.max(5, Math.min(100, (trafficData ? trafficData.level : 40) + sensor.trafficOffset))}% delay`;
    if (type === 'temp') return `${Math.round((weatherData ? weatherData.temp : 30) + sensor.tempOffset)}°C`;
    return '';
  };

  const getCorridorStatus = (corridor) => {
    const baseCongestion = trafficData ? trafficData.level : 30;
    
    let segmentCongestion = baseCongestion;
    if (corridor.name.includes('NH-48')) segmentCongestion += 15;
    if (corridor.name.includes('Connaught')) segmentCongestion += 25;
    if (corridor.name.includes('Dwarka')) segmentCongestion -= 10;
    
    segmentCongestion = Math.max(5, Math.min(95, segmentCongestion));
    
    const speed = Math.round(
      corridor.baseSpeed - (segmentCongestion / 100) * (corridor.baseSpeed - corridor.congestedSpeed)
    );
    
    let color = '#10b981'; // Green
    let label = lang === 'en' ? 'Clear' : 'साफ';
    if (segmentCongestion > 65) {
      color = '#ef4444'; // Red
      label = lang === 'en' ? 'Heavy Congestion' : 'भारी जाम';
    } else if (segmentCongestion > 35) {
      color = '#f59e0b'; // Amber
      label = lang === 'en' ? 'Moderate Traffic' : 'सामान्य यातायात';
    }
    
    return { speed, congestion: Math.round(segmentCongestion), color, label };
  };

  const renderZonePopup = (zone, sevColor) => (
    <Popup>
      <div className="p-1 font-sans text-xs max-w-[200px] bg-slate-950 text-slate-200 border border-white/5 rounded">
        <div className="flex items-center justify-between mb-1 gap-4">
          <span className="font-bold text-[13px] text-slate-100 truncate">{zone.name}</span>
          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-extrabold bg-slate-900 border" style={{ borderColor: sevColor, color: sevColor }}>
            {zone.severity}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mb-1 uppercase tracking-wide font-semibold font-mono">Restriction: {zone.type}</p>
        {zone.details && <p className="text-[11px] text-slate-300 mt-1 bg-white/5 p-1 rounded font-mono">{zone.details}</p>}
        
        {role !== 'public' && (
          <button
            onClick={() => deleteZone(zone._id || zone.id)}
            className="mt-2 w-full flex items-center justify-center gap-1 py-1 text-[10px] bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/20 text-rose-300 hover:text-white rounded transition"
          >
            <Trash2 size={10} />
            <span>Delete Zone Area</span>
          </button>
        )}
      </div>
    </Popup>
  );

  const render3DZone = (zone, idx) => {
    const sevColor = zone.severity === 'high' ? '#ef4444' : zone.severity === 'medium' ? '#f59e0b' : '#3b82f6';
    
    if (!is3DView) {
      return (
        <Polygon
          key={`zone-2d-${idx}`}
          positions={zone.coordinates}
          pathOptions={{
            fillColor: sevColor,
            fillOpacity: 0.18,
            color: sevColor,
            weight: 2
          }}
        >
          {renderZonePopup(zone, sevColor)}
        </Polygon>
      );
    }

    const heightOffset = 0.0006;
    const topCoordinates = zone.coordinates.map(c => [c[0] + heightOffset, c[1]]);
    
    return (
      <React.Fragment key={`zone-3d-${idx}`}>
        <Polygon 
          positions={zone.coordinates} 
          pathOptions={{ 
            color: sevColor, 
            weight: 1.5, 
            fillOpacity: 0.04 
          }} 
        />
        <Polygon 
          positions={topCoordinates} 
          pathOptions={{ 
            color: '#ffffff', 
            weight: 2, 
            fillColor: sevColor, 
            fillOpacity: 0.35 
          }} 
        >
          {renderZonePopup(zone, sevColor)}
        </Polygon>
        {zone.coordinates.map((coord, wIdx) => {
          const nextIdx = (wIdx + 1) % zone.coordinates.length;
          const wallCoords = [
            coord,
            topCoordinates[wIdx],
            topCoordinates[nextIdx],
            zone.coordinates[nextIdx]
          ];
          return (
            <Polygon 
              key={`wall-${idx}-${wIdx}`}
              positions={wallCoords} 
              pathOptions={{ 
                color: sevColor, 
                weight: 1, 
                fillColor: sevColor, 
                fillOpacity: 0.12 
              }} 
            />
          );
        })}
      </React.Fragment>
    );
  };

  return (
    <div className="absolute inset-0 flex flex-col z-10 p-3 md:p-5 bg-zinc-950/80 backdrop-blur-sm overflow-hidden w-full h-full text-slate-100">
      {/* Route Info HUD */}
      {activeRoute && (
        <div className="absolute top-20 left-64 z-[990] bg-slate-950/90 backdrop-blur-xl p-4 rounded-2xl max-w-[260px] border border-emerald-500/30 text-left flex flex-col gap-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] pointer-events-auto transition-all hover:border-emerald-500/50">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-[11px] font-extrabold tracking-wide text-emerald-400 font-mono">Active Green Route</span>
            <button 
              onClick={() => setActiveRoute(null)}
              className="text-[9px] text-rose-400 hover:text-rose-300 font-extrabold uppercase tracking-wider transition"
            >
              Clear Route
            </button>
          </div>
          <div className="text-[10px] flex flex-col gap-1">
            <span className="text-slate-400 truncate font-mono">From: <strong className="text-slate-200">{activeRoute.startName}</strong></span>
            <span className="text-slate-400 truncate font-mono">To: <strong className="text-slate-200">{activeRoute.endName}</strong></span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1 border-t border-white/10 pt-2 text-center">
            <div className="bg-white/5 p-1.5 rounded-lg border border-white/5">
              <span className="text-[8px] text-slate-400 uppercase block font-mono font-semibold">Distance</span>
              <span className="text-xs font-bold text-slate-100 block font-mono">{activeRoute.distance} km</span>
            </div>
            <div className="bg-white/5 p-1.5 rounded-lg border border-white/5">
              <span className="text-[8px] text-slate-400 uppercase block font-mono font-semibold">Time</span>
              <span className="text-xs font-bold text-emerald-400 block font-mono">{activeRoute.duration} mins</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 text-[10px] text-emerald-400 px-3 py-1.5 rounded-xl font-bold font-mono shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>AQI {activeRoute.greenAqi} • Eco-Optimized Route</span>
          </div>
        </div>
      )}

      {/* Top Center Tech Search Bar */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[999] w-96 max-w-[85%] pointer-events-auto">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder={lang === 'en' ? "Search ward, location, plot ID, or coordinates..." : "वार्ड, स्थान, भूखंड ID या निर्देशांक खोजें..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs text-center bg-slate-950/90 backdrop-blur-md border border-white/10 rounded-xl px-10 py-2.5 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/40 shadow-2xl transition-all font-mono"
          />
          <Search size={13} className="absolute left-4 top-3 text-slate-400" />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => { setSearchQuery(''); setSearchResults([]); }}
              className="absolute right-4 top-3 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </form>

        {/* Search Results Autocomplete Dropdown */}
        {searchResults.length > 0 && (
          <div className="mt-1 bg-slate-950/90 border border-white/10 rounded-xl max-h-60 overflow-y-auto z-[1000] relative">
            {searchResults.map((result, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectLocation(result)}
                className="w-full text-left px-3 py-2 text-xs hover:bg-white/5 border-b border-white/5 text-slate-300 hover:text-white truncate block text-center font-mono"
              >
                {result.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Futuristic Left Sidebar Console */}
      <div className="absolute top-20 left-8 z-[999] flex flex-col gap-3.5 w-44 md:w-48 text-left pointer-events-auto">
        {/* Live Tyk / Data.gov.in API Gateway Key Status HUD */}
        <div className="bg-emerald-950/40 backdrop-blur-md border border-emerald-500/30 p-3 rounded-xl flex flex-col gap-1 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[8px] uppercase tracking-wider font-extrabold text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Live Tyk API Key
            </span>
          </div>
          <p className="text-[9px] text-slate-300 font-mono truncate mt-0.5" title="eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjdiNWQ4NWU0OTIyNDQxOTE5ZjNkMDNmODJlNGU1YWY4IiwiaCI6Im11cm11cjY0In0=">
            Key: eyJvcmci...e5af8
          </p>
          <span className="text-[8px] text-emerald-300 font-bold uppercase font-mono">
            Feed: Real-time AQI & Sensors
          </span>
        </div>

        {/* Metric 1: City Health Index */}
        <div className="bg-slate-950/70 backdrop-blur-md border border-white/5 p-3.5 rounded-xl flex flex-col gap-0.5 shadow-xl relative overflow-hidden group hover:border-emerald-500/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[9px] tracking-wider font-extrabold text-slate-300 font-mono">City Health Index</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base font-black text-white font-mono">85%</span>
            <span className="text-[9px] font-bold text-emerald-400 font-mono">+2.5%</span>
          </div>
        </div>

        {/* Metric 2: Active Alerts */}
        <div className="bg-slate-950/70 backdrop-blur-md border border-white/5 p-3.5 rounded-xl flex flex-col gap-0.5 shadow-xl relative overflow-hidden hover:border-rose-500/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[9px] tracking-wider font-extrabold text-slate-300 font-mono">Active Alerts</span>
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base font-black text-white font-mono">12</span>
            <span className="text-[9px] font-bold text-rose-400 font-mono">+4</span>
          </div>
        </div>

        {/* Metric 3: System Reliability */}
        <div className="bg-slate-950/70 backdrop-blur-md border border-white/5 p-3.5 rounded-xl flex flex-col gap-0.5 shadow-xl relative overflow-hidden hover:border-emerald-500/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[9px] tracking-wider font-extrabold text-slate-300 font-mono">System Reliability</span>
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400"></div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base font-black text-white font-mono">98%</span>
            <span className="text-[9px] font-bold text-rose-400 font-mono">-0.3%</span>
          </div>
        </div>

        {/* Metric 4: Daily Operations */}
        <div className="bg-slate-950/70 backdrop-blur-md border border-white/5 p-3.5 rounded-xl flex flex-col gap-0.5 shadow-xl relative overflow-hidden hover:border-teal-500/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[9px] tracking-wider font-extrabold text-slate-300 font-mono">Daily Operations</span>
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base font-black text-white font-mono">92%</span>
            <span className="text-[9px] font-bold text-emerald-400 font-mono">+1.2%</span>
          </div>
        </div>

        {/* Metric 5: Grid Energy Load */}
        <div className="bg-slate-950/70 backdrop-blur-md border border-white/5 p-3.5 rounded-xl flex flex-col gap-0.5 shadow-xl relative overflow-hidden hover:border-amber-500/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[9px] tracking-wider font-extrabold text-slate-300 font-mono">Grid Energy Load</span>
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-sm font-black text-white font-mono">92.4 MW</span>
            <span className="text-[9px] font-bold text-rose-400 font-mono">-2.3%</span>
          </div>
        </div>
      </div>

      {/* Futuristic Right Sidebar Charts */}
      <div className="absolute top-20 right-8 z-[999] flex flex-col gap-3.5 w-52 md:w-56 text-left pointer-events-auto">
        {/* Traffic Analysis Card */}
        <div className="bg-slate-950/70 backdrop-blur-md border border-white/5 p-4 rounded-xl flex flex-col gap-2 shadow-xl hover:border-emerald-500/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-wider font-extrabold text-slate-300 font-mono">Traffic Analysis</span>
            <span className="text-[8px] text-teal-400 font-mono font-bold">Live Flow</span>
          </div>
          <div className="flex items-end justify-between h-20 pt-2 px-1">
            {[35, 50, 75, 40, 90, 60, 45].map((val, idx) => {
              const heightStr = `${val}%`;
              const isPeak = idx === 4; // 5 PM peak highlighted
              const timeLabel = ['9 AM', '11 AM', '1 PM', '3 PM', '5 PM', '7 PM', '9 PM'][idx];
              return (
                <div key={idx} className="flex flex-col items-center gap-1 flex-1 group/bar relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none bg-slate-900 border border-white/20 px-1.5 py-0.5 rounded text-[8px] text-white font-mono font-bold whitespace-nowrap z-30 shadow-lg">
                    {val}% Flow ({timeLabel})
                  </div>

                  <div className="w-2.5 bg-white/5 rounded-t relative h-16 overflow-hidden">
                    <div 
                      className={`absolute bottom-0 left-0 right-0 rounded-t transition-all duration-300 ${
                        isPeak 
                          ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]' 
                          : 'bg-teal-500/40 group-hover/bar:bg-teal-400'
                      }`}
                      style={{ height: heightStr }}
                    ></div>
                  </div>
                  <span className="text-[8px] text-slate-400 font-bold font-mono">
                    {['9a', '11a', '1p', '3p', '5p', '7p', '9p'][idx]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Energy Consumption Line Chart */}
        <div className="bg-slate-950/70 backdrop-blur-md border border-white/5 p-4 rounded-xl flex flex-col gap-2 shadow-xl hover:border-amber-500/20 transition-all">
          <span className="text-[10px] tracking-wider font-extrabold text-slate-300 font-mono">Energy Consumption</span>
          <div className="relative h-20 w-full mt-1 overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
              <defs>
                <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path 
                d="M 0,40 Q 15,20 30,30 T 60,10 T 90,25 L 100,25 L 100,40 Z" 
                fill="url(#energyGrad)"
              />
              <path 
                d="M 0,40 Q 15,20 30,30 T 60,10 T 90,25 L 100,25" 
                fill="none" 
                stroke="#f59e0b" 
                strokeWidth="1.5" 
                strokeLinecap="round"
                className="drop-shadow-[0_0_4px_rgba(245,158,11,0.5)]"
              />
              <circle cx="30" cy="30" r="1.5" fill="#ffffff" />
              <circle cx="60" cy="10" r="1.5" fill="#f59e0b" />
              <circle cx="90" cy="25" r="1.5" fill="#ffffff" />
            </svg>
            <div className="flex justify-between text-[7px] text-slate-500 font-bold font-mono mt-1 px-1">
              <span>06 AM</span>
              <span>12 PM</span>
              <span>06 PM</span>
              <span>12 AM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Center Futuristic Controller Dock */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 bg-slate-950/90 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-full shadow-2xl transition-all pointer-events-auto">
        {role !== 'public' && (
          <button
            type="button"
            onClick={() => {
              setIsDrawZoneMode(!isDrawZoneMode);
              setIsPinDropMode(false);
              setPendingPin(null);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[10px] font-extrabold uppercase tracking-wider border transition-all ${
              isDrawZoneMode 
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_12px_rgba(239,68,68,0.2)]' 
                : 'bg-transparent border-transparent hover:border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <PenTool size={11} />
            <span>{lang === 'en' ? 'Draw Zone' : 'क्षेत्र आरेख'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setIsPinDropMode(!isPinDropMode);
            setIsDrawZoneMode(false);
            setPendingZoneCoords([]);
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[10px] font-extrabold uppercase tracking-wider border transition-all ${
            isPinDropMode 
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]' 
              : 'bg-transparent border-transparent hover:border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <PlusCircle size={11} />
          <span>{lang === 'en' ? 'File Issue' : 'शिकायत दर्ज'}</span>
        </button>

        {isPinDropMode && (
          <button
            type="button"
            onClick={handlePinAtCurrentLocation}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[10px] font-extrabold uppercase tracking-wider border bg-blue-500/20 border-blue-500 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.25)] hover:bg-blue-500/30 transition-all animate-pulse"
          >
            <MapPin size={11} />
            <span>{lang === 'en' ? 'Pin Current Location' : 'यहाँ पिन करें'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleLocateMe}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-transparent hover:border-white/10 text-slate-400 hover:text-white transition-all"
        >
          <Navigation size={11} className="rotate-45" />
          <span>{lang === 'en' ? 'Locate Me' : 'मुझे ढूंढें'}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsTrackingLocation(!isTrackingLocation)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[10px] font-extrabold uppercase tracking-wider border transition-all ${
            isTrackingLocation 
              ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.2)]' 
              : 'bg-transparent border-transparent hover:border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <RefreshCw size={11} className={isTrackingLocation ? 'animate-spin' : ''} />
          <span>{lang === 'en' ? 'Track GPS' : 'जीपीएस ट्रैक'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            const layers = ['none', 'aqi', 'traffic', 'temp'];
            const nextIdx = (layers.indexOf(activeMapLayer || 'none') + 1) % layers.length;
            if (setActiveMapLayer) setActiveMapLayer(layers[nextIdx]);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-transparent hover:border-white/10 text-slate-400 hover:text-white transition-all"
        >
          <Layers size={11} />
          <span>{lang === 'en' ? `Layer: ${activeMapLayer || 'none'}` : `लेयर: ${activeMapLayer || 'none'}`}</span>
        </button>

        <button
          type="button"
          onClick={() => setIs3DView(!is3DView)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[10px] font-extrabold uppercase tracking-wider border transition-all ${
            is3DView 
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]' 
              : 'bg-transparent border-transparent hover:border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <Box size={11} className={is3DView ? 'animate-pulse' : ''} />
          <span>{is3DView ? '3D VIEW' : '2D VIEW'}</span>
        </button>

        {activeRoute && (
          <button
            type="button"
            onClick={() => setActiveRoute(null)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-transparent hover:border-rose-500/20 text-rose-400 hover:text-rose-350 transition-all"
          >
            <Trash2 size={11} />
            <span>{lang === 'en' ? 'Clear Route' : 'मार्ग हटाएँ'}</span>
          </button>
        )}
      </div>

      {/* Legend Box HUD (Bottom Left) */}
      <div className="absolute bottom-10 left-8 z-[999] bg-slate-950/80 backdrop-blur-md border border-white/5 p-3 rounded-xl flex flex-col gap-1 text-[8px] font-bold text-slate-400 w-24 text-left pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>OPERATIONAL</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span>WARNING</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          <span>CRITICAL</span>
        </div>
      </div>

      {/* Draw Area Reset Actions HUD */}
      {pendingZoneCoords.length > 0 && (
        <div className="absolute bottom-24 left-8 z-[999] glass-card p-3 rounded-xl border border-white/10 pointer-events-auto max-w-[200px]">
          <p className="text-[10px] text-slate-400 mb-2">
            Drawn points: {pendingZoneCoords.length} (needs min 3)
          </p>
          <form onSubmit={submitZone} className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Zone Restriction Title"
              value={zoneForm.name}
              onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
              required
              className="text-xs bg-slate-950 border border-white/10 rounded px-2 py-1 text-slate-100 placeholder-slate-500 focus:outline-none"
            />
            <div className="flex gap-2">
              <select
                value={zoneForm.type}
                onChange={(e) => setZoneForm({ ...zoneForm, type: e.target.value })}
                className="text-[11px] bg-slate-950 border border-white/10 rounded px-2 py-1 text-slate-200"
              >
                <option value="construction">Construction</option>
                <option value="event">Public Event</option>
                <option value="emergency">Emergency</option>
                <option value="maintenance">Maintenance</option>
              </select>
              <select
                value={zoneForm.severity}
                onChange={(e) => setZoneForm({ ...zoneForm, severity: e.target.value })}
                className="text-[11px] bg-slate-950 border border-white/10 rounded px-2 py-1 text-slate-200"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex gap-2 mt-1">
              <button 
                type="submit" 
                disabled={pendingZoneCoords.length < 3}
                className="flex-1 px-2.5 py-1 bg-rose-500 hover:bg-rose-600 disabled:opacity-40 disabled:hover:bg-rose-500 text-white rounded text-[11px] font-semibold"
              >
                Save Zone
              </button>
              <button 
                type="button"
                onClick={() => setPendingZoneCoords([])}
                className="px-2 py-1 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded text-[11px]"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Clipped Map Shell with Vector Outline Border */}
      <div className="relative flex-1 w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/5 z-0" style={{ clipPath: 'polygon(0% 8%, 4% 0%, 96% 0%, 100% 8%, 100% 92%, 96% 100%, 4% 100%, 0% 92%)' }}>
        {/* Glow border overlay inside clipped container */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-[1000]" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon 
            points="0,8 4,0 96,0 100,8 100,92 96,100 4,100 0,92" 
            fill="none" 
            stroke="rgba(255,255,255,0.08)" 
            strokeWidth="0.4"
          />
        </svg>

        {/* Main React Leaflet Container with 3D perspective wrapper */}
        <div className={`w-full h-full perspective-map-wrapper ${is3DView ? 'tilted-3d-map' : 'tilted-2d-map'}`}>
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <MapController center={mapCenter} zoom={mapZoom} />
            <MapEvents />

            {/* Dynamic CartoDB Vector Map TileLayer */}
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url={themeMode === 'light' 
                ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              }
            />

            {/* Render 3D/2D Sensor Pillars Overlay */}
            {activeMapLayer !== 'none' && shiftedHeatSensors.map((sensor, idx) => {
              const color = getHeatColor(sensor, activeMapLayer);
              if (!is3DView) {
                return (
                  <Circle
                    key={`heat-2d-${idx}`}
                    center={[sensor.lat, sensor.lng]}
                    radius={850}
                    pathOptions={{
                      fillColor: color,
                      fillOpacity: 0.25,
                      color: color,
                      weight: 1.5,
                      dashArray: '3'
                    }}
                  >
                    <Popup>
                      <div className="text-slate-100 p-1.5 font-sans bg-slate-950 rounded border border-white/10 text-xs">
                        <p className="font-bold text-[13px] text-emerald-400 mb-1">{sensor.name} Sensor Ward</p>
                        <div className="flex justify-between gap-4 mt-1 border-t border-white/5 pt-1 text-[11px]">
                          <span className="text-slate-400">Parameter reading:</span>
                          <span className="font-bold uppercase font-mono" style={{ color: color }}>
                            {getHeatValue(sensor, activeMapLayer)}
                          </span>
                        </div>
                      </div>
                    </Popup>
                  </Circle>
                );
              }

              // 3D Neon Column Pillar
              const topCoords = [sensor.lat + 0.0014, sensor.lng];
              const baseCoords = [sensor.lat, sensor.lng];
              return (
                <React.Fragment key={`sensor-3d-${idx}`}>
                  {/* Pulsing Base Ring */}
                  <Circle
                    center={baseCoords}
                    radius={220}
                    pathOptions={{
                      fillColor: color,
                      fillOpacity: 0.04,
                      color: color,
                      weight: 1,
                      dashArray: '4'
                    }}
                  />
                  
                  {/* Vertical Neon Column Vector */}
                  <Polyline 
                    positions={[baseCoords, topCoords]}
                    pathOptions={{
                      color: color,
                      weight: 6,
                      opacity: 0.85
                    }}
                  />
                  
                  {/* Core white filament */}
                  <Polyline 
                    positions={[baseCoords, topCoords]}
                    pathOptions={{
                      color: '#ffffff',
                      weight: 1.5,
                      opacity: 0.95
                    }}
                  />
                  
                  {/* Floating Top Beacon Ring */}
                  <Circle
                    center={topCoords}
                    radius={120}
                    pathOptions={{
                      fillColor: color,
                      fillOpacity: 0.35,
                      color: '#ffffff',
                      weight: 1.5
                    }}
                  >
                    <Popup>
                      <div className="text-slate-100 p-1.5 font-sans bg-slate-950 rounded border border-white/10 text-xs">
                        <p className="font-bold text-[13px] text-emerald-400 mb-1">{sensor.name} Sensor Ward</p>
                        <div className="flex justify-between gap-4 mt-1 border-t border-white/5 pt-1 text-[11px]">
                          <span className="text-slate-400 font-mono">Reading:</span>
                          <span className="font-bold uppercase font-mono" style={{ color: color }}>
                            {getHeatValue(sensor, activeMapLayer)}
                          </span>
                        </div>
                      </div>
                    </Popup>
                  </Circle>
                </React.Fragment>
              );
            })}

            {/* Drawn admin zones 3D/2D extruded prisms layer */}
            {zones.map((zone, idx) => render3DZone(zone, idx))}

        {/* Active Drawing Guide Lines */}
        {isDrawZoneMode && pendingZoneCoords.length > 0 && (
          <>
            {pendingZoneCoords.map((coord, idx) => (
              <Circle
                key={`draw-pt-${idx}`}
                center={coord}
                radius={20}
                pathOptions={{ color: '#ec4899', fillColor: '#ec4899', fillOpacity: 0.8 }}
              />
            ))}
            {pendingZoneCoords.length >= 2 && (
              <Polygon
                positions={pendingZoneCoords}
                pathOptions={{ color: '#ec4899', fillColor: '#ec4899', fillOpacity: 0.1, dashArray: '4' }}
              />
            )}
          </>
        )}

        {/* Pending Citizen Pin Drop dialog */}
        {pendingPin && (
          <Marker 
            position={[pendingPin.lat, pendingPin.lng]}
            icon={createSvgIcon('#10b981', 'pulsing-marker-teal')}
          >
            <Popup closeOnClick={false}>
              <div className="w-60 p-2 font-sans bg-slate-950 text-slate-200 border border-white/10 rounded">
                <p className="font-bold text-slate-100 text-[13px] mb-2 flex items-center gap-1">
                  <MapPin size={14} className="text-emerald-400" />
                  <span>Register Issue Coordinates</span>
                </p>
                <form onSubmit={submitComplaint} className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Short Title (e.g. Broken Pothole)"
                    required
                    value={complaintForm.title}
                    onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })}
                    className="text-xs bg-slate-900 border border-white/10 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                  <textarea
                    placeholder="Provide details..."
                    rows={2}
                    value={complaintForm.description}
                    onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                    className="text-xs bg-slate-900 border border-white/10 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex gap-2">
                    <select
                      value={complaintForm.category}
                      onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                      className="text-xs flex-1 bg-slate-900 border border-white/10 rounded px-2.5 py-1.5 text-slate-200"
                    >
                      <option value="garbage">Garbage Pile</option>
                      <option value="pothole">Pothole</option>
                      <option value="flooding">Flooding</option>
                      <option value="electricity">Power Cut</option>
                      <option value="water">Water Leakage</option>
                    </select>
                  </div>
                  <div className="flex gap-2 mt-1.5">
                    <button 
                      type="submit" 
                      className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded text-xs transition"
                    >
                      File Issue
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setPendingPin(null)}
                      className="px-2 py-1.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </Popup>
          </Marker>
        )}

        {userLocation && (
          <Marker 
            position={userLocation}
            icon={userLocationIcon}
          >
            <Popup>
              <div className="p-1 font-sans text-xs bg-slate-950 text-slate-200 rounded border border-white/10">
                <span className="font-bold text-blue-400 block mb-0.5">
                  {lang === 'en' ? 'Your Current Location' : 'आपका वर्तमान स्थान'}
                </span>
                <p className="text-[10px] text-slate-400 leading-normal">
                  {userLocation[0].toFixed(5)}, {userLocation[1].toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Crowdsourced complaints markers layer */}
        {complaints.map((complaint) => {
          const lat = parseFloat(complaint.lat);
          const lng = parseFloat(complaint.lng);
          if (isNaN(lat) || isNaN(lng)) return null;

          const color = categoryColors[complaint.category] || '#10b981';
          const pClass = complaint.status === 'pending' ? 'pulsing-marker-red' : complaint.status === 'in-progress' ? 'pulsing-marker-amber' : 'pulsing-marker-teal';

          return (
            <Marker
              key={complaint._id || complaint.id}
              position={[lat, lng]}
              icon={createSvgIcon(color, pClass)}
            >
              <Popup>
                <div className="w-56 p-1 font-sans text-xs">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <span className="font-bold text-[13px] text-slate-100 truncate">{complaint.title}</span>
                    <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-extrabold border ${
                      complaint.status === 'resolved' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' :
                      complaint.status === 'in-progress' ? 'bg-amber-950/40 border-amber-500/30 text-amber-400' :
                      'bg-rose-950/40 border-rose-500/30 text-rose-400'
                    }`}>
                      {complaint.status}
                    </span>
                  </div>
                  
                  <div className="text-[10px] text-slate-400 mb-1 flex items-center justify-between">
                    <span className="uppercase font-semibold tracking-wider" style={{ color }}>{complaint.category}</span>
                    <span>{new Date(complaint.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>
                  
                  {complaint.description && <p className="text-[11px] text-slate-300 bg-white/5 p-1 rounded my-1.5">{complaint.description}</p>}

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5">
                    <button
                      onClick={() => handleUpvoteComplaint(complaint._id || complaint.id)}
                      className="flex items-center gap-1 px-2 py-1 bg-slate-900 border border-white/10 hover:border-emerald-500/40 hover:text-emerald-400 rounded transition text-[10px]"
                    >
                      <Navigation size={9} className="rotate-45" />
                      <span>Upvote ({complaint.votes || 0})</span>
                    </button>

                    {role !== 'public' && (
                      <div className="flex gap-1">
                        {complaint.status !== 'resolved' && (
                          <button
                            onClick={() => handleUpdateComplaintStatus(complaint._id || complaint.id, complaint.status === 'pending' ? 'in-progress' : 'resolved')}
                            className="p-1 bg-slate-900 hover:bg-slate-800 border border-white/10 text-emerald-400 rounded transition"
                            title={complaint.status === 'pending' ? 'Start Progress' : 'Resolve'}
                          >
                            <CheckCircle size={11} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Render Live Traffic Corridors on Active Layer */}
        {activeMapLayer === 'traffic' && shiftedTrafficCorridors.map((corridor, idx) => {
          const stats = getCorridorStatus(corridor);
          return (
            <Polyline 
              key={`traffic-road-${idx}`}
              positions={corridor.coords} 
              pathOptions={{
                color: stats.color, 
                weight: 6, 
                opacity: 0.85
              }} 
            >
              <Popup>
                <div className="p-1.5 font-sans text-xs bg-slate-950 text-slate-200 rounded border border-white/10 max-w-[200px]">
                  <span className="font-extrabold text-[12px] text-zinc-150 block mb-1">{corridor.name}</span>
                  <div className="flex flex-col gap-1 mt-1 border-t border-white/5 pt-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Flow Speed:</span>
                      <strong className="text-zinc-200">{stats.speed} km/h</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Delay:</span>
                      <strong style={{ color: stats.color }}>{stats.congestion}% Congestion</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className="font-bold" style={{ color: stats.color }}>{stats.label}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* Render Live Routing Path Polyline */}
        {activeRoute && activeRoute.coordinates && activeRoute.coordinates.length > 0 && (
          <>
            <Polyline 
              positions={activeRoute.coordinates} 
              pathOptions={{
                color: '#064e3b', 
                weight: 8, 
                opacity: 0.5
              }} 
            />
            <Polyline 
              positions={activeRoute.coordinates} 
              pathOptions={{
                color: '#10b981', 
                weight: 5, 
                opacity: 0.95
              }} 
            />
            
            {/* Start point marker */}
            <Marker 
              position={activeRoute.coordinates[0]}
              icon={L.divIcon({
                html: `<div class="relative w-8 h-8 flex items-center justify-center">
                        <div class="absolute w-5 h-5 rounded-full bg-emerald-500/40 animate-ping"></div>
                        <div class="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center font-mono text-[9px] font-black text-white shadow shadow-black">S</div>
                       </div>`,
                className: 'custom-routing-marker',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              })}
            >
              <Popup>
                <div className="p-1 font-sans text-xs bg-slate-950 text-slate-200 rounded border border-white/10">
                  <span className="font-bold text-emerald-400 block mb-0.5">Start Point</span>
                  <p className="text-[10px] text-slate-300 leading-normal">{activeRoute.startName}</p>
                </div>
              </Popup>
            </Marker>

            {/* Destination point marker */}
            <Marker 
              position={activeRoute.coordinates[activeRoute.coordinates.length - 1]}
              icon={L.divIcon({
                html: `<div class="relative w-8 h-8 flex items-center justify-center">
                        <div class="absolute w-5 h-5 rounded-full bg-rose-500/40 animate-ping"></div>
                        <div class="w-5 h-5 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center font-mono text-[9px] font-black text-white shadow shadow-black">D</div>
                       </div>`,
                className: 'custom-routing-marker',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              })}
            >
              <Popup>
                <div className="p-1 font-sans text-xs bg-slate-950 text-slate-200 rounded border border-white/10">
                  <span className="font-bold text-rose-400 block mb-0.5">Destination</span>
                  <p className="text-[10px] text-slate-300 leading-normal">{activeRoute.endName}</p>
                </div>
              </Popup>
            </Marker>
          </>
        )}
      </MapContainer>
      </div>
      </div>
    </div>
  );
}

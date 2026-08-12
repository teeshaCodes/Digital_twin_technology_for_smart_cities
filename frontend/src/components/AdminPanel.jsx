import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { Wind, Droplets, Sun, AlertTriangle, FileText, ChevronRight, Activity, Trash, Cpu, Battery, EyeOff } from 'lucide-react';

const cardTranslations = {
  en: {
    weatherTitle: 'Weather Telemetry',
    aqiTitle: 'Air Quality Index',
    trafficTitle: 'Transit Flow',
    alertsTitle: 'System Alert Logs',
    chartsTitle: 'System Analytical Forecasts',
    exportReport: 'Export CSV Report',
    wind: 'Wind',
    humidity: 'Humidity',
    feelsLike: 'Feels Like',
    pm25: 'PM2.5',
    pm10: 'PM10',
    delay: 'Traffic Delay',
    flowSpeed: 'Flow Speed',
    incidents: 'Incidents',
    infrastructure: 'Smart Infrastructure Feeds',
    infrastructureDesc: 'Sensors updating dynamically from Indian Smart City Portals.',
    binFill: 'Waste Bins Full',
    powerRenew: 'Grid Renewable Share',
    waterPh: 'Water pH Level',
    parkingOcc: 'Parking Occupancy',
    viewZones: 'Active Boundary Restrictions'
  },
  hi: {
    weatherTitle: 'मौसम टेलीमेट्री',
    aqiTitle: 'वायु गुणवत्ता सूचकांक',
    trafficTitle: 'यातायात प्रवाह',
    alertsTitle: 'सिस्टम चेतावनी लॉग',
    chartsTitle: 'सिस्टम विश्लेषणात्मक पूर्वानुमान',
    exportReport: 'सीएसवी रिपोर्ट निर्यात करें',
    wind: 'हवा',
    humidity: 'आर्द्रता',
    feelsLike: 'महसूस',
    pm25: 'पीएम २.५',
    pm10: 'पीएम १०',
    delay: 'यातायात देरी',
    flowSpeed: 'प्रवाह गति',
    incidents: 'दुर्घटनाएं',
    infrastructure: 'स्मार्ट अवसंरचना सेंसर',
    infrastructureDesc: 'भारतीय स्मार्ट सिटी पोर्टल से सेंसर डेटा लगातार अपडेट हो रहा है।',
    binFill: 'कचरा डिब्बे भरे',
    powerRenew: 'ग्रिड नवीकरणीय हिस्सा',
    waterPh: 'जल पीएच स्तर',
    parkingOcc: 'पार्किंग व्यस्तता',
    viewZones: 'सक्रिय प्रतिबंध क्षेत्र'
  }
};

export default function AdminPanel({
  role,
  weatherData,
  aqiData,
  trafficData,
  smartCityData,
  historyData,
  forecastData,
  alerts,
  zones,
  lang,
  onZoneDeleted
}) {
  const [chartType, setChartType] = useState('aqi'); // aqi, traffic, temp
  const t = cardTranslations[lang];

  // Helper: Compile Recharts data combining history (solid) and ML predictions (dashed)
  const getCombinedChartData = () => {
    if (!historyData) return [];

    let histArr = [];
    let forecastArr = [];
    
    if (chartType === 'aqi') {
      histArr = historyData.aqi || [];
      forecastArr = forecastData ? forecastData.aqi_predictions || [] : [];
    } else if (chartType === 'traffic') {
      histArr = historyData.traffic || [];
      forecastArr = forecastData ? forecastData.traffic_predictions || [] : [];
    } else {
      histArr = historyData.weather || [];
      // Weather uses simple offset prediction
      forecastArr = [];
      const currentTemp = weatherData ? weatherData.temp : 30;
      const startHour = new Date().getHours();
      for (let i = 1; i <= 12; i++) {
        const h = (startHour + i) % 24;
        forecastArr.push({
          time: `${h.toString().padStart(2, '0')}:00`,
          value: Math.round(currentTemp + Math.sin((h / 24) * 2 * Math.PI) * 4)
        });
      }
    }

    // Merge history array (representing the past) and predictions array (representing the future)
    const points = histArr.map(h => ({
      name: h.time,
      "Recorded Value": h.value,
      "ML Forecast": null
    }));

    // Insert prediction points
    const lastHistVal = points.length > 0 ? points[points.length - 1]["Recorded Value"] : null;
    
    // Connect the prediction line beginning at the last historical value
    const forecastPoints = forecastArr.map((f, index) => ({
      name: f.time,
      "Recorded Value": null,
      "ML Forecast": f.value
    }));

    if (lastHistVal !== null && forecastPoints.length > 0) {
      forecastPoints[0]["Recorded Value"] = lastHistVal;
      forecastPoints[0]["ML Forecast"] = lastHistVal;
    }

    return [...points.slice(-15), ...forecastPoints];
  };

  // CSV compiler download engine
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Timestamp,Report Type,Value,Metric Details\n";
    
    // Aggregate weather history
    if (historyData && historyData.weather) {
      historyData.weather.forEach(w => {
        csvContent += `"${w.timestamp}","Weather Temperature",${w.value},"Feels Like: ${weatherData?.feels_like || 0}°C | Humidity: ${weatherData?.humidity || 0}%"\n`;
      });
    }

    // Aggregate AQI history
    if (historyData && historyData.aqi) {
      historyData.aqi.forEach(a => {
        csvContent += `"${a.timestamp}","Air Quality Index",${a.value},"PM2.5: ${aqiData?.pm25 || 0}µg/m³ | PM10: ${aqiData?.pm10 || 0}µg/m³"\n`;
      });
    }

    // Aggregate Traffic history
    if (historyData && historyData.traffic) {
      historyData.traffic.forEach(tf => {
        csvContent += `"${tf.timestamp}","Traffic Congestion Level",${tf.value},"Current Speed: ${trafficData?.currentSpeed || 0}km/h | Delays: ${trafficData?.delay || 0}mins"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `urbanpulse_digitaltwin_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAqiColor = (val) => {
    if (val > 200) return 'text-rose-500';
    if (val > 100) return 'text-amber-500';
    return 'text-emerald-400';
  };

  const getAqiGlow = (val) => {
    if (val > 200) return 'bg-rose-500/10 border-rose-500/20';
    if (val > 100) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-emerald-500/5 border-emerald-500/10';
  };

  const getTrafficColorClass = (level) => {
    if (level > 70) return 'text-red-400';
    if (level > 40) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const getTrafficBgClass = (level) => {
    if (level > 70) return 'bg-rose-500/5 border-rose-500/10';
    if (level > 40) return 'bg-amber-500/5 border-amber-500/10';
    return 'bg-emerald-500/5 border-emerald-500/10';
  };

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 w-full text-slate-100">
      {/* Row 1: City Overview Live Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Weather Telemetry Card */}
        {weatherData && (
          <div className="glass-card glass-card-hover p-5 rounded-2xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">{t.weatherTitle}</span>
              <Sun className="text-amber-400 animate-spin-slow" size={18} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-white">{weatherData.temp}°C</span>
              <span className="text-xs text-slate-400">{weatherData.condition}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/5 text-[11px]">
              <div>
                <p className="text-slate-500">{t.feelsLike}</p>
                <p className="font-bold text-slate-300">{weatherData.feels_like}°C</p>
              </div>
              <div>
                <p className="text-slate-500">{t.humidity}</p>
                <p className="font-bold text-slate-300">{weatherData.humidity}%</p>
              </div>
              <div>
                <p className="text-slate-500">{t.wind}</p>
                <p className="font-bold text-slate-300">{weatherData.wind_speed} m/s</p>
              </div>
            </div>
          </div>
        )}

        {/* AQI Live Card */}
        {aqiData && (
          <div className={`glass-card glass-card-hover p-5 rounded-2xl border transition-all duration-500 ${getAqiGlow(aqiData.aqi)}`}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">{t.aqiTitle}</span>
              <Activity className={`${getAqiColor(aqiData.aqi)}`} size={18} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold tracking-tight ${getAqiColor(aqiData.aqi)}`}>
                {aqiData.aqi}
              </span>
              <span className="text-xs text-slate-400">{aqiData.status}</span>
            </div>
            <div className="grid grid-cols-4 gap-1 mt-4 pt-3 border-t border-white/5 text-[10px]">
              <div>
                <p className="text-slate-500">{t.pm25}</p>
                <p className="font-bold text-slate-300">{aqiData.pm25} µg</p>
              </div>
              <div>
                <p className="text-slate-500">{t.pm10}</p>
                <p className="font-bold text-slate-300">{aqiData.pm10} µg</p>
              </div>
              <div>
                <p className="text-slate-500">NO₂</p>
                <p className="font-bold text-slate-300">{aqiData.no2} ppb</p>
              </div>
              <div>
                <p className="text-slate-500">CO</p>
                <p className="font-bold text-slate-300">{aqiData.co} ppm</p>
              </div>
            </div>
          </div>
        )}

        {/* Traffic Live Card */}
        {trafficData && (
          <div className="glass-card glass-card-hover p-5 rounded-2xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">{t.trafficTitle}</span>
              <div className={`p-4 rounded-xl border flex flex-col justify-between h-[100px] ${getTrafficBgClass(trafficData.level)}`}>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t.trafficTitle}</span>
                <span className={`text-xl font-extrabold mt-1 ${getTrafficColorClass(trafficData.level)}`}>
                  {trafficData.level}% {t.congestion}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/5 text-[11px]">
              <div>
                <p className="text-slate-500">{t.flowSpeed}</p>
                <p className="font-bold text-slate-300">{trafficData.currentSpeed} km/h</p>
              </div>
              <div>
                <p className="text-slate-500">{t.delay}</p>
                <p className="font-bold text-slate-300">+{trafficData.delay} mins</p>
              </div>
              <div>
                <p className="text-slate-500">{t.incidents}</p>
                <p className="font-bold text-slate-300">{trafficData.activeIncidents} active</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Row 2: Analytics & Smart Infrastructure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Recharts Graph Widget (Takes 2 Columns on lg screens) */}
        <div className="lg:col-span-2 glass-card p-5 rounded-2xl border border-white/5">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">{t.chartsTitle}</span>
            <div className="flex bg-slate-900 border border-white/10 rounded-lg p-0.5 self-start">
              {['aqi', 'traffic', 'temp'].map(type => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`text-[10px] font-bold px-3 py-1 rounded capitalize transition-all ${
                    chartType === type 
                      ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/30' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {type === 'temp' ? 'Weather' : type}
                </button>
              ))}
            </div>
          </div>

          {/* Combined Historical & ML Forecast Chart */}
          <div className="h-64 w-full text-[9px] -ml-4 pr-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getCombinedChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ background: '#090d16', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelClassName="text-slate-400 font-bold"
                />
                <Legend wrapperStyle={{ paddingTop: '8px' }} />
                <Line 
                  name="Telemetry (Solid)" 
                  type="monotone" 
                  dataKey="Recorded Value" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                />
                <Line 
                  name="ML Forecast (Dashed)" 
                  type="monotone" 
                  dataKey="ML Forecast" 
                  stroke="#ef4444" 
                  strokeWidth={1.5}
                  strokeDasharray="5 5" 
                  dot={{ r: 1 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 text-center italic">
            Model: {forecastData ? forecastData.model_info : 'Heuristic Drift Fallback Model'}
          </p>
        </div>

        {/* Indian Smart City Portals Feeds (Takes 1 Column on lg screens) */}
        <div className="lg:col-span-1">
          {smartCityData && (
            <div className="glass-card p-5 rounded-2xl border border-white/5 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="text-emerald-400 animate-pulse" size={16} />
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-300">{t.infrastructure}</span>
                </div>
                <p className="text-[10px] text-slate-500 mb-4">{t.infrastructureDesc}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-[11px] flex-1">
                {/* Waste bin status */}
                <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                  <span className="text-[9px] text-slate-400 uppercase font-semibold leading-tight">{t.binFill}</span>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-white text-lg font-extrabold">
                      {smartCityData.waste?.filter(bin => bin.fillLevel > 80).length || 0}
                    </span>
                    <span className="text-[9px] text-slate-500">bins &gt; 80%</span>
                  </div>
                </div>

                {/* Grid renewable */}
                <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                  <span className="text-[9px] text-slate-400 uppercase font-semibold leading-tight">{t.powerRenew}</span>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-teal-400 text-lg font-extrabold">
                      {smartCityData.energy?.renewablePercentage || 0}%
                    </span>
                    <Battery size={13} className="text-teal-500 animate-pulse" />
                  </div>
                </div>

                {/* Water Quality pH */}
                <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                  <span className="text-[9px] text-slate-400 uppercase font-semibold leading-tight">{t.waterPh}</span>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-blue-400 text-lg font-extrabold">
                      {smartCityData.water?.ph || 7.0}
                    </span>
                    <span className="text-[8px] px-1 bg-blue-950/40 rounded border border-blue-500/20 text-blue-300 font-semibold uppercase">
                      {smartCityData.water?.safetyStatus || 'Safe'}
                    </span>
                  </div>
                </div>

                {/* Parking spots availability */}
                <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                  <span className="text-[9px] text-slate-400 uppercase font-semibold leading-tight">{t.parkingOcc}</span>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-white text-lg font-extrabold">
                      {smartCityData.parking ? Math.round(
                        (smartCityData.parking.reduce((sum, p) => sum + p.occupiedSpots, 0) /
                         smartCityData.parking.reduce((sum, p) => sum + p.totalSpots, 1)) * 100
                      ) : 0}%
                    </span>
                    <span className="text-[9px] text-slate-500">Occupied</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Logs, Zones, and Exports */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* System Warning Logs (Left Column) */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col min-h-[220px]">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="text-rose-400 animate-bounce" size={16} />
            <span className="text-xs uppercase font-bold tracking-wider text-slate-300">{t.alertsTitle}</span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-48 pr-1 flex flex-col gap-2">
            {alerts.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center my-auto">No alerts reported. All parameters normal.</p>
            ) : (
              alerts.map((al, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 border rounded-xl flex items-start gap-2 text-[11px] ${
                    al.level === 'critical' 
                      ? 'bg-rose-950/40 border-rose-500/30 text-rose-300' 
                      : al.level === 'warning' 
                        ? 'bg-amber-950/40 border-amber-500/30 text-amber-300' 
                        : 'bg-blue-950/40 border-blue-500/20 text-blue-300'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    <AlertTriangle size={12} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-bold uppercase text-[9px]">{al.type}</span>
                      <span className="text-[9px] opacity-60">
                        {new Date(al.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="leading-relaxed">{al.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Admin Restriction Zones List (Center Column) */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col min-h-[220px]">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-300 block mb-3">{t.viewZones} ({zones.length})</span>
          <div className="flex-1 overflow-y-auto max-h-48 pr-1 flex flex-col gap-2">
            {zones.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center my-auto">No active restricted zones created.</p>
            ) : (
              zones.map((zone) => {
                const borderCol = zone.severity === 'high' ? 'border-rose-500/25 bg-rose-950/20' : zone.severity === 'medium' ? 'border-amber-500/25 bg-amber-950/20' : 'border-blue-500/25 bg-blue-950/20';
                const textCol = zone.severity === 'high' ? 'text-rose-400' : zone.severity === 'medium' ? 'text-amber-400' : 'text-blue-400';
                return (
                  <div key={zone._id || zone.id} className={`flex justify-between items-center text-[11px] p-2.5 border rounded-xl ${borderCol}`}>
                    <div>
                      <span className="font-bold text-slate-200 block">{zone.name}</span>
                      <span className="text-[9px] uppercase font-semibold text-slate-400">{zone.type} ({zone.severity})</span>
                    </div>
                    <button 
                      onClick={() => {
                        fetch(`/api/admin/zones/${zone._id || zone.id}`, { method: 'DELETE' }).then(() => onZoneDeleted());
                      }}
                      className="p-1.5 bg-slate-900 border border-white/5 hover:border-rose-500/30 text-rose-400 hover:text-white rounded-lg transition"
                      title="Delete restriction"
                    >
                      <Trash size={11} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CSV Report Export Action Call & Summary Stats (Right Column) */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between min-h-[220px]">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-slate-300 block mb-2">Export Telemetry</span>
            <p className="text-[10px] text-slate-500 leading-normal">
              Downloads a comma-separated CSV log of all recorded database indicators (Temperature, Air Quality, Traffic Congestion).
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-[1.01] hover:brightness-105 active:scale-95 transition-all text-xs"
          >
            <FileText size={15} />
            <span>{t.exportReport}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

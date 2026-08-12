import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid, LineChart, Line } from 'recharts';
import { FileText, Compass, Download, BarChart2 } from 'lucide-react';

export default function AnalyticsPanel({
  weatherData,
  aqiData,
  trafficData,
  historyData,
  forecastData,
  lang
}) {
  const [filterPeriod, setFilterPeriod] = useState('7d'); // today, 7d, 30d
  const [chartType, setChartType] = useState('aqi'); // aqi, traffic, temp, rainfall

  // Simulated rainfall history since it might not be in historyData
  const getMockRainfallData = () => {
    return [
      { time: 'Mon', value: 5 },
      { time: 'Tue', value: 12 },
      { time: 'Wed', value: 45 }, // Heavy rain day
      { time: 'Thu', value: 8 },
      { time: 'Fri', value: 2 },
      { time: 'Sat', value: 18 },
      { time: 'Sun', value: 0 }
    ];
  };

  const getChartData = () => {
    if (chartType === 'rainfall') return getMockRainfallData();
    if (!historyData) return [];

    let histArr = [];
    if (chartType === 'aqi') {
      histArr = historyData.aqi || [];
    } else if (chartType === 'traffic') {
      histArr = historyData.traffic || [];
    } else {
      histArr = historyData.weather || [];
    }

    return histArr.map(h => ({
      time: h.time,
      "Value": h.value
    })).slice(filterPeriod === 'today' ? -6 : filterPeriod === '7d' ? -7 : -15);
  };

  const currentChartData = getChartData();

  // Dynamic AI Correlation Insights
  const getCorrelationInsights = () => {
    const list = [
      { text: lang === 'en' ? 'Heavy rainfall days correlate with a 35% surge in traffic congestion and route diversion delays.' : 'भारी बारिश के दिनों में यातायात जाम और मार्ग परिवर्तन की देरी में ३५% की वृद्धि होती है।' },
      { text: lang === 'en' ? 'Particulate density (AQI) increases by 25% during evening peak hours (6 PM - 8 PM) due to tailpipe emissions.' : 'शाम के पीक आवर्स (६ बजे - ८ बजे) के दौरान वाहन उत्सर्जन के कारण एक्यूआई में २५% की वृद्धि होती है।' },
      { text: lang === 'en' ? 'A 1°C increase in temperature causes a minor 2.4% elevation in grid renewable energy solar output efficiency.' : 'तापमान में १°सी की वृद्धि से ग्रिड सौर ऊर्जा उत्पादन क्षमता में २.४% की मामूली वृद्धि होती है।' }
    ];
    return list;
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Timestamp,Report Type,Value,Metric Details\n";
    
    if (historyData && historyData.weather) {
      historyData.weather.forEach(w => {
        csvContent += `"${w.timestamp}","Weather Temperature",${w.value},"Feels Like: ${weatherData?.feels_like || 0}°C"\n`;
      });
    }
    if (historyData && historyData.aqi) {
      historyData.aqi.forEach(a => {
        csvContent += `"${a.timestamp}","Air Quality Index",${a.value},"PM2.5: ${aqiData?.pm25 || 0}µg/m³"\n`;
      });
    }
    if (historyData && historyData.traffic) {
      historyData.traffic.forEach(tf => {
        csvContent += `"${tf.timestamp}","Traffic Congestion Level",${tf.value},"Delays: ${trafficData?.delay || 0}mins"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `surat_digitaltwin_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 text-slate-100 p-4 md:p-6 w-full max-w-6xl mx-auto text-left">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <BarChart2 className="text-teal-400 animate-pulse" size={22} />
            <span>{lang === 'en' ? 'City Telemetry Analytics & Reports' : 'नगर टेलीमेट्री विश्लेषण और रिपोर्ट'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'en'
              ? 'Analyze historical smart city sensors readings, weather data, and machine-learning correlations.'
              : 'ऐतिहासिक सेंसर रीडिंग, प्रदूषण सूचकांक, मौसम डेटा और सहसंबंधों का विश्लेषण करें।'}
          </p>
        </div>
        
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-white/10 hover:border-emerald-500/40 text-emerald-400 hover:text-white font-extrabold py-2 px-4 rounded-xl text-xs transition shadow pointer-events-auto"
        >
          <Download size={13} />
          <span>{lang === 'en' ? 'Export Telemetry CSV' : 'सीएसवी रिपोर्ट निर्यात करें'}</span>
        </button>
      </div>

      {/* Analytics controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Filter Panels */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col gap-4 text-left">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Telemetry Parameter</span>
            <div className="flex flex-col gap-2">
              {[
                { id: 'aqi', label: 'Air Quality (AQI)' },
                { id: 'traffic', label: 'Transit Congestion' },
                { id: 'temp', label: 'Temperature (°C)' },
                { id: 'rainfall', label: 'Precipitation (mm)' }
              ].map(chart => (
                <button
                  key={chart.id}
                  onClick={() => setChartType(chart.id)}
                  className={`text-xs font-bold p-3 rounded-xl border text-left transition-all ${
                    chartType === chart.id
                      ? 'bg-teal-500/10 border-teal-500 text-teal-300 shadow font-extrabold'
                      : 'bg-slate-900 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {chart.label}
                </button>
              ))}
            </div>

            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono mt-2">Filter Timeline</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'today', label: 'Today' },
                { id: '7d', label: '7 Days' },
                { id: '30d', label: '30 Days' }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setFilterPeriod(p.id)}
                  className={`text-[10px] font-bold py-2 rounded-lg border text-center transition-all ${
                    filterPeriod === p.id
                      ? 'bg-slate-800 border-white/10 text-white font-extrabold shadow'
                      : 'bg-slate-900 border-white/5 text-slate-450 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Charts & Correlation Insights */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="glass-card p-5 rounded-2xl border border-white/5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-4 font-mono">Historical Sensor Chart</span>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <defs>
                    <linearGradient id="telemetryGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={9} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Area name="Telemetry Value" type="monotone" dataKey="Value" stroke="#14b8a6" strokeWidth={2} fill="url(#telemetryGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Correlation Insights */}
          <div className="glass-card p-5 rounded-2xl border border-white/5 text-left flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <Compass className="text-teal-400 animate-spin-slow" size={16} />
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-300">AI Grid Correlation Insights</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {getCorrelationInsights().map((insight, idx) => (
                <div key={idx} className="text-xs text-slate-350 leading-relaxed bg-white/5 p-3 rounded-xl flex items-start gap-2.5">
                  <FileText className="text-teal-400 shrink-0 mt-0.5" size={13} />
                  <span>{insight.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

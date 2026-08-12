import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Info, Bell, CheckCircle } from 'lucide-react';

export default function AlertCenter({ alerts, lang }) {
  const [activeCategory, setActiveCategory] = useState('all');

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <ShieldAlert className="text-rose-400 shrink-0" size={18} />;
      case 'warning':
        return <AlertTriangle className="text-amber-400 shrink-0" size={18} />;
      case 'advisory':
        return <AlertTriangle className="text-yellow-400 shrink-0" size={18} />;
      default:
        return <Info className="text-blue-400 shrink-0" size={18} />;
    }
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-500/10 border-rose-500/25 text-rose-300';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/25 text-amber-300';
      case 'advisory':
        return 'bg-yellow-500/5 border-yellow-500/20 text-yellow-300';
      default:
        return 'bg-blue-500/5 border-blue-500/20 text-blue-300';
    }
  };

  const currentAlerts = alerts && alerts.length > 0 ? alerts : [
    { id: '1', category: 'weather', severity: 'warning', message: 'High heat index advisory: temperatures touching 38°C in Varachha industrial sector. Drink water.', timestamp: new Date() },
    { id: '2', category: 'aqi', severity: 'critical', message: 'PM2.5 threshold crossed (255 µg/m³) near Surat Railway station. Wearing air masks is recommended.', timestamp: new Date(Date.now() - 3600000) },
    { id: '3', category: 'flood', severity: 'advisory', message: 'Tide gauge reporting minor high-tide overflow risk near Dumas Road underpasses by 6:00 PM.', timestamp: new Date(Date.now() - 7200000) },
    { id: '4', category: 'traffic', severity: 'warning', message: 'Arterial logjam reported on Dumas Road (Piplod to Dumas) due to minor crash. Rerouting active.', timestamp: new Date(Date.now() - 10800000) }
  ];

  const filteredAlerts = activeCategory === 'all' 
    ? currentAlerts 
    : currentAlerts.filter(al => al.category === activeCategory);

  return (
    <div className="flex flex-col gap-6 text-slate-100 p-4 md:p-6 w-full max-w-4xl mx-auto text-left">
      <div>
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Bell className="text-rose-400 animate-bounce" size={22} />
          <span>{lang === 'en' ? 'Smart City Alert Center' : 'स्मार्ट सिटी अलर्ट सेंटर'}</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {lang === 'en'
            ? 'Real-time diagnostic warnings parsed by city Command & Control alert engines.'
            : 'वास्तविक समय चेतावनी और आपदा प्रबंधन संदेश।'}
        </p>
      </div>

      {/* Category selector filter chips */}
      <div className="flex flex-wrap gap-2 pointer-events-auto border-b border-white/5 pb-3">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'weather', label: 'Weather' },
          { id: 'aqi', label: 'Air Quality' },
          { id: 'traffic', label: 'Traffic Flow' },
          { id: 'flood', label: 'Flood Risk' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
              activeCategory === cat.id
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 shadow shadow-rose-500/5'
                : 'bg-slate-900 border-white/5 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Alerts logs list */}
      <div className="flex flex-col gap-3">
        {filteredAlerts.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl border border-white/5 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
            <CheckCircle size={30} className="text-emerald-500/60" />
            <p className="text-sm font-semibold">City telemetry index is stable.</p>
            <p className="text-xs mt-0.5">No warnings or critical advisories registered on the dashboard.</p>
          </div>
        ) : (
          filteredAlerts.map((al) => (
            <div key={al.id} className={`p-4 border rounded-2xl flex items-start gap-4 transition shadow-md ${getSeverityStyle(al.severity)} hover:border-white/10`}>
              {getAlertIcon(al.severity)}
              <div className="flex-1 text-xs">
                <div className="flex justify-between items-baseline font-bold">
                  <span className="uppercase text-[9px] tracking-wider opacity-60 font-mono">{al.category} Alert</span>
                  <span className="text-[8px] opacity-50 font-mono">{new Date(al.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="mt-1 leading-relaxed text-slate-200 font-semibold">{al.message}</p>
                <div className="flex justify-between items-center mt-2.5 pt-1.5 border-t border-white/5 text-[9px] opacity-70 uppercase font-mono">
                  <span>Scope: Surat Grid Node</span>
                  <span>Severity: <strong className="underline">{al.severity}</strong></span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

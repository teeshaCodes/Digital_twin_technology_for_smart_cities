import React from 'react';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';

export default function AlertBanner({ alerts, lang }) {
  // If there are no alerts, render a reassuring baseline banner
  if (!alerts || alerts.length === 0) {
    return (
      <div className="h-7 shrink-0 bg-zinc-900 border-b border-white/5 flex items-center justify-center gap-1.5 px-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider select-none">
        <Info size={11} className="text-emerald-400" />
        <span>Digital Twin Connected: Monitoring Live Telemetry</span>
      </div>
    );
  }

  // Combine alert messages into a continuous scrollable marquee string
  const marqueeText = alerts.map(al => `[${al.type.toUpperCase()}] ${al.message}`).join('    •    ');

  // Find the highest severity alert
  const hasCritical = alerts.some(al => al.level === 'critical');

  return (
    <div className={`h-8 shrink-0 flex items-center border-b select-none overflow-hidden text-[11px] font-extrabold tracking-wide ${
      hasCritical 
        ? 'bg-rose-950/80 border-rose-500/20 text-rose-300' 
        : 'bg-amber-950/80 border-amber-500/20 text-amber-300'
    }`}>
      {/* Static indicator badge */}
      <div className={`h-full px-3 flex items-center gap-1 shrink-0 z-10 ${
        hasCritical ? 'bg-rose-900 text-white' : 'bg-amber-600 text-slate-950'
      }`}>
        <AlertTriangle size={12} className={hasCritical ? 'animate-bounce' : 'animate-pulse'} />
        <span className="uppercase text-[9px] tracking-wider">
          {lang === 'en' ? 'Live Alert Ticker' : 'चेतावनी फीड'}
        </span>
      </div>
      
      {/* Marquee Ticker */}
      <div className="flex-1 relative overflow-hidden flex items-center">
        <div className="whitespace-nowrap animate-marquee flex items-center pr-20">
          <span className="inline-block pl-5">{marqueeText}</span>
          <span className="inline-block pl-[25%]">{marqueeText}</span>
        </div>
      </div>

      {/* Styled animation helper for marquee scroll */}
      <style>{`
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

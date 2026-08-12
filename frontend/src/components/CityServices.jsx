import React from 'react';
import { Truck, Bus, Activity, Battery, Sun, Wind, MapPin } from 'lucide-react';

export default function CityServices({ smartCityData, trafficData, lang }) {
  const parkingData = smartCityData?.parking || [
    { zoneId: 'Zone A (Adajan)', totalSpots: 150, occupiedSpots: 110 },
    { zoneId: 'Zone B (Varachha)', totalSpots: 200, occupiedSpots: 85 },
    { zoneId: 'Zone C (Piplod)', totalSpots: 120, occupiedSpots: 95 },
    { zoneId: 'Zone D (Katargam)', totalSpots: 300, occupiedSpots: 180 },
    { zoneId: 'Zone E (Vesu)', totalSpots: 80, occupiedSpots: 75 }
  ];

  const wasteBins = smartCityData?.waste || [
    { binId: 'BIN-001', fillLevel: 35, zoneId: 'Zone A (Adajan)' },
    { binId: 'BIN-002', fillLevel: 78, zoneId: 'Zone B (Varachha)' },
    { binId: 'BIN-003', fillLevel: 12, zoneId: 'Zone C (Piplod)' },
    { binId: 'BIN-004', fillLevel: 55, zoneId: 'Zone D (Katargam)' },
    { binId: 'BIN-005', fillLevel: 89, zoneId: 'Zone E (Vesu)' }
  ];

  const energy = smartCityData?.energy || {
    totalLoadMwh: 92.4,
    renewablePercentage: 42.5,
    zoneStatus: [
      { zoneId: 'Zone A', gridLoad: 'Normal', outage: false },
      { zoneId: 'Zone B', gridLoad: 'Peak Load', outage: false },
      { zoneId: 'Zone C', gridLoad: 'Normal', outage: false },
      { zoneId: 'Zone D', gridLoad: 'Normal', outage: false }
    ]
  };

  const transitBuses = [
    { id: 'BUS-102', route: 'Piplod to Dumas Road', status: 'On Route', eta: '5 mins', delay: '2 mins', speed: '35 km/h' },
    { id: 'BUS-204', route: 'Majura Gate to Surat Station', status: 'Delayed', eta: '18 mins', delay: '9 mins', speed: '12 km/h' },
    { id: 'BUS-408', route: 'Varachha Sector Loop', status: 'On Route', eta: '3 mins', delay: '0 mins', speed: '28 km/h' },
    { id: 'BUS-501', route: 'Katargam to Adajan Center', status: 'On Route', eta: '12 mins', delay: '3 mins', speed: '40 km/h' }
  ];

  return (
    <div className="flex flex-col gap-6 text-slate-100 p-4 md:p-6 w-full max-w-7xl mx-auto text-left">
      <div>
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Activity className="text-teal-400 animate-pulse" size={22} />
          <span>{lang === 'en' ? 'Smart Infrastructure & City Services' : 'स्मार्ट बुनियादी ढांचा और शहर सेवाएं'}</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {lang === 'en'
            ? 'IoT feeds monitoring parking capacity, mass transit logistics, ecological waste bins, and power consumption.'
            : 'पार्किंग क्षमता, सार्वजनिक परिवहन, कचरा निस्तारण और ग्रिड बिजली खपत की लाइव स्थिति।'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: Smart Parking Slots */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-300">{lang === 'en' ? 'Smart Parking Lots' : 'स्मार्ट पार्किंग स्लॉट'}</span>
            <span className="text-[9px] uppercase font-bold text-teal-400 tracking-wider font-mono">Live Slot Telemetry</span>
          </div>
          <div className="flex flex-col gap-3">
            {parkingData.map((pk, idx) => {
              const freeSpots = pk.totalSpots - pk.occupiedSpots;
              const occPct = Math.round((pk.occupiedSpots / pk.totalSpots) * 100);
              const colorClass = occPct > 85 ? 'bg-rose-500' : occPct > 60 ? 'bg-amber-500' : 'bg-emerald-400';
              return (
                <div key={idx} className="bg-slate-950/40 border border-white/5 p-3 rounded-xl flex flex-col gap-1.5 hover:border-white/10 transition">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-bold text-slate-200">{pk.zoneId}</span>
                    <span className="font-mono text-slate-400">
                      <strong>{freeSpots}</strong> / {pk.totalSpots} spots free
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden relative">
                    <div className={`h-full ${colorClass} transition-all duration-500`} style={{ width: `${occPct}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-semibold font-mono uppercase">
                    <span>Occupancy: {occPct}%</span>
                    <span>{pk.occupiedSpots} Occupied</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Module 2: Public transport Log */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-300">{lang === 'en' ? 'Live Mass Transit Fleet' : 'लाइव सार्वजनिक परिवहन बेड़ा'}</span>
            <span className="text-[9px] uppercase font-bold text-amber-400 tracking-wider font-mono flex items-center gap-1">
              <Bus size={10} className="animate-bounce" />
              <span>Surat City Link</span>
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {transitBuses.map((bus, idx) => (
              <div key={idx} className="bg-slate-950/40 border border-white/5 p-3.5 rounded-xl flex items-center justify-between hover:border-white/10 transition">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    bus.status === 'Delayed' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {bus.id}
                  </div>
                  <div className="text-left text-xs">
                    <span className="font-bold text-slate-200 block">{bus.route}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">Velocity: {bus.speed}</span>
                  </div>
                </div>
                <div className="text-right text-[11px]">
                  <span className={`font-bold block ${bus.status === 'Delayed' ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                    ETA {bus.eta}
                  </span>
                  <span className="text-[9px] text-slate-500 block font-mono">Delay: {bus.delay}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module 3: Ecological Waste Management */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-300">{lang === 'en' ? 'Ecological Smart Bins' : 'पारिस्थितिक स्मार्ट कचरा डिब्बे'}</span>
            <span className="text-[9px] uppercase font-bold text-purple-400 tracking-wider font-mono flex items-center gap-1">
              <Truck size={10} />
              <span>Waste Collection Feed</span>
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {wasteBins.map((bin, idx) => {
              const isFull = bin.fillLevel > 80;
              return (
                <div key={idx} className="bg-slate-950/40 border border-white/5 p-3.5 rounded-xl flex flex-col gap-2 hover:border-white/10 transition">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-slate-200">{bin.binId}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                      isFull ? 'bg-rose-950/40 border-rose-500/30 text-rose-400' : 'bg-slate-900 border-white/5 text-slate-400'
                    }`}>
                      {isFull ? 'Alert: Overflow' : 'Operational'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 bg-slate-900 h-14 rounded border border-white/10 relative overflow-hidden flex items-end">
                      <div className={`w-full transition-all duration-700 ${
                        bin.fillLevel > 80 ? 'bg-rose-500' : bin.fillLevel > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} style={{ height: `${bin.fillLevel}%` }}></div>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-black text-slate-100 mix-blend-difference">{bin.fillLevel}%</span>
                    </div>
                    <div className="text-left text-[11px] text-slate-400">
                      <p className="font-semibold text-slate-300">{bin.zoneId}</p>
                      <p className="text-[10px] mt-1">Status: {bin.fillLevel > 80 ? 'Collection Dispatched' : 'Idle'}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Module 4: Energy Grid Monitor */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-300">{lang === 'en' ? 'Smart Power Grid Load' : 'स्मार्ट पावर ग्रिड लोड'}</span>
            <span className="text-[9px] uppercase font-bold text-amber-500 tracking-wider font-mono flex items-center gap-1">
              <Battery size={12} className="animate-pulse" />
              <span>92.4 MW Demand</span>
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/40 border border-white/5 p-4 rounded-xl flex items-center gap-3">
              <Sun size={24} className="text-amber-400 animate-spin-slow" />
              <div className="text-left">
                <span className="text-[9px] text-slate-500 font-bold block uppercase">Renewable Share</span>
                <span className="text-base font-black text-white font-mono">{energy.renewablePercentage}%</span>
              </div>
            </div>
            <div className="bg-slate-950/40 border border-white/5 p-4 rounded-xl flex items-center gap-3">
              <Wind size={24} className="text-teal-400 animate-pulse" />
              <div className="text-left">
                <span className="text-[9px] text-slate-500 font-bold block uppercase">Wind/Solar Load</span>
                <span className="text-base font-black text-white font-mono">38.2 MW</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-1">
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block mb-0.5">Area Grid Loads</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {energy.zoneStatus.map((z, idx) => (
                <div key={idx} className="bg-slate-950/40 border border-white/5 p-2.5 rounded-lg text-center">
                  <span className="text-[10px] text-slate-300 font-bold block">{z.zoneId}</span>
                  <span className={`text-[9px] font-bold mt-1 inline-block px-1.5 py-0.5 rounded ${
                    z.gridLoad === 'Peak Load' ? 'bg-amber-950/40 text-amber-400 border border-amber-500/20' : 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {z.gridLoad}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

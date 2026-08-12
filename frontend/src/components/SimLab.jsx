import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Cpu, HelpCircle, RefreshCw, ShieldAlert } from 'lucide-react';

const simulationScenarios = [
  {
    id: 'rain',
    title: 'Rainfall Increases (+50%)',
    titleHi: 'भारी बारिश (+५०%)',
    description: 'Simulates intensive monsoon precipitation causing drainage saturation and localized flooding risks.',
    descriptionHi: 'जल निकासी संतृप्ति और स्थानीय बाढ़ के खतरों के कारण भारी मानसूनी वर्षा का अनुकरण करता है।',
    impacts: [
      { metric: 'Flood Risk', before: 15, after: 75, unit: '%' },
      { metric: 'Waterlogging Areas', before: 2, after: 14, unit: ' Zones' },
      { metric: 'Avg Commute Delays', before: 8, after: 35, unit: ' mins' },
      { metric: 'Road Accessibility', before: 98, after: 68, unit: '%' }
    ],
    aiAnalysis: 'An addition of 50% precipitation shifts drainage grids to a saturated condition. Localized waterlogging is expected on low-lying segments of Dumas Road and Katargam. Suggest rerouting public transits and issuing citizens warnings before precipitation peaks.',
    aiAnalysisHi: '५०% अतिरिक्त वर्षा जल निकासी ग्रिड को संतृप्त स्थिति में स्थानांतरित कर देती है। डुमस रोड और कतारगाम के निचले हिस्सों में स्थानीय जलभराव की आशंका है। सार्वजनिक पारगमन मार्गों को बदलने और नागरिकों को चेतावनी जारी करने की सलाह दी जाती है।'
  },
  {
    id: 'road_closure',
    title: 'Dumas Road Corridor Closure',
    titleHi: 'डुमस रोड कॉरिडोर बंद',
    description: 'Simulates the complete closing of the Dumas Road corridor due to emergency utilities work.',
    descriptionHi: 'आपातकालीन उपयोगिता कार्यों के कारण डुमस रोड कॉरिडोर को पूरी तरह से बंद करने का अनुकरण।',
    impacts: [
      { metric: 'Gaurav Path Traffic', before: 45, after: 90, unit: '%' },
      { metric: 'Varachha Congestion', before: 40, after: 65, unit: '%' },
      { metric: 'Average Trip Time', before: 18, after: 42, unit: ' mins' },
      { metric: 'Diversion Overload', before: 10, after: 85, unit: '%' }
    ],
    aiAnalysis: 'Closing Dumas Road causes immediate gridlock on alternate arterial lanes. Gaurav Path and Ring Road will experience up to a 100% surge in transit volume. AI routing recommends redirecting traffic at Piplod junctions to distribute loads.',
    aiAnalysisHi: 'डुमस रोड बंद होने से वैकल्पिक मुख्य सड़कों पर तत्काल जाम लग जाता है। गौरव पथ और रिंग रोड पर यातायात की मात्रा में १००% तक की वृद्धि होगी। एआई रूटिंग ट्रैफिक को पिपलोद जंक्शनों पर मोड़ने की सिफारिश करता है।'
  },
  {
    id: 'pollution_spike',
    title: 'Pollution Surge (+30%)',
    titleHi: 'प्रदूषण वृद्धि (+३०%)',
    description: 'Simulates stagnant wind speed combined with elevated vehicle emissions to forecast AQI thresholds.',
    descriptionHi: 'एक्यूआई सीमा का पूर्वानुमान लगाने के लिए हवा की धीमी गति और बढ़ते वाहन उत्सर्जन का अनुकरण करता है।',
    impacts: [
      { metric: 'Average AQI', before: 120, after: 260, unit: ' AQI' },
      { metric: 'PM2.5 Concentration', before: 48, after: 110, unit: ' µg/m³' },
      { metric: 'High Risk Zones', before: 1, after: 6, unit: ' Wards' },
      { metric: 'Outdoor Safety index', before: 80, after: 20, unit: '%' }
    ],
    aiAnalysis: 'AQI index rises from Moderate to Very Poor (260). Sensitive categories (seniors, children) must restrict all outdoor travels. AI recommends activating mechanical smog filters in industrial zones and implementing odd-even road rules.',
    aiAnalysisHi: 'एक्यूआई सूचकांक मध्यम से बहुत खराब (२६०) हो जाता है। संवेदनशील श्रेणियों को बाहरी यात्राओं को सीमित करना चाहिए। एआई औद्योगिक क्षेत्रों में मैकेनिकल स्मॉग फिल्टर सक्रिय करने और ऑड-इवन नियमों की सिफारिश करता है।'
  },
  {
    id: 'plant_trees',
    title: 'Afforestation (+1,000 Trees)',
    titleHi: 'वृक्षारोपण (+१,००० पेड़)',
    description: 'Simulates the environmental restoration project by planting 1,000 native foliage trees along transit zones.',
    descriptionHi: 'पारगमन क्षेत्रों में १,००० पेड़ लगाकर पर्यावरण बहाली परियोजना का अनुकरण करता है।',
    impacts: [
      { metric: 'Particulates Filtered', before: 5, after: 25, unit: ' Tons/yr' },
      { metric: 'Heat Island Reduction', before: 0.1, after: 1.8, unit: ' °C' },
      { metric: 'Green Canopy Shield', before: 12, after: 28, unit: '%' },
      { metric: 'Oxygen Generation', before: 10, after: 50, unit: ' Tons/yr' }
    ],
    aiAnalysis: 'Long-term simulation registers a 20% drops in local PM2.5 levels. Canopy density successfully offsets the concrete heat island index, decreasing surface temperature by up to 1.8°C near Varachha and industrial segments.',
    aiAnalysisHi: 'दीर्घकालिक सिमुलेशन स्थानीय पीएम २.५ स्तरों में २०% की गिरावट दर्ज करता है। कनोपी घनत्व सफलतापूर्वक गर्मी द्वीप सूचकांक को कम करता है, जिससे सतह का तापमान वराछा के पास १.८°सी तक कम हो जाता है।'
  }
];

export default function SimLab({ lang }) {
  const [selectedScenario, setSelectedScenario] = useState(simulationScenarios[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [hasSimulated, setHasSimulated] = useState(true);

  const runSimulation = () => {
    setIsSimulating(true);
    setHasSimulated(false);
    setTimeout(() => {
      setIsSimulating(false);
      setHasSimulated(true);
    }, 1500);
  };

  const chartData = selectedScenario.impacts.map(imp => ({
    name: imp.metric,
    "Before / base": imp.before,
    "After Simulation": imp.after
  }));

  const radarData = selectedScenario.impacts.map(imp => ({
    subject: imp.metric,
    A: imp.before,
    B: imp.after,
    fullMark: Math.max(imp.before, imp.after, 100)
  }));

  return (
    <div className="flex flex-col gap-6 text-slate-100 p-4 md:p-6 w-full max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Cpu className="text-emerald-400 animate-spin-slow" size={22} />
            <span>{lang === 'en' ? 'What-If Digital Twin Simulation Lab' : 'डिजिटल ट्विन सिमुलेशन लैब'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'en' 
              ? 'Model city infrastructure resilience by altering parameters in a sandbox environment.' 
              : 'वैकल्पिक मापदंडों को बदलकर शहर के बुनियादी ढांचे के लचीलेपन का परीक्षण करें।'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Select Scenario Controls */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col gap-4 text-left">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Select Urban Scenario</span>
            <div className="flex flex-col gap-2.5">
              {simulationScenarios.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => {
                    setSelectedScenario(sc);
                    setHasSimulated(true);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex flex-col gap-1.5 ${
                    selectedScenario.id === sc.id
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)] font-bold'
                      : 'bg-white/5 border-white/5 hover:border-white/15 text-slate-450 hover:text-slate-200'
                  }`}
                >
                  <span className="font-extrabold text-sm">{lang === 'en' ? sc.title : sc.titleHi}</span>
                  <p className="text-[10px] leading-relaxed text-slate-400 font-normal">{lang === 'en' ? sc.description : sc.descriptionHi}</p>
                </button>
              ))}
            </div>

            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className="mt-2 w-full bg-slate-900 hover:bg-slate-800 border border-white/10 hover:border-emerald-500/40 text-emerald-400 hover:text-white font-extrabold py-3 rounded-xl text-xs transition flex justify-center items-center gap-2 shadow-md"
            >
              {isSimulating ? (
                <>
                  <RefreshCw size={13} className="animate-spin text-emerald-400" />
                  <span>{lang === 'en' ? 'Running Model...' : 'मॉडल चल रहा है...'}</span>
                </>
              ) : (
                <>
                  <Cpu size={13} />
                  <span>{lang === 'en' ? 'Trigger What-If Scenario' : 'सिमुलेशन ट्रिगर करें'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Before/After Analysis & Graphs */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {isSimulating ? (
            <div className="glass-card min-h-[400px] flex flex-col justify-center items-center border border-white/5 rounded-2xl p-6">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-zinc-800"></div>
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
              </div>
              <p className="text-sm font-semibold tracking-wide text-emerald-400 animate-pulse font-mono">Simulating physical twin effects...</p>
              <p className="text-[10px] text-slate-500 mt-2 font-mono">Running dynamic routing & drainage loading matrices</p>
            </div>
          ) : hasSimulated ? (
            <div className="flex flex-col gap-6">
              {/* Grid 1: Side by side metrics Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {selectedScenario.impacts.map((imp, idx) => {
                  const valIncrease = imp.after - imp.before;
                  const isUp = valIncrease > 0;
                  return (
                    <div key={idx} className="bg-slate-950/50 border border-white/5 p-4 rounded-xl text-left relative overflow-hidden">
                      <span className="text-[10px] text-slate-400 font-bold block truncate max-w-[150px]">{imp.metric}</span>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-lg font-black text-white">{imp.after}{imp.unit}</span>
                        <span className="text-[9px] text-slate-500 font-mono">was {imp.before}</span>
                      </div>
                      <span className={`text-[9px] font-bold block mt-1.5 uppercase font-mono ${isUp ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {isUp ? `+${valIncrease.toFixed(1)}` : `${valIncrease.toFixed(1)}`} Change
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Graphic charts comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bar Chart comparing base vs simulated */}
                <div className="glass-card p-5 rounded-2xl border border-white/5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-4 text-left font-mono">Side-by-Side Impact Matrix</span>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 11 }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="Before / base" fill="#64748b" opacity={0.6} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="After Simulation" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Radar Chart mapping overall stress dimensions */}
                <div className="glass-card p-5 rounded-2xl border border-white/5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-4 text-left font-mono">Stress Index Profile</span>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.05)" />
                        <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={9} />
                        <PolarRadiusAxis stroke="#64748b" fontSize={8} />
                        <Radar name="Baseline Status" dataKey="A" stroke="#64748b" fill="#64748b" fillOpacity={0.1} />
                        <Radar name="Simulated Outcome" dataKey="B" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} />
                        <Tooltip contentStyle={{ backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 11 }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* AI Analysis Summary Explanatory Card */}
              <div className="p-5 border rounded-2xl bg-slate-950/60 border-blue-500/25 flex items-start gap-4 shadow-lg text-left">
                <ShieldAlert className="text-amber-400 shrink-0" size={24} />
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-450 font-mono">AI Predictive Assessment</span>
                  <h4 className="text-sm font-extrabold text-white mt-0.5">Simulation Model Breakdown</h4>
                  <p className="text-xs leading-relaxed mt-2 text-slate-300 font-medium">
                    {lang === 'en' ? selectedScenario.aiAnalysis : selectedScenario.aiAnalysisHi}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card min-h-[400px] flex flex-col justify-center items-center border border-white/5 rounded-2xl p-6 text-slate-400">
              <HelpCircle size={40} className="text-slate-600 mb-3" />
              <p className="text-sm font-semibold">{lang === 'en' ? 'Simulator Offline' : 'सिमुलेटर बंद है'}</p>
              <p className="text-xs text-slate-500 mt-1">{lang === 'en' ? 'Trigger the What-If simulation using the left panel controls.' : 'सिमुलेशन शुरू करने के लिए बाईं ओर बटन दबाएं।'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

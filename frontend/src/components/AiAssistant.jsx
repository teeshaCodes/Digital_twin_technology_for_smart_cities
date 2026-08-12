import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Compass, SendToBack, MapPin } from 'lucide-react';

const suggestionQueries = [
  { text: 'Which area has the cleanest air?', label: 'Cleanest Air' },
  { text: 'What is the best time for jogging today?', label: 'Best Jogging Time' },
  { text: 'Where is traffic worst right now?', label: 'Traffic Hotspots' },
  { text: 'Is it safe to travel in the rain today?', label: 'Rain Safety Advice' }
];

export default function AiAssistant({
  weatherData,
  aqiData,
  trafficData,
  smartCityData,
  complaints,
  zones,
  lang,
  userLocation
}) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: lang === 'en' 
        ? "Hello! I am your AI Smart City Digital Twin Assistant. I monitor traffic patterns, air quality indices, weather models, and city sensors in real-time. Ask me anything!"
        : "नमस्ते! मैं आपका एआई स्मार्ट सिटी डिजिटल ट्विन सहायक हूं। मैं वास्तविक समय में यातायात, वायु गुणवत्ता, मौसम और नगर सेंसर की निगरानी करता हूं। मुझसे कुछ भी पूछें!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg = {
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    
    setIsTyping(true);
    setTimeout(() => {
      const responseText = generateResponse(text);
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 1000);
  };

  const generateResponse = (query) => {
    const q = query.toLowerCase();
    const temp = weatherData ? weatherData.temp : 30;
    const weatherCond = weatherData ? weatherData.condition : 'Clear';
    const a = aqiData ? aqiData.aqi : 120;
    const tr = trafficData ? trafficData.level : 30;
    const isRain = weatherCond.toLowerCase().includes('rain') || weatherCond.toLowerCase().includes('drizzle') || weatherCond.toLowerCase().includes('thunderstorm');
    
    // Cleanest Air query
    if (q.includes('cleanest') || q.includes('clean') || q.includes('हवा') || q.includes('स्वच्छ')) {
      return lang === 'en'
        ? `Currently, the cleanest air index is at Piplod Area with approximately 35-45 AQI due to maritime wind dispersion. The general city average is ${a} AQI.`
        : `वर्तमान में, समुद्री हवाओं के कारण पिपलोद क्षेत्र में लगभग ३५-४५ एक्यूआई के साथ सबसे स्वच्छ हवा है। सामान्य शहर का औसत ${a} एक्यूआई है।`;
    }

    // Jogging query
    if (q.includes('jogging') || q.includes('jog') || q.includes('exercise') || q.includes('दौड़ने') || q.includes('व्यायाम')) {
      if (a > 150) {
        return lang === 'en'
          ? `Outdoor jogging is NOT recommended today. The AQI is currently elevated at ${a} (Unhealthy). High-intensity cardio should be shifted indoors.`
          : `आज बाहर टहलना/दौड़ना उचित नहीं है। वायु गुणवत्ता सूचकांक वर्तमान में ${a} (अस्वच्छ) पर है। घर के अंदर व्यायाम करने की सलाह दी जाती है।`;
      }
      if (isRain) {
        return lang === 'en'
          ? `Outdoor jogging is discouraged due to rain (${weatherCond}) and wet road surfaces causing slipping hazards.`
          : `बारिश (${weatherCond}) और गीली सड़कों के कारण बाहर दौड़ने की सलाह नहीं दी जाती है।`;
      }
      return lang === 'en'
        ? `Ideal outdoor jogging time today is between 6:00 AM and 8:00 AM. Temperatures are comfortable (${temp}°C), and vehicle emissions are at baseline levels.`
        : `आज दौड़ने के लिए आदर्श समय सुबह ६:०० से ८:०० बजे के बीच है। तापमान आरामदायक (${temp}°सी) है और वाहन उत्सर्जन का स्तर कम है।`;
    }

    // Worst Traffic hotspots query
    if (q.includes('worst traffic') || q.includes('traffic') || q.includes('jam') || q.includes('भीड़') || q.includes('जाम')) {
      return lang === 'en'
        ? `Arterial gridlocks are currently recorded near Varachha Sector (congested speed is down to 8 km/h) and Ring Road near the station. Average delay on these segments is ${trafficData?.delay || 6} minutes. Guard path is performing optimally.`
        : `वर्तमान में वराछा सेक्टर (गति घटकर ८ किमी/घंटा हो गई है) और स्टेशन के पास रिंग रोड पर भारी जाम दर्ज किया गया है। इन मार्गों पर औसत देरी ${trafficData?.delay || 6} मिनट है।`;
    }

    // Rain travel safety query
    if (q.includes('rain') || q.includes('safe') || q.includes('barish') || q.includes('सुरक्षित') || q.includes('बारिश')) {
      if (isRain) {
        return lang === 'en'
          ? `Active rainfall detected (${temp}°C, ${weatherCond}). Low-lying corridors near Katargam have a medium waterlogging risk. Commuters are advised to avoid standard expressways and use green corridors.`
          : `सक्रिय वर्षा दर्ज की गई है (${temp}°सी, ${weatherCond})। कतारगाम के निचले इलाकों में जलभराव की मध्यम आशंका है। वाहन चालकों को सलाह दी जाती है कि वे सावधान रहें।`;
      }
      return lang === 'en'
        ? `There is no active precipitation in the current telemetry window. Roads are dry, and travel conditions are safe with traffic delay index at ${tr}%.`
        : `वर्तमान टेलीमेट्री विंडो में कोई सक्रिय वर्षा नहीं है। सड़कें सूखी हैं और यात्रा की स्थिति ${tr}% ट्रैफिक देरी के साथ सुरक्षित है।`;
    }

    // Flood risk query
    if (q.includes('flood') || q.includes('waterlogging') || q.includes('बाढ़') || q.includes('जलभराव')) {
      const activeFloodRisk = isRain ? 'High' : 'Low';
      return lang === 'en'
        ? `The general city flood risk index is currently ${activeFloodRisk}. Low-lying zones in Ward-4 (Katargam) and Dumas road underpasses are monitored closely. Water level sensors report nominal ph and turbidity values.`
        : `शहर का सामान्य बाढ़ जोखिम सूचकांक वर्तमान में ${activeFloodRisk === 'High' ? 'उच्च' : 'निम्न'} है। वराछा और कतारगाम के निचले हिस्सों पर बारीकी से नज़र रखी जा रही है।`;
    }

    // Default fallback
    return lang === 'en'
      ? `I understand your query regarding smart city diagnostics. Based on live updates: Weather is ${temp}°C (${weatherCond}), Air Quality index is ${a} (PM2.5: ${aqiData?.pm25 || 0}), and arterial traffic is congested at ${tr}%. Let me know if you need specific transit routing.`
      : `मैं स्मार्ट सिटी टेलीमेट्री के संबंध में आपके प्रश्न को समझता हूँ। लाइव अपडेट: तापमान ${temp}°सी (${weatherCond}) है, वायु गुणवत्ता ${a} एक्यूआई है, और सड़क यातायात देरी ${tr}% है।`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] w-full max-w-4xl mx-auto glass-card rounded-2xl border border-white/5 overflow-hidden text-left relative">
      {/* Bot Header HUD */}
      <div className="bg-slate-950/80 border-b border-white/10 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <MessageSquare size={16} className="text-emerald-400" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse"></span>
          </div>
          <div>
            <span className="font-extrabold text-sm text-slate-100 block">AI City Operations Desk</span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 block">Digital Twin Agent v1.2</span>
          </div>
        </div>
        {userLocation && (
          <div className="flex items-center gap-1 text-[9px] font-mono font-bold text-slate-400 bg-white/5 px-2 py-1 rounded border border-white/5">
            <MapPin size={10} className="text-emerald-400" />
            <span>GPS Active</span>
          </div>
        )}
      </div>

      {/* Messages viewport */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col gap-4">
        {messages.map((m, idx) => {
          const isAi = m.sender === 'ai';
          return (
            <div key={idx} className={`flex ${isAi ? 'justify-start' : 'justify-end'} w-full items-end gap-2.5`}>
              {isAi && (
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold flex items-center justify-center shrink-0">
                  AI
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow border ${
                isAi 
                  ? 'bg-slate-950/60 border-white/5 text-slate-200' 
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
              }`}>
                <p className="font-medium">{m.text}</p>
                <span className="text-[8px] text-slate-550 block mt-1.5 text-right font-mono font-bold">{m.time}</span>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex justify-start items-center gap-2 text-slate-400 text-[10px] italic pl-8 font-mono animate-pulse">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-100"></span>
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-200"></span>
            <span>Agent researching grid sensor feeds...</span>
          </div>
        )}
        <div ref={scrollRef}></div>
      </div>

      {/* Suggestion Chips */}
      <div className="px-5 py-2.5 border-t border-white/5 bg-slate-950/20 flex flex-wrap gap-2 pointer-events-auto">
        {suggestionQueries.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(s.text)}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 border border-white/10 hover:border-emerald-500 hover:text-emerald-400 text-slate-400 rounded-lg text-[10px] font-bold transition-all shadow"
          >
            <Compass size={10} className="rotate-45" />
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Input panel */}
      <div className="p-4 border-t border-white/10 bg-slate-950/80 pointer-events-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            required
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={lang === 'en' ? "Ask about traffic congestion, AQI levels, safety recommendations..." : "यातायात, वायु गुणवत्ता, सुरक्षा सुझावों के बारे में पूछें..."}
            className="flex-1 text-xs bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-550 font-medium"
          />
          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black p-3 rounded-xl transition shadow shadow-emerald-500/10"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Search, X } from "lucide-react";

type WeatherCondition = "sunny" | "partly-cloudy" | "cloudy" | "rainy" | "stormy" | "snowy" | "foggy" | "night";
interface WeatherData { temp: number; condition: WeatherCondition; }

const WEATHER_CFG: Record<WeatherCondition, { icon: string; gradient: string }> = {
  sunny:           { icon: "☀️",  gradient: "linear-gradient(180deg,#0369a1 0%,#0284c7 45%,#38bdf8 100%)" },
  "partly-cloudy": { icon: "⛅",  gradient: "linear-gradient(180deg,#374151 0%,#4b5563 50%,#6b7280 100%)" },
  cloudy:          { icon: "☁️",  gradient: "linear-gradient(180deg,#374151 0%,#6b7280 100%)" },
  rainy:           { icon: "🌧️", gradient: "linear-gradient(180deg,#1e293b 0%,#334155 50%,#475569 100%)" },
  stormy:          { icon: "⛈️", gradient: "linear-gradient(180deg,#0f172a 0%,#1e293b 60%,#334155 100%)" },
  snowy:           { icon: "❄️",  gradient: "linear-gradient(180deg,#7dd3fc 0%,#bae6fd 50%,#e0f2fe 100%)" },
  foggy:           { icon: "🌫️", gradient: "linear-gradient(180deg,#64748b 0%,#94a3b8 100%)" },
  night:           { icon: "🌙",  gradient: "linear-gradient(180deg,#0f172a 0%,#1e1b4b 50%,#1e3a5f 100%)" },
};

function codeToCondition(code: number): WeatherCondition {
  const h = new Date().getHours();
  if (h >= 20 || h < 6) return "night";
  if (code === 0)                               return "sunny";
  if (code <= 2)                                return "partly-cloudy";
  if (code === 3)                               return "cloudy";
  if (code <= 48)                               return "foggy";
  if (code <= 67 || (code >= 80 && code <= 82)) return "rainy";
  if (code <= 77 || code === 85 || code === 86) return "snowy";
  return "stormy";
}

function WeatherAnimation({ c }: { c: WeatherCondition }) {
  if (c === "rainy" || c === "stormy") return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <style>{`@keyframes rr-rain{0%{transform:translateY(-20px) rotate(12deg);opacity:.55}100%{transform:translateY(340px) rotate(12deg);opacity:0}}`}</style>
      {Array.from({ length: 22 }, (_, i) => (
        <div key={i} style={{ position: "absolute", top: 0, left: `${(i * 4.6) % 100}%`, width: "1.5px", height: `${10 + (i * 5) % 16}px`, background: "rgba(255,255,255,.28)", borderRadius: "2px", animation: `rr-rain ${.5 + (i * .04) % .4}s linear ${(i * .07) % 1.2}s infinite` }} />
      ))}
      {c === "stormy" && <><style>{`@keyframes rr-flash{0%,94%,96%,100%{opacity:0}95%{opacity:1}}`}</style><div style={{ position: "absolute", inset: 0, background: "rgba(255,255,220,.04)", animation: "rr-flash 5s ease-in-out infinite" }} /></>}
    </div>
  );
  if (c === "sunny") return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <style>{`
        @keyframes rr-sun-pulse{0%,100%{transform:scale(1);opacity:.95}50%{transform:scale(1.06);opacity:1}}
        @keyframes rr-rays{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes rr-halo{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:.55;transform:scale(1.12)}}
      `}</style>
      <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle,rgba(251,191,36,.45) 0%,rgba(251,191,36,.15) 45%,transparent 70%)", animation: "rr-halo 3.5s ease-in-out infinite" }} />
      <div style={{ position: "absolute", top: "2px", right: "2px", width: "110px", height: "110px", borderRadius: "50%", background: "radial-gradient(circle,rgba(255,230,100,1) 0%,rgba(251,191,36,.95) 60%,rgba(251,146,36,.7) 100%)", boxShadow: "0 0 40px rgba(251,191,36,.6),0 0 80px rgba(251,191,36,.25)", animation: "rr-sun-pulse 3s ease-in-out infinite" }} />
    </div>
  );
  if (c === "partly-cloudy" || c === "cloudy") return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <style>{`@keyframes rr-cloud{0%,100%{transform:translateX(-8px)}50%{transform:translateX(8px)}}`}</style>
      {[{ w: 130, h: 55, top: "18%", left: "5%", d: "0s", o: .13 }, { w: 170, h: 65, top: "35%", left: "48%", d: "1.8s", o: .09 }, { w: 95, h: 42, top: "8%", left: "62%", d: ".8s", o: .11 }].map((cl, i) => (
        <div key={i} style={{ position: "absolute", top: cl.top, left: cl.left, width: cl.w, height: cl.h, borderRadius: "50%", background: `rgba(255,255,255,${cl.o})`, filter: "blur(22px)", animation: `rr-cloud ${5 + i * 1.5}s ease-in-out ${cl.d} infinite` }} />
      ))}
    </div>
  );
  if (c === "night") return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <style>{`@keyframes rr-twinkle{0%,100%{opacity:.15}50%{opacity:.9}}`}</style>
      {Array.from({ length: 28 }, (_, i) => (
        <div key={i} style={{ position: "absolute", top: `${(i * 3.4) % 88}%`, left: `${(i * 7.3) % 96}%`, width: `${i % 3 === 0 ? 2 : 1.5}px`, height: `${i % 3 === 0 ? 2 : 1.5}px`, borderRadius: "50%", background: "rgba(255,255,255,.9)", animation: `rr-twinkle ${1.5 + (i * .1) % 1.5}s ease-in-out ${(i * .18) % 2.5}s infinite` }} />
      ))}
    </div>
  );
  if (c === "snowy") return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <style>{`@keyframes rr-snow{0%{transform:translateY(-10px) translateX(0);opacity:.8}100%{transform:translateY(340px) translateX(18px);opacity:0}}`}</style>
      {Array.from({ length: 18 }, (_, i) => (
        <div key={i} style={{ position: "absolute", top: 0, left: `${(i * 5.4) % 100}%`, width: `${3 + (i * 2) % 4}px`, height: `${3 + (i * 2) % 4}px`, borderRadius: "50%", background: "rgba(255,255,255,.75)", animation: `rr-snow ${2 + (i * .14) % 2}s linear ${(i * .12) % 2}s infinite` }} />
      ))}
    </div>
  );
  return null;
}

interface Props {
  greeting: string;
}

export function HomeHero({ greeting }: Props) {
  const router = useRouter();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=-29.15&longitude=-59.64&current=temperature_2m,weather_code&timezone=America/Argentina/Buenos_Aires")
      .then(r => r.json())
      .then(d => setWeather({ temp: Math.round(d.current.temperature_2m), condition: codeToCondition(d.current.weather_code) }))
      .catch(() => {});
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden w-full"
      style={{
        background: weather
          ? WEATHER_CFG[weather.condition].gradient
          : "linear-gradient(180deg,#1e3a8a 0%,#1e40af 100%)",
        minHeight: "280px",
        paddingTop: "80px",
      }}
    >
      <WeatherAnimation c={weather?.condition ?? "cloudy"} />

      <div className="relative z-10 max-w-xl md:max-w-3xl mx-auto px-4 md:px-8 flex flex-col items-center justify-center gap-4 py-10 md:py-14 text-center">
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <div className="flex items-center gap-1.5 text-white/70 text-xs">
            <MapPin className="w-3 h-3" />
            <span>Reconquista, Santa Fe</span>
          </div>
          {weather && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-semibold">
              <span>{WEATHER_CFG[weather.condition].icon}</span>
              <span>{weather.temp}°C</span>
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-md">{greeting}</h1>
          <p className="text-white/70 text-sm mt-1">¿Qué necesitás hoy?</p>
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClick={() => { if (!query) router.push("/buscar"); }}
            placeholder="Buscar plomero, electricista, médico..."
            className="w-full pl-11 pr-11 py-3.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/90 text-gray-900 placeholder-gray-400 shadow-lg border-0"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>
    </motion.div>
  );
}

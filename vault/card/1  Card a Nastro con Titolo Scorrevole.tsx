// 1. Card a Nastro con Titolo Scorrevole (React + Tailwind CSS)
import React, { useState } from 'react';
import { Compass, Clock, ArrowUpRight, Play, Pause } from 'lucide-react';

export const MarqueeRibbonCard = () => {
  const [isPaused, setIsPaused] = useState(false);
  const headlines = [
    "Padiglioni in terra cruda: la nuova architettura solare ad Alentejo",
    "Pareti termiche naturali: -40% di dispersione senza climatizzatori",
    "La Biennale riscopre l'argilla viva e il legno grezzo",
  ];

  return (
    <div className="w-full max-w-[420px] rounded-[36px] p-5 bg-gradient-to-r from-[#FF5E62] via-[#FF7E5F] to-[#FEB47B] text-white shadow-[0_16px_40px_rgba(255,94,98,0.35)] select-none flex flex-col justify-between gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-semibold">
          <Compass className="w-4 h-4 text-white" />
          <span>Architettura & Design</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/25 text-[11px] font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
          <span>In tempo reale</span>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white/15 backdrop-blur-xl p-3 rounded-[26px] border border-white/25">
        <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden border-2 border-white/40">
          <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 overflow-hidden" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-white/80 mb-1">
            <span>Titolo in Scorrimento:</span>
            <button onClick={() => setIsPaused(p => !p)} className="cursor-pointer">{isPaused ? 'Avvia' : 'Pausa'}</button>
          </div>
          <div className="overflow-hidden whitespace-nowrap h-7 flex items-center">
            <div className="flex items-center gap-12 font-serif text-base font-bold text-white will-change-transform" style={{ animation: 'ribbon 18s linear infinite', animationPlayState: isPaused ? 'paused' : 'running' }}>
              {headlines.concat(headlines).map((t, i) => (<span key={i}>{t}</span>))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-white/90">
        <span className="flex items-center gap-1 font-medium"><Clock className="w-3.5 h-3.5" /> 3 min</span>
        <button className="px-4 py-1.5 rounded-full bg-white text-rose-600 font-bold hover:bg-white/90 shadow-sm flex items-center gap-1 cursor-pointer">
          <span>Apri Notizia</span><ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <style>{`@keyframes ribbon { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }`}</style>
    </div>
  );
};
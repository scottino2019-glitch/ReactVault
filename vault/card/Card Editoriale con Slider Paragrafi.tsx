// 3. Card Editoriale con Slider Paragrafi (React + Tailwind CSS)
import React, { useState } from 'react';
import { Sparkles, Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export const ChapterSliderCard = () => {
  const [active, setActive] = useState(0);
  const chapters = [
    { label: 'Sintesi', title: 'Lampi Ciano a 3.000m', text: 'Banchi di meduse che sincronizzano impulsi luminosi per orientarsi nel buio abissale.' },
    { label: 'I Dati', title: '18 Nuove Specie Mappate', text: 'Reattività ottica del 400% superiore, aprendo la strada a biosensori ecocompatibili.' },
    { label: 'La Voce', title: '«Un Cielo Stellato Rovesciato»', text: '«Il fondale marino non è affatto un deserto buio, bensì una costellazione viva.»' },
  ];

  return (
    <div className="w-full max-w-[360px] rounded-[38px] p-5 bg-gradient-to-br from-[#00C6FF] via-[#0072FF] to-[#0044B0] text-white shadow-[0_20px_45px_rgba(0,114,255,0.38)] flex flex-col justify-between gap-4 select-none">
      <div className="flex items-center justify-between">
        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/20 border border-white/30 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-cyan-200" /> Scienze Marine</span>
        <div className="flex items-center gap-1 bg-black/25 p-1 rounded-full text-[11px] font-mono font-bold">
          <button onClick={() => setActive(i => i === 0 ? chapters.length - 1 : i - 1)} className="w-6 h-6 flex items-center justify-center cursor-pointer"><ChevronLeft className="w-3.5 h-3.5" /></button>
          <span>0{active + 1} / 0{chapters.length}</span>
          <button onClick={() => setActive(i => i === chapters.length - 1 ? 0 : i + 1)} className="w-6 h-6 flex items-center justify-center cursor-pointer"><ChevronRight className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <div className="relative h-36 w-full rounded-[24px] overflow-hidden border border-white/30">
        <img src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=700&q=80" alt="" className="w-full h-full object-cover" />
      </div>

      <div className="bg-white/15 backdrop-blur-xl p-4 rounded-[26px] border border-white/25">
        <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-white/20">
          {chapters.map((ch, i) => (
            <button key={i} onClick={() => setActive(i)} className={`flex-1 py-1 rounded-xl text-xs font-bold cursor-pointer ${active === i ? 'bg-white text-blue-900' : 'text-white/80'}`}>
              {ch.label}
            </button>
          ))}
        </div>
        <div className="overflow-hidden">
          <div className="flex transition-transform duration-400 ease-out" style={{ transform: `translateX(-${active * 100}%)` }}>
            {chapters.map((ch, i) => (
              <div key={i} className="w-full shrink-0 pr-1">
                <h4 className="font-serif text-base font-bold text-white mb-1">{ch.title}</h4>
                <p className="text-xs text-white/90 leading-relaxed line-clamp-3">{ch.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-white/90">
        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 4 min</span>
        <button className="px-4 py-1.5 rounded-full bg-white text-blue-700 font-bold flex items-center gap-1 cursor-pointer">Approfondisci <ArrowRight className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
};
// 2. Card Visual Story con Carosello Foto (React + Tailwind CSS)
import React, { useState } from 'react';
import { Palette, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export const PhotoStoryCard = () => {
  const [active, setActive] = useState(0);
  const photos = [
    { url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=700&q=80', cap: 'Argilla grezza e calcare' },
    { url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=700&q=80', cap: 'Vetro termo-plasmato' },
    { url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80', cap: 'Fotografia analogica 35mm' },
  ];

  return (
    <div className="w-full max-w-[360px] rounded-[38px] p-4 bg-gradient-to-b from-[#8A2387] via-[#E94057] to-[#F27121] text-white shadow-[0_20px_45px_rgba(233,64,87,0.38)] flex flex-col justify-between gap-3 select-none">
      <div className="flex items-center justify-between">
        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/20 border border-white/30 flex items-center gap-1.5"><Palette className="w-3.5 h-3.5" /> Arti Visive</span>
        <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-black/30">0{active + 1} / 0{photos.length}</span>
      </div>

      <div className="relative aspect-[4/3] w-full rounded-[28px] overflow-hidden border-2 border-white/30 group">
        <div className="flex h-full w-full transition-transform duration-500 ease-out" style={{ transform: `translateX(-${active * 100}%)` }}>
          {photos.map((p, i) => (
            <div key={i} className="relative h-full w-full shrink-0">
              <img src={p.url} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-xs text-white/95 font-medium">{p.cap}</div>
            </div>
          ))}
        </div>
        <button onClick={() => setActive(i => i === 0 ? photos.length - 1 : i - 1)} className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 text-stone-900 flex items-center justify-center cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
        <button onClick={() => setActive(i => i === photos.length - 1 ? 0 : i + 1)} className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 text-stone-900 flex items-center justify-center cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
      </div>

      <div className="flex items-center justify-center gap-2 py-1">
        {photos.map((_, i) => (
          <button key={i} onClick={() => setActive(i)} className={`h-2 rounded-full transition-all cursor-pointer ${active === i ? 'w-8 bg-white' : 'w-2 bg-white/40'}`} />
        ))}
      </div>

      <div className="px-1">
        <h3 className="font-serif text-xl font-bold text-white">Forme del Vuoto a Kyoto</h3>
        <div className="flex items-center justify-between pt-2 border-t border-white/20 text-xs mt-2">
          <span>3 scatti d'autore</span>
          <span className="flex items-center gap-1 font-bold cursor-pointer">Guarda la serie <ArrowRight className="w-3.5 h-3.5" /></span>
        </div>
      </div>
    </div>
  );
};
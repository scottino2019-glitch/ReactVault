// 4. Card Morphing con Dock Icone (React + Tailwind CSS)
import React, { useState } from 'react';
import { Leaf, Compass, Sparkles, Palette, ArrowUpRight, Clock } from 'lucide-react';

export const MorphingCategoryCard = () => {
  const [cat, setCat] = useState('bio');
  const data = {
    bio: { gradient: 'from-[#059669] via-[#10B981] to-[#34D399]', shadow: 'shadow-[0_20px_45px_rgba(16,185,129,0.38)]', title: 'Serre Sospese in Larice e Felci', deck: 'I tetti delle metropoli si trasformano in giardini verticali fotosintetici.', img: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=700&q=80', badge: 'Architettura Vivente' },
    arch: { gradient: 'from-[#D97706] via-[#F59E0B] to-[#FCD34D]', shadow: 'shadow-[0_20px_45px_rgba(245,158,11,0.38)]', title: 'Terra Cruda e Ritmo Solare', deck: 'L’argilla battuta a strati regola l’inerzia termica senza consumare kilowattora.', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80', badge: 'Energia Passiva' },
    scienza: { gradient: 'from-[#0284C7] via-[#06B6D4] to-[#67E8F9]', shadow: 'shadow-[0_20px_45px_rgba(6,182,212,0.38)]', title: 'Luce negli Abissi a 3000m', deck: 'Nuove specie svelano il linguaggio della bioluminescenza sincronizzata.', img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=700&q=80', badge: 'Esplorazione Abissale' },
  };

  const cur = data[cat as keyof typeof data] || data.bio;

  return (
    <div className={`w-full max-w-[360px] rounded-[38px] p-5 bg-gradient-to-br ${cur.gradient} ${cur.shadow} text-white select-none transition-all duration-700 flex flex-col justify-between gap-3.5`}>
      <div className="bg-black/25 backdrop-blur-xl p-2 rounded-[24px] border border-white/20">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button onClick={() => setCat('bio')} className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${cat === 'bio' ? 'bg-white text-stone-900' : 'text-white/80'}`}>🌿 Bio</button>
          <button onClick={() => setCat('arch')} className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${cat === 'arch' ? 'bg-white text-stone-900' : 'text-white/80'}`}>🧭 Architettura</button>
          <button onClick={() => setCat('scienza')} className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${cat === 'scienza' ? 'bg-white text-stone-900' : 'text-white/80'}`}>✨ Scienze</button>
        </div>
      </div>

      <div className="relative aspect-[16/10] w-full rounded-[24px] overflow-hidden border border-white/30">
        <img src={cur.img} alt="" className="w-full h-full object-cover transition-opacity duration-300" />
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md">{cur.badge}</span>
      </div>

      <div>
        <h3 className="font-serif text-xl font-bold">{cur.title}</h3>
        <p className="text-xs text-white/90 mt-1">{cur.deck}</p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/20 text-xs">
        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 3 min</span>
        <button className="px-4 py-1.5 rounded-full bg-white text-stone-900 font-bold flex items-center gap-1 cursor-pointer">Leggi <ArrowUpRight className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
};
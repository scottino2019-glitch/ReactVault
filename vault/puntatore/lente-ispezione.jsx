// Dipendenze: npm install framer-motion (oppure importa da 'motion/react')
import { useState } from 'react';
import { motion } from 'framer-motion';

const PUNTI = [
  { id: 'full', label: 'Vista intera', scale: 1, x: '0%', y: '0%' },
  { id: 'arch', label: 'Porticato', scale: 2.1, x: '26%', y: '10%' },
  { id: 'water', label: 'Vasca', scale: 2.2, x: '-4%', y: '-24%' },
  { id: 'tree', label: 'Ulivo', scale: 2.3, x: '-26%', y: '4%' },
];

export default function LenteIspezione() {
  const [spotId, setSpotId] = useState('full');
  const active = PUNTI.find((s) => s.id === spotId) ?? PUNTI[0];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="w-full max-w-2xl mx-auto rounded-2xl border border-[#E2DCD2] bg-white p-6 space-y-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {PUNTI.map((spot) => (
          <button
            key={spot.id}
            type="button"
            onClick={() => setSpotId(spot.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${spotId === spot.id ? 'bg-[#1E3A8A] text-white' : 'bg-[#F1EDE6] text-[#57534E]'}`}
          >
            {spot.label}
          </button>
        ))}
      </div>
      <div className="relative h-[260px] rounded-xl overflow-hidden border border-[#E2DCD2]">
        <motion.div
          animate={{ scale: active.scale, x: active.x, y: active.y }}
          transition={{ type: 'spring', stiffness: 180, damping: 24 }}
          className="w-full h-full"
        >
          <img src="./images/courtyard-day.jpg" alt="Corte esplorabile" className="w-full h-full object-cover" />
        </motion.div>
      </div>
    </div>
  );
}

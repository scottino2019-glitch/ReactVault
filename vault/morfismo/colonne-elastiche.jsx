// Dipendenze: npm install framer-motion (oppure importa da 'motion/react')
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PANNELLI = [
  { id: 'p1', label: '01', title: 'Cortile', desc: 'Spazio aperto delimitato da mura in pietra chiara.', image: 'https://ais-dev-ruz3axlaiqatpc2uvxvtuf-638126288051.europe-west1.run.app/images/courtyard-day.jpg' },
  { id: 'p2', label: '02', title: 'Erbario', desc: 'Foglie pressate e catalogate su fogli di cotone.', image: 'https://ais-dev-ruz3axlaiqatpc2uvxvtuf-638126288051.europe-west1.run.app/images/botanical.jpg' },
  { id: 'p3', label: '03', title: 'Atelier', desc: 'Forme plastiche in gesso sotto luce obliqua.', image: 'https://ais-dev-ruz3axlaiqatpc2uvxvtuf-638126288051.europe-west1.run.app/images/sculptural.jpg' },
];

export default function ColonneElastiche() {
  const [activeId, setActiveId] = useState('p1');

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="w-full max-w-2xl mx-auto rounded-2xl border border-[#E2DCD2] bg-white p-6">
      <div className="flex gap-3 h-[280px]">
        {PANNELLI.map((panel) => {
          const isActive = activeId === panel.id;
          return (
            <motion.button
              key={panel.id}
              type="button"
              layout
              onClick={() => setActiveId(panel.id)}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              style={{ flex: isActive ? 3 : 1 }}
              className="relative rounded-xl overflow-hidden border border-[#E2DCD2] text-left"
            >
              <img src={panel.image} alt={panel.title} className="w-full h-full object-cover absolute inset-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="relative z-10 h-full p-4 flex flex-col justify-end text-white">
                <span className="text-[11px] font-mono text-white/75">{panel.label}</span>
                <h4 style={{ fontFamily: "'Fraunces', Georgia, serif" }} className="text-lg font-medium">{panel.title}</h4>
                <AnimatePresence>
                  {isActive && (
                    <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-white/85 mt-1 max-w-xs">
                      {panel.desc}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
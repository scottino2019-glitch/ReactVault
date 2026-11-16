// Dipendenze: npm install framer-motion (oppure importa da 'motion/react')
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const BAND_TOP = ['Spazio bianco', 'Proporzione aurea', 'Luce radente', 'Carta vergata', 'Ritmo visivo', 'Taglio netto'];
const BAND_BOTTOM = ['Architettura silenziosa', 'Forma essenziale', 'Equilibrio statico', 'Materia grezza', 'Ombra portata', 'Lettura distesa'];

export default function NastroCinetico() {
  const [paused, setPaused] = useState(false);
  const [reversed, setReversed] = useState(false);

  useEffect(() => {
    if (document.getElementById('fraunces-font')) return;
    const link = document.createElement('link');
    link.id = 'fraunces-font';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400..600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap';
    document.head.appendChild(link);
  }, []);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="w-full max-w-2xl mx-auto rounded-2xl border border-[#E2DCD2] bg-white p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <button type="button" onClick={() => setReversed((r) => !r)} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#D6CEBE] text-[#1A1917] hover:bg-[#F1EDE6]">
          ⇄ Inverti direzione
        </button>
        <button type="button" onClick={() => setPaused((p) => !p)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#F1EDE6] text-[#1A1917] hover:bg-[#E2DCD2]">
          {paused ? 'Riprendi scorrimento' : 'Metti in pausa'}
        </button>
      </div>

      <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} className="relative overflow-hidden rounded-xl border border-[#E2DCD2] bg-[#FAF8F4] py-6 space-y-4 select-none">
        <div className="flex overflow-hidden">
          <motion.div
            animate={paused ? undefined : { x: reversed ? ['-50%', '0%'] : ['0%', '-50%'] }}
            transition={{ repeat: Infinity, ease: 'linear', duration: 22 }}
            className="flex shrink-0 gap-4 pr-4"
          >
            {[...BAND_TOP, ...BAND_TOP].map((label, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4, scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                className="px-6 py-3.5 rounded-lg border border-[#E2DCD2] bg-white text-lg text-[#1A1917] whitespace-nowrap"
              >
                {label}
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="flex overflow-hidden">
          <motion.div
            animate={paused ? undefined : { x: reversed ? ['0%', '-50%'] : ['-50%', '0%'] }}
            transition={{ repeat: Infinity, ease: 'linear', duration: 26 }}
            className="flex shrink-0 gap-4 pr-4"
          >
            {[...BAND_BOTTOM, ...BAND_BOTTOM].map((label, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4, scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                className="px-6 py-3.5 rounded-lg border border-[#2E2B27] bg-[#181715] text-lg italic text-[#F5F2EB] whitespace-nowrap"
              >
                {label}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
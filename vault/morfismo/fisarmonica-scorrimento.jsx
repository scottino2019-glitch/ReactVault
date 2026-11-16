// Dipendenze: npm install framer-motion (oppure importa da 'motion/react')
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RIGHE = [
  { id: 'a1', num: '01', title: 'Pietra e taglio di luce', text: 'La geometria netta divide il campo visivo e guida la lettura senza cornici pesanti.', image: './images/courtyard-day.jpg' },
  { id: 'a2', num: '02', title: 'Erbario su carta vergata', text: 'Ogni tavola conserva spazio vuoto attorno al soggetto per alleggerire la pagina.', image: './images/botanical.jpg' },
  { id: 'a3', num: '03', title: 'Volumi e chiaroscuro', text: 'Ombre morbide e proporzioni equilibrate trasformano un elenco in racconto visivo.', image: './images/sculptural.jpg' },
];

export default function FisarmonicaElastica() {
  const [openId, setOpenId] = useState('a1');

  useEffect(() => {
    if (document.getElementById('fraunces-font')) return;
    const link = document.createElement('link');
    link.id = 'fraunces-font';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400..600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap';
    document.head.appendChild(link);
  }, []);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="w-full max-w-2xl mx-auto rounded-2xl border border-[#E2DCD2] bg-white p-6">
      <div className="border-t border-[#E2DCD2]">
        {RIGHE.map((row) => {
          const isOpen = openId === row.id;
          return (
            <div key={row.id} className="border-b border-[#E2DCD2] overflow-hidden">
              <button type="button" onClick={() => setOpenId(isOpen ? '' : row.id)} className="w-full py-4 px-2 flex items-center justify-between gap-4 text-left hover:bg-[#FAF8F4] transition-colors">
                <div className="flex items-baseline gap-4">
                  <span className="text-xs font-mono text-[#1E3A8A]">{row.num}</span>
                  <span style={{ fontFamily: "'Fraunces', Georgia, serif" }} className="text-lg font-medium text-[#1A1917]">{row.title}</span>
                </div>
                <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ type: 'spring', stiffness: 320, damping: 22 }} className="text-xl text-[#57534E]">+</motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-2 pb-5 pt-1 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                      <motion.p initial={{ x: -18, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.38, delay: 0.06 }} className="sm:col-span-7 text-sm text-[#44403C] leading-relaxed pl-8">
                        {row.text}
                      </motion.p>
                      <motion.div initial={{ scale: 1.12, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.45 }} className="sm:col-span-5 h-32 rounded-lg overflow-hidden border border-[#E2DCD2]">
                        <img src={row.image} alt={row.title} className="w-full h-full object-cover" />
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

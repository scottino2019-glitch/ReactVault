// Dipendenze: npm install framer-motion (oppure importa da 'motion/react')
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

const SCHEDE = [
  { id: 'm-1', num: 'I', title: 'Corte di pietra', subtitle: 'Luce e travertino', desc: 'Superfici piane e tagli netti d’ombra che ordinano lo spazio senza decorazioni aggiunte.', image: 'https://ais-dev-ruz3axlaiqatpc2uvxvtuf-638126288051.europe-west1.run.app/images/courtyard-day.jpg' },
  { id: 'm-2', num: 'II', title: 'Erbario su carta', subtitle: 'Trama botanica', desc: 'Esemplari essiccati disposti su fibra grezza per mettere in risalto contorno e nervatura.', image: 'https://ais-dev-ruz3axlaiqatpc2uvxvtuf-638126288051.europe-west1.run.app/images/botanical.jpg' },
  { id: 'm-3', num: 'III', title: 'Forme in gesso', subtitle: 'Equilibrio statico', desc: 'Volumi morbidi e cilindri scolpiti accostati su legno chiaro a luce naturale.', image: 'https://ais-dev-ruz3axlaiqatpc2uvxvtuf-638126288051.europe-west1.run.app/images/sculptural.jpg' },
  { id: 'm-4', num: 'IV', title: 'Ora blu', subtitle: 'Luce indiretta', desc: 'Il medesimo cortile al crepuscolo, dove il riflesso sull’acqua ribalta i contrasti.', image: 'https://ais-dev-ruz3axlaiqatpc2uvxvtuf-638126288051.europe-west1.run.app/images/courtyard-dusk.jpg' },
];

export default function EspansioneMorfica() {
  const [selectedId, setSelectedId] = useState(null);
  const active = SCHEDE.find((c) => c.id === selectedId);

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
      <LayoutGroup>
        <div className="relative min-h-[310px]">
          <div className="grid grid-cols-2 gap-3">
            {SCHEDE.map((card) => (
              <motion.button
                key={card.id}
                type="button"
                layoutId={`card-${card.id}`}
                onClick={() => setSelectedId(card.id)}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                className="group text-left rounded-xl overflow-hidden border border-[#E2DCD2] bg-[#FAF8F4] hover:border-[#1E3A8A]/40"
              >
                <motion.div layoutId={`img-${card.id}`} className="h-24 w-full overflow-hidden">
                  <img src={card.image} alt={card.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </motion.div>
                <div className="p-3">
                  <span className="text-[11px] font-mono text-[#1E3A8A]">{card.num}</span>
                  <motion.h4 layoutId={`title-${card.id}`} style={{ fontFamily: "'Fraunces', Georgia, serif" }} className="text-sm font-medium text-[#1A1917] mt-0.5">
                    {card.title}
                  </motion.h4>
                </div>
              </motion.button>
            ))}
          </div>

          <AnimatePresence>
            {active && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedId(null)}
                className="absolute inset-0 z-20 bg-[#1A1917]/35 backdrop-blur-xs rounded-xl flex items-center justify-center p-4"
              >
                <motion.div
                  layoutId={`card-${active.id}`}
                  onClick={(e) => e.stopPropagation()}
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                  className="w-full max-w-xl bg-white rounded-xl overflow-hidden border border-[#E2DCD2] shadow-xl grid grid-cols-1 sm:grid-cols-12"
                >
                  <motion.div layoutId={`img-${active.id}`} className="sm:col-span-6 h-52 sm:h-72 overflow-hidden">
                    <img src={active.image} alt={active.title} className="w-full h-full object-cover" />
                  </motion.div>
                  <div className="sm:col-span-6 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-[#1E3A8A]">{active.num} · {active.subtitle}</span>
                        <button type="button" onClick={() => setSelectedId(null)} className="p-1.5 rounded-lg text-[#57534E] hover:bg-[#F1EDE6]">✕</button>
                      </div>
                      <motion.h4 layoutId={`title-${active.id}`} style={{ fontFamily: "'Fraunces', Georgia, serif" }} className="text-2xl font-medium text-[#1A1917] mt-3">
                        {active.title}
                      </motion.h4>
                      <p className="text-sm text-[#44403C] leading-relaxed mt-3">{active.desc}</p>
                    </div>
                    <button type="button" onClick={() => setSelectedId(null)} className="self-start mt-4 px-3.5 py-1.5 text-xs font-medium rounded-md bg-[#F1EDE6] text-[#1A1917] hover:bg-[#E2DCD2]">
                      Chiudi vista
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </div>
  );
}

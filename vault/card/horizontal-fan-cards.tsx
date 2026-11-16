import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const PANELS = [
  { id: 'fan-1', num: '01', title: 'Arco e Silenzio', caption: 'Soglie in pietra attraversate da tagli netti di luce meridiana.', image: './immagini/arco.jpg' },
  { id: 'fan-2', num: '02', title: 'Prisma Azzurro', caption: 'Rifrazione nitida che proietta riflessi freddi sul piano gessoso.', image: './immagini/prisma.jpg' },
  { id: 'fan-3', num: '03', title: 'Ramo d’Ulivo', caption: 'Ombra leggera su calce chiara come pagina illustrata dal sole.', image: './immagini/ulivo.jpg' },
  { id: 'fan-4', num: '04', title: 'Carta Piegata', caption: 'Strati di fibra grezza modellati con pieghe morbide e profonde.', image: './immagini/carta.jpg' },
];

export function HorizontalFanCards() {
  const [activeId, setActiveId] = useState<string>('fan-1');

  return (
    <div className="flex h-[360px] flex-col gap-2.5 sm:flex-row">
      {PANELS.map((panel) => {
        const isOpen = panel.id === activeId;
        return (
          <motion.button
            key={panel.id}
            type="button"
            layout
            onClick={() => setActiveId(panel.id)}
            aria-expanded={isOpen}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className={`group relative overflow-hidden rounded-xl border border-[#E2E6EE] bg-[#181B23] text-left ${
              isOpen ? 'flex-[3.5]' : 'flex-1'
            }`}
          >
            <img
              src={panel.image}
              alt={panel.title}
              className={`h-full w-full object-cover transition-all duration-500 ${
                isOpen ? 'scale-100 opacity-95' : 'scale-105 opacity-60 grayscale group-hover:opacity-80'
              }`}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#111318]/85 via-[#111318]/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-xs tabular-nums text-white/75">{panel.num}</span>
                <span className="font-serif text-lg font-medium leading-tight">{panel.title}</span>
              </div>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-2 max-w-md text-xs leading-relaxed text-white/85 sm:text-sm"
                  >
                    {panel.caption}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

export default HorizontalFanCards;
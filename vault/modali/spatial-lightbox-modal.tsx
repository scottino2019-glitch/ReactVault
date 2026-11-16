import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

const PLATES = [
  {
    id: 'plate-prisma',
    kicker: 'Tavola A · Rifrazione',
    title: 'Prisma e Caustiche Azzurre',
    caption: 'Studio di luce diretta su blocco minerale',
    note: 'Cliccando la tavola, la sua identità geometrica viene preservata da layoutId fino al centro dello schermo, evitando stacchi improvvisi tra miniatura e contenitore modale.',
    image: './immagini/prisma.jpg',
  },
  {
    id: 'plate-carta',
    kicker: 'Tavola B · Scultura',
    title: 'Strati di Carta Ripiegata',
    caption: 'Studio tattile su fibra grezza e luce radente',
    note: 'Questo schema modale è pensato per racconti visivi, tavole illustrative, schede museali o appunti fotografici dove il contesto deve restare riconoscibile sullo sfondo.',
    image: './immagini/carta.jpg',
  },
  {
    id: 'plate-arco',
    kicker: 'Tavola C · Architettura',
    title: 'Soglia in Travertino',
    caption: 'Ombre nette e profondità prospettica',
    note: 'Supporta la chiusura con il tasto ESC, clic sullo sfondo oscurato oppure navigazione diretta tra le tavole mediante le frecce laterali.',
    image: './immagini/arco.jpg',
  },
];

export function SpatialLightboxModal() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedIndex = PLATES.findIndex((p) => p.id === selectedId);
  const selected = selectedIndex >= 0 ? PLATES[selectedIndex] : null;

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedId(null);
      if (e.key === 'ArrowRight') setSelectedId(PLATES[(selectedIndex + 1) % PLATES.length].id);
      if (e.key === 'ArrowLeft') setSelectedId(PLATES[(selectedIndex - 1 + PLATES.length) % PLATES.length].id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, selectedIndex]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PLATES.map((plate) => (
          <motion.button
            key={plate.id}
            type="button"
            layoutId={`spatial-card-${plate.id}`}
            onClick={() => setSelectedId(plate.id)}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="group relative overflow-hidden rounded-xl border border-[#E2E6EE] bg-white text-left transition-colors hover:border-[#C7CEDB]"
          >
            <motion.div
              layoutId={`spatial-media-${plate.id}`}
              className="relative aspect-[4/3] w-full overflow-hidden bg-[#ECEFF4]"
            >
              <img
                src={plate.image}
                alt={plate.title}
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
              <span className="absolute right-2.5 bottom-2.5 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-[#111318] opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100">
                <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              </span>
            </motion.div>
            <div className="p-4">
              <p className="text-xs text-[#5B6270]">{plate.kicker}</p>
              <motion.h4
                layoutId={`spatial-title-${plate.id}`}
                className="mt-1 font-serif text-base font-medium text-[#111318]"
              >
                {plate.title}
              </motion.h4>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedId(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#111318]/65 p-4 backdrop-blur-sm sm:p-8"
          >
            <motion.div
              layoutId={`spatial-card-${selected.id}`}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[#E2E6EE] bg-white shadow-2xl"
            >
              <motion.div
                layoutId={`spatial-media-${selected.id}`}
                className="relative aspect-[16/10] w-full overflow-hidden bg-[#ECEFF4]"
              >
                <img src={selected.image} alt={selected.title} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  aria-label="Chiudi modale"
                  className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#111318] shadow-md"
                >
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </motion.div>

              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-[#5B6270]">
                      {selected.kicker} · {selected.caption}
                    </p>
                    <motion.h3
                      layoutId={`spatial-title-${selected.id}`}
                      className="mt-1.5 font-serif text-2xl font-medium text-[#111318]"
                    >
                      {selected.title}
                    </motion.h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedId(PLATES[(selectedIndex - 1 + PLATES.length) % PLATES.length].id)}
                      aria-label="Tavola precedente"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E6EE] text-[#111318] hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                    >
                      <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedId(PLATES[(selectedIndex + 1) % PLATES.length].id)}
                      aria-label="Tavola successiva"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E6EE] text-[#111318] hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                    >
                      <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-[#3B404B]">{selected.note}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default SpatialLightboxModal;
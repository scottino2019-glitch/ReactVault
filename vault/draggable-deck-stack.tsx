import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

const INITIAL_CARDS = [
  { id: 'carta-1', num: '01 / 04', title: 'Arco e Penombra', caption: 'Trascina lateralmente per mandare in coda', image: './immagini/arco.jpg' },
  { id: 'carta-2', num: '02 / 04', title: 'Rifrazione Limpida', caption: 'Inclinazione proporzionale allo slancio', image: './immagini/prisma.jpg' },
  { id: 'carta-3', num: '03 / 04', title: 'Ramo su Intonaco', caption: 'Cascata di profondità su tre livelli', image: './immagini/ulivo.jpg' },
  { id: 'carta-4', num: '04 / 04', title: 'Fibra e Piega', caption: 'Ritorno elastico se rilasciata prima della soglia', image: './immagini/carta.jpg' },
];

export function DraggableDeckStack() {
  const [cards, setCards] = useState(INITIAL_CARDS);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-180, 180], [-11, 11]);
  const dragOpacity = useTransform(x, [-220, 0, 220], [0.55, 1, 0.55]);

  const cycleForward = () => {
    setCards((prev) => [...prev.slice(1), prev[0]]);
    x.set(0);
  };

  const cycleBackward = () => {
    setCards((prev) => [prev[prev.length - 1], ...prev.slice(0, -1)]);
    x.set(0);
  };

  const resetOrder = () => {
    setCards(INITIAL_CARDS);
    x.set(0);
  };

  const visible = cards.slice(0, 3).reverse();

  return (
    <div className="flex flex-col items-center justify-between gap-8 rounded-xl border border-[#E2E6EE] bg-white p-6 md:flex-row md:px-10">
      <div className="max-w-sm space-y-4">
        <p className="text-xs font-medium text-[#5B6270]">
          Mazzo Interattivo · Gesto Orizzontale
        </p>
        <h4 className="font-serif text-xl font-medium text-[#111318]">
          {cards[0].title}
        </h4>
        <p className="text-sm leading-relaxed text-[#4A505C]">
          Afferra la scheda in primo piano e trascinala verso destra o sinistra.
          Oltre la soglia scivola dietro alle altre con rilascio elastico; sotto
          soglia torna esattamente al centro.
        </p>

        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={cycleBackward}
            aria-label="Scheda precedente"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#E2E6EE] bg-[#F6F7F9] text-[#111318] hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={cycleForward}
            aria-label="Scheda successiva"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#E2E6EE] bg-[#F6F7F9] text-[#111318] hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
          >
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={resetOrder}
            className="ml-2 inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-[#5B6270] hover:bg-[#F2F4F8] hover:text-[#111318]"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
            Riordina
          </button>
        </div>
      </div>

      <div className="relative h-[332px] w-full max-w-[290px] shrink-0 select-none">
        {visible.map((card, idx) => {
          const isTop = idx === visible.length - 1;
          const depth = visible.length - 1 - idx;

          return (
            <motion.div
              key={card.id}
              style={{
                zIndex: idx + 1,
                x: isTop ? x : 0,
                rotate: isTop ? rotate : depth * 2.5,
                opacity: isTop ? dragOpacity : 1 - depth * 0.16,
              }}
              animate={{ scale: 1 - depth * 0.05, y: depth * 12 }}
              transition={{ type: 'spring', stiffness: 290, damping: 24 }}
              drag={isTop ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.68}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 380) {
                  cycleForward();
                }
              }}
              className={`absolute inset-0 overflow-hidden rounded-2xl border border-[#DDE2EC] bg-white shadow-md ${
                isTop ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'
              }`}
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#ECEFF4]">
                <img src={card.image} alt={card.title} className="pointer-events-none h-full w-full object-cover" />
              </div>
              <div className="p-4">
                <p className="font-mono text-[11px] tabular-nums text-[#8A919E]">{card.num}</p>
                <p className="mt-1 font-serif text-base font-medium text-[#111318]">{card.title}</p>
                <p className="mt-0.5 text-xs text-[#5B6270]">{card.caption}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default DraggableDeckStack;
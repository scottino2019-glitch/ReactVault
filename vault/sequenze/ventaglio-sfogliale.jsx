// Dipendenze: npm install framer-motion (oppure importa da 'motion/react')
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TAVOLE = [
  { id: 'f1', title: 'Cortile solare', image: 'https://ais-dev-ruz3axlaiqatpc2uvxvtuf-638126288051.europe-west1.run.app/images/courtyard-day.jpg' },
  { id: 'f2', title: 'Tavola botanica', image: 'https://ais-dev-ruz3axlaiqatpc2uvxvtuf-638126288051.europe-west1.run.app/images/botanical.jpg' },
  { id: 'f3', title: 'Volumi in gesso', image: 'https://ais-dev-ruz3axlaiqatpc2uvxvtuf-638126288051.europe-west1.run.app/images/sculptural.jpg' },
  { id: 'f4', title: 'Riflessi serali', image: 'https://ais-dev-ruz3axlaiqatpc2uvxvtuf-638126288051.europe-west1.run.app/images/courtyard-dusk.jpg' },
];

export default function VentaglioSfogliale() {
  const [order, setOrder] = useState([0, 1, 2, 3]);
  const [isFanned, setIsFanned] = useState(false);

  useEffect(() => {
    if (document.getElementById('fraunces-font')) return;
    const link = document.createElement('link');
    link.id = 'fraunces-font';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400..600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap';
    document.head.appendChild(link);
  }, []);

  const advance = () => setOrder(([first, ...rest]) => [...rest, first]);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="w-full max-w-2xl mx-auto rounded-2xl border border-[#E2DCD2] bg-white p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-4">
        <div className="space-y-4 max-w-xs">
          <p className="text-xs uppercase tracking-[0.16em] text-[#1E3A8A]">
            Tavola {order[0] + 1} di {TAVOLE.length}
          </p>
          <h4 style={{ fontFamily: "'Fraunces', Georgia, serif" }} className="text-2xl font-medium text-[#1A1917]">
            {TAVOLE[order[0]].title}
          </h4>
          <div className="flex items-center gap-2 pt-1">
            <button type="button" onClick={() => setIsFanned((v) => !v)} className="px-3.5 py-2 text-xs font-medium rounded-lg border border-[#D6CEBE] text-[#1A1917] hover:bg-[#F1EDE6]">
              {isFanned ? 'Chiudi ventaglio' : 'Apri ventaglio'}
            </button>
            <button type="button" onClick={advance} className="px-3.5 py-2 text-xs font-medium rounded-lg bg-[#1E3A8A] text-white hover:bg-[#172D6B]">
              Sfoglia →
            </button>
          </div>
        </div>

        <div
          onMouseEnter={() => setIsFanned(true)}
          onMouseLeave={() => setIsFanned(false)}
          className="relative w-full max-w-sm h-[280px] flex items-center justify-center select-none"
        >
          {order.slice().reverse().map((idx, revPos) => {
            const pos = order.length - 1 - revPos;
            const plate = TAVOLE[idx];
            const isFront = pos === 0;
            return (
              <motion.div
                key={plate.id}
                style={{ zIndex: order.length - pos, originY: 0.9 }}
                animate={{
                  rotate: isFanned ? (pos - 1.5) * 9 : pos === 0 ? 0 : pos % 2 === 1 ? -4 : 4,
                  x: isFanned ? (pos - 1.5) * 34 : pos * 8,
                  y: isFanned ? Math.abs(pos - 1.5) * 6 : pos * 6,
                  scale: 1 - pos * 0.04,
                }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                drag={isFront ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.5}
                onDragEnd={(_, info) => isFront && Math.abs(info.offset.x) > 65 && advance()}
                onClick={isFront ? advance : undefined}
                whileDrag={{ scale: 1.04, rotate: -6 }}
                className={`absolute w-56 h-[272px] rounded-xl overflow-hidden border border-[#E2DCD2] bg-white shadow-md ${isFront ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
              >
                <img src={plate.image} alt={plate.title} className="w-full h-full object-cover pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/75 to-transparent text-white">
                  <p style={{ fontFamily: "'Fraunces', Georgia, serif" }} className="text-xs">{plate.title}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

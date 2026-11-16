import { useState } from 'react';
import { motion } from 'motion/react';
import { RotateCw } from 'lucide-react';

const PLATES = [
  {
    id: 'flip-prisma',
    frontKicker: 'Fronte · Tavola I',
    frontTitle: 'Rifrazione e Caustica',
    backKicker: 'Retro · Annotazione Ottica',
    backTitle: 'Comportamento del Fascio',
    backProse:
      'Quando la luce inclinata entra nel blocco di vetro, il bordo inferiore proietta una fascia azzurra netta sul gesso opaco. Girando la scheda si rivela il testo critico senza occupare altro spazio.',
    backFootnote: 'Adatto a schede didattiche, glossari visivi, carte narrative.',
    image: './immagini/prisma.jpg',
  },
  {
    id: 'flip-ulivo',
    frontKicker: 'Fronte · Tavola II',
    frontTitle: 'Ombra su Calce',
    backKicker: 'Retro · Nota Botanica',
    backTitle: 'Disegno del Vento',
    backProse:
      'Le foglie lanceolate filtrano la luce meridiana creando una proiezione nitida sull’intonaco. La rotazione 3D a molla mantiene leggibile la profondità grazie a perspective e backface-visibility.',
    backFootnote: 'Premi di nuovo o usa il tasto Invio per tornare al fronte.',
    image: './immagini/ulivo.jpg',
  },
];

export function FlipCard3D() {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setFlipped((p) => ({ ...p, [id]: !p[id] }));

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {PLATES.map((plate) => {
        const isBack = Boolean(flipped[plate.id]);
        return (
          <div key={plate.id} className="[perspective:1200px]">
            <motion.button
              type="button"
              onClick={() => toggle(plate.id)}
              aria-pressed={isBack}
              animate={{ rotateY: isBack ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative block h-[340px] w-full cursor-pointer text-left"
            >
              <div
                style={{ backfaceVisibility: 'hidden' }}
                className="absolute inset-0 flex flex-col overflow-hidden rounded-xl border border-[#E2E6EE] bg-white shadow-sm"
              >
                <div className="relative h-56 w-full overflow-hidden bg-[#ECEFF4]">
                  <img src={plate.image} alt={plate.frontTitle} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 items-center justify-between gap-4 p-5">
                  <div>
                    <p className="text-xs font-medium text-[#5B6270]">{plate.frontKicker}</p>
                    <h4 className="mt-1 font-serif text-lg font-medium text-[#111318]">{plate.frontTitle}</h4>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E2E6EE] bg-[#F6F7F9] text-[#4A505C]">
                    <RotateCw className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                </div>
              </div>

              <div
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-xl border border-[#BFDBFE] bg-[#FAFBFD] p-6 shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-xs font-medium text-[#1D4ED8]">{plate.backKicker}</p>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#DCE1EA] bg-white text-[#4A505C]">
                      <RotateCw className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </span>
                  </div>
                  <h4 className="mt-2 font-serif text-xl font-medium text-[#111318]">{plate.backTitle}</h4>
                  <p className="mt-3 text-sm leading-relaxed text-[#3B404B]">{plate.backProse}</p>
                </div>
                <p className="border-t border-[#E2E6EE] pt-4 text-xs text-[#5B6270]">{plate.backFootnote}</p>
              </div>
            </motion.button>
          </div>
        );
      })}
    </div>
  );
}

export default FlipCard3D;
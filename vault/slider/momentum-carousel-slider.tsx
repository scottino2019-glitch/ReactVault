import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const SLIDES = [
  { id: 'slide-1', tag: 'Sequenza I', title: 'Soglia di Pietra', note: 'Scorrimento laterale con aggancio elastico al centro.', image: './immagini/arco.jpg' },
  { id: 'slide-2', tag: 'Sequenza II', title: 'Prisma e Luce', note: 'Scala e nitidezza seguono la scheda attiva.', image: './immagini/prisma.jpg' },
  { id: 'slide-3', tag: 'Sequenza III', title: 'Ombre d’Ulivo', note: 'Trascinabile con mouse, dito o pulsanti laterali.', image: './immagini/ulivo.jpg' },
  { id: 'slide-4', tag: 'Sequenza IV', title: 'Fogli di Carta', note: 'Adattabile a capitoli, diari visivi o raccolte.', image: './immagini/carta.jpg' },
];

const CARD_STEP = 276;

export function MomentumCarouselSlider() {
  const [index, setIndex] = useState(0);
  const clamp = (n: number) => Math.max(0, Math.min(SLIDES.length - 1, n));

  return (
    <div className="space-y-5 rounded-xl border border-[#E2E6EE] bg-white p-6">
      <div className="overflow-hidden">
        <motion.div
          drag="x"
          dragConstraints={{ left: -((SLIDES.length - 1) * CARD_STEP), right: 0 }}
          dragElastic={0.18}
          animate={{ x: -(index * CARD_STEP) }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onDragEnd={(_, info) => {
            if (info.offset.x < -55 || info.velocity.x < -300) setIndex((i) => clamp(i + 1));
            else if (info.offset.x > 55 || info.velocity.x > 300) setIndex((i) => clamp(i - 1));
          }}
          className="flex cursor-grab gap-4 active:cursor-grabbing"
        >
          {SLIDES.map((slide, idx) => {
            const isCurrent = idx === index;
            return (
              <motion.article
                key={slide.id}
                onClick={() => setIndex(idx)}
                animate={{ scale: isCurrent ? 1 : 0.94, opacity: isCurrent ? 1 : 0.65 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                className={`w-[260px] shrink-0 overflow-hidden rounded-xl border bg-white transition-colors ${
                  isCurrent ? 'border-[#1D4ED8]/45 shadow-sm' : 'border-[#E2E6EE]'
                }`}
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-[#ECEFF4]">
                  <img src={slide.image} alt={slide.title} className="pointer-events-none h-full w-full object-cover" />
                </div>
                <div className="p-4">
                  <p className="text-xs font-medium text-[#5B6270]">{slide.tag}</p>
                  <h4 className="mt-1 font-serif text-lg font-medium text-[#111318]">{slide.title}</h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#4A505C]">{slide.note}</p>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>

      <div className="flex items-center justify-between gap-6 border-t border-[#ECEFF4] pt-4">
        <div className="flex flex-1 items-center gap-2">
          {SLIDES.map((s, idx) => (
            <button key={s.id} type="button" aria-label={`Vai a ${s.title}`} onClick={() => setIndex(idx)} className="relative h-6 flex-1 cursor-pointer">
              <span className="block h-1 w-full rounded-full bg-[#E6E9F0]" />
              {idx === index && (
                <motion.span
                  layoutId="carousel-active-rail"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#1D4ED8]"
                />
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={() => setIndex((i) => clamp(i - 1))} disabled={index === 0} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E6EE] bg-[#F6F7F9] text-[#111318] disabled:opacity-40">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <button type="button" onClick={() => setIndex((i) => clamp(i + 1))} disabled={index === SLIDES.length - 1} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E6EE] bg-[#F6F7F9] text-[#111318] disabled:opacity-40">
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default MomentumCarouselSlider;
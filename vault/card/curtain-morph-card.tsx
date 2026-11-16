import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, X } from 'lucide-react';

const ITEMS = [
  {
    id: 'luce-radente',
    kicker: 'Studio I · Ottica e Rifrazione',
    title: 'La Geometria della Luce Radente',
    excerpt:
      'Quando un fascio luminoso sfiora il vetro sfaccettato, l’ombra si scompone in margini nitidi.',
    fullText:
      'Questa scheda utilizza la transizione layout di Framer Motion: al clic, il contenitore si estende sull’intera larghezza disponibile mentre la scheda adiacente scivola verso il basso con inerzia elastica. Adattabile a saggi brevi, annotazioni di viaggio, schede d’archivio o raccolte botaniche.',
    note: 'Tavola 01 · Prisma in vetro ottico su gesso minerale',
    image: './immagini/prisma.jpg',
    alt: 'Prisma ottico in vetro su superficie minerale con rifrazione azzurra',
  },
  {
    id: 'ombra-ulivo',
    kicker: 'Studio II · Ritmo Naturale',
    title: 'Ombre Sottili su Intonaco Caldo',
    excerpt:
      'Il movimento lento del fogliame disegna una trama mutevole sulla parete in pietra.',
    fullText:
      'Nessun salto improvviso di altezza o lampeggiamento: i testi superiori restano ancorati alla propria posizione relativa grazie a layout="position", mentre il contenuto approfondito entra con un leggero scorrimento verticale e dissolvenza morbida.',
    note: 'Tavola 02 · Ramo d’ulivo e ombra pomeridiana su calce',
    image: './immagini/ulivo.jpg',
    alt: 'Ramo di ulivo che proietta ombre geometriche su muro chiaro',
  },
];

export function ExpandableCurtainCard() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {ITEMS.map((item) => {
        const isOpen = activeId === item.id;
        return (
          <motion.article
            key={item.id}
            layout
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className={`group relative overflow-hidden rounded-xl border bg-white transition-colors ${
              isOpen
                ? 'border-[#1D4ED8]/45 shadow-sm md:col-span-2'
                : 'border-[#E2E6EE] hover:border-[#C7CEDB]'
            }`}
          >
            <div className={`flex flex-col ${isOpen ? 'md:flex-row' : ''}`}>
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                className={`relative overflow-hidden bg-[#ECEFF4] ${
                  isOpen ? 'h-56 md:h-auto md:w-2/5 shrink-0' : 'aspect-[4/3] w-full'
                }`}
              >
                <img
                  src={item.image}
                  alt={item.alt}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
              </motion.div>

              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <motion.p
                      layout="position"
                      className="text-xs font-medium tracking-wide text-[#5B6270]"
                    >
                      {item.kicker}
                    </motion.p>

                    <button
                      type="button"
                      onClick={() => setActiveId(isOpen ? null : item.id)}
                      aria-expanded={isOpen}
                      aria-label={isOpen ? `Chiudi ${item.title}` : `Espandi ${item.title}`}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E2E6EE] bg-[#F6F7F9] text-[#111318] transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                    >
                      {isOpen ? (
                        <X className="h-4 w-4" strokeWidth={1.75} />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
                      )}
                    </button>
                  </div>

                  <motion.h3
                    layout="position"
                    onClick={() => setActiveId(isOpen ? null : item.id)}
                    className="mt-2 cursor-pointer font-serif text-xl font-medium leading-snug text-[#111318]"
                  >
                    {item.title}
                  </motion.h3>

                  <motion.p
                    layout="position"
                    className="mt-2 text-sm leading-relaxed text-[#4A505C]"
                  >
                    {item.excerpt}
                  </motion.p>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-4 border-t border-[#ECEFF4] pt-4"
                      >
                        <p className="text-sm leading-relaxed text-[#2C313A]">
                          {item.fullText}
                        </p>
                        <p className="mt-4 text-xs italic text-[#5B6270]">
                          {item.note}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {!isOpen && (
                  <div className="mt-5 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveId(item.id)}
                      className="text-xs font-medium text-[#1D4ED8] underline-offset-4 hover:underline"
                    >
                      Espandi lettura
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}

export default ExpandableCurtainCard;
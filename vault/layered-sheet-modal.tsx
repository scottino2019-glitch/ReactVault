import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, X } from 'lucide-react';

const CHAPTERS = [
  {
    id: 'capitolo-1',
    title: 'Appunti sulla Piegatura',
    kicker: 'Foglio I · Spazio Sovrapposto',
    prose:
      'Quando un foglio si solleva sopra il piano di lavoro, la superficie sottostante arretra lievemente di scala. Questo accorgimento fisico comunica immediatamente gerarchia senza bisogno di ombre pesanti.',
    subnote:
      'Trascina questo foglio verso il basso oppure premi Chiudi / ESC per tornare al piano principale.',
  },
  {
    id: 'capitolo-2',
    title: 'Composizione a Strati',
    kicker: 'Foglio II · Lettura Temporanea',
    prose:
      'Ideale per digressioni narrative, note a margine, dettagli di un’opera o finestre editoriali che non devono spezzare il flusso principale della pagina.',
    subnote:
      'Se rilasci il trascinamento prima della soglia, il foglio ritorna in posizione con slancio elastico.',
  },
];

export function LayeredSheetModal() {
  const [activeSheet, setActiveSheet] = useState<number | null>(null);

  useEffect(() => {
    if (activeSheet === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveSheet(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeSheet]);

  return (
    <div className="relative min-h-[400px] overflow-hidden rounded-2xl bg-[#181B23] p-4 sm:p-6">
      <motion.div
        animate={{
          scale: activeSheet !== null ? 0.94 : 1,
          opacity: activeSheet !== null ? 0.58 : 1,
          borderRadius: activeSheet !== null ? 16 : 12,
        }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="flex min-h-[352px] flex-col justify-between gap-6 bg-white p-6 sm:p-8"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg bg-[#ECEFF4] sm:w-48">
            <img
              src="./immagini/carta.jpg"
              alt="Strati di carta giapponese"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-[#5B6270]">
              Piano Principale · Profondità Dinamica
            </p>
            <h4 className="font-serif text-xl font-medium text-[#111318]">
              Contenitore a Strati Sovrapposti
            </h4>
            <p className="max-w-md text-sm leading-relaxed text-[#4A505C]">
              Apri uno dei due fogli creativi: il piano sottostante arretra con
              morbidezza lasciando spazio al nuovo strato.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-[#ECEFF4] pt-5">
          <button
            type="button"
            onClick={() => setActiveSheet(0)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1D4ED8] px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#1E40AF]"
          >
            <Layers className="h-3.5 w-3.5" strokeWidth={1.75} />
            Apri Foglio I
          </button>
          <button
            type="button"
            onClick={() => setActiveSheet(1)}
            className="inline-flex items-center gap-2 rounded-lg border border-[#D4DAE4] bg-[#F6F7F9] px-4 py-2.5 text-xs font-medium text-[#111318] transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
          >
            Apri Foglio II
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {activeSheet !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveSheet(null)}
            className="absolute inset-0 z-10 bg-[#111318]/35"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeSheet !== null && (
          <motion.div
            key={CHAPTERS[activeSheet].id}
            role="dialog"
            aria-modal="true"
            initial={{ y: 420 }}
            animate={{ y: 0 }}
            exit={{ y: 420 }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 280 }}
            dragElastic={{ top: 0.06, bottom: 0.45 }}
            dragSnapToOrigin
            onDragEnd={(_, info) => {
              if (info.offset.y > 70 || info.velocity.y > 280) {
                setActiveSheet(null);
              }
            }}
            className="absolute inset-x-3 bottom-0 z-20 cursor-grab rounded-t-2xl border border-[#E2E6EE] bg-white p-6 shadow-2xl active:cursor-grabbing sm:inset-x-6 sm:p-7"
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[#D5DCE6]" />

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-[#5B6270]">
                  {CHAPTERS[activeSheet].kicker}
                </p>
                <h5 className="mt-1 font-serif text-xl font-medium text-[#111318]">
                  {CHAPTERS[activeSheet].title}
                </h5>
              </div>
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setActiveSheet(null)}
                aria-label="Chiudi foglio"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E2E6EE] text-[#4A505C] hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#2C313A]">
              {CHAPTERS[activeSheet].prose}
            </p>
            <p className="mt-4 text-xs text-[#5B6270]">
              {CHAPTERS[activeSheet].subnote}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LayeredSheetModal;
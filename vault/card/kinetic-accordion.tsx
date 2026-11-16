import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus } from 'lucide-react';

const ENTRIES = [
  {
    num: '01',
    tag: 'Soglia · Ingresso',
    title: 'La Soglia Silenziosa tra Stasi e Movimento',
    prose:
      'Ogni transizione dovrebbe annunciare la propria direzione senza interrompere il filo della lettura. Un’apertura a curva morbida evita lo scatto meccanico delle vecchie interfacce.',
    detail: 'Curva consigliata: cubic-bezier(0.16, 1, 0.3, 1) su opacità e altezza.',
  },
  {
    num: '02',
    tag: 'Pausa · Respiro',
    title: 'Il Peso del Vuoto nei Testi Espandibili',
    prose:
      'Quando una fascia si apre, il margine interno ha bisogno di qualche millisecondo per stabilizzarsi. Sfalsare l’ingresso del paragrafo rispetto al contenitore crea profondità immediata.',
    detail: 'Ideale per capitoli di saggi, diari visivi, note tecniche o ricette.',
  },
  {
    num: '03',
    tag: 'Tatto · Chiusura',
    title: 'Simmetria nel Ritorno allo Stato Chiuso',
    prose:
      'Chiudere una scheda è importante quanto aprirla: la rotazione elastica del segno di croce accompagna il gesto e segnala in modo chiaro la reversibilità dell’azione.',
    detail: 'Spring: stiffness 360, damping 24 sul solo elemento di controllo.',
  },
  {
    num: '04',
    tag: 'Adattabilità · Contesto',
    title: 'Struttura Neutra Senza Vincoli di Settore',
    prose:
      'Separando il ritmo visivo da qualsiasi estetica commerciale, la stessa fisarmonica può ospitare programmi culturali, glossari linguistici o archivi di appunti personali.',
    detail: 'Accessibile da tastiera con attributo aria-expanded nativo.',
  },
];

export function KineticAccordionCards() {
  const [openIdx, setOpenIdx] = useState<number>(0);

  return (
    <div className="overflow-hidden rounded-xl border border-[#E2E6EE] bg-white">
      <div className="divide-y divide-[#ECEFF4]">
        {ENTRIES.map((entry, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={entry.num} className="transition-colors hover:bg-[#FAFBFD]">
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
                  <span className="font-mono text-xs tabular-nums text-[#8A919E]">
                    {entry.num}
                  </span>
                  <div>
                    <span className="block text-xs text-[#5B6270]">{entry.tag}</span>
                    <span className="mt-0.5 block font-serif text-lg font-medium text-[#111318]">
                      {entry.title}
                    </span>
                  </div>
                </div>

                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 24 }}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                    isOpen
                      ? 'border-[#BFDBFE] bg-[#EFF4FF] text-[#1D4ED8]'
                      : 'border-[#E2E6EE] bg-white text-[#5B6270]'
                  }`}
                >
                  <Plus className="h-4 w-4" strokeWidth={1.75} />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <motion.div
                      initial={{ y: -6, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -4, opacity: 0 }}
                      transition={{ duration: 0.22, delay: 0.04 }}
                      className="px-6 pb-6 sm:pl-16"
                    >
                      <p className="max-w-2xl text-sm leading-relaxed text-[#3B404B]">
                        {entry.prose}
                      </p>
                      <p className="mt-3 text-xs text-[#5B6270]">{entry.detail}</p>
                    </motion.div>
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

export default KineticAccordionCards;
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PanelRightOpen, X } from 'lucide-react';

const DRAWER_TABS = [
  {
    id: 'contesto',
    label: 'Contesto',
    heading: 'Architettura a Margine',
    body: 'Il cassetto laterale consente di aprire note estese, commenti critici o schede di approfondimento mantenendo visibile la tavola principale sul lato sinistro.',
  },
  {
    id: 'struttura',
    label: 'Struttura',
    heading: 'Cambio Scheda Fluido',
    body: 'La barra di selezione interna utilizza layoutId per far scorrere l’indicatore blu tra le sezioni con fisica a molla, accompagnata da una breve dissolvenza incrociata dei testi.',
  },
  {
    id: 'uso',
    label: 'Adattabilità',
    heading: 'Versatile per Ogni Racconto',
    body: 'Perfetto per glossari, biografie d’autore, note di regia, dettagli storici o schede botaniche dove serve spazio di lettura senza abbandonare la pagina.',
  },
];

export function SlideOverDrawerModal() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(DRAWER_TABS[0].id);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const currentTab = DRAWER_TABS.find((t) => t.id === activeTab) || DRAWER_TABS[0];

  return (
    <>
      <div className="flex flex-col items-start justify-between gap-6 rounded-xl border border-[#E2E6EE] bg-white p-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-5">
          <div className="h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-[#ECEFF4]">
            <img src="./immagini/ulivo.jpg" alt="Ombra di ulivo su muro chiaro" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#5B6270]">Annotazione Editoriale · Cassetto Laterale</p>
            <h4 className="mt-1 font-serif text-xl font-medium text-[#111318]">Foglio di Lettura a Scomparsa</h4>
            <p className="mt-1 text-sm text-[#4A505C]">Apri il pannello laterale con schede interne animate e chiusura tramite ESC.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1D4ED8] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#1E40AF] whitespace-nowrap shrink-0"
        >
          <PanelRightOpen className="h-3.5 w-3.5" strokeWidth={1.75} />
          Apri pannello laterale
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 flex justify-end bg-[#111318]/45 backdrop-blur-sm"
          >
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              onClick={(e) => e.stopPropagation()}
              className="flex h-full w-full max-w-md flex-col justify-between border-l border-[#E2E6EE] bg-white shadow-2xl"
            >
              <div>
                <div className="flex items-start justify-between gap-4 border-b border-[#ECEFF4] px-6 py-5">
                  <div>
                    <p className="text-xs font-medium text-[#5B6270]">Scheda di Approfondimento</p>
                    <h3 className="mt-1 font-serif text-xl font-medium text-[#111318]">Studio su Luce e Ombra</h3>
                  </div>
                  <button type="button" onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E6EE] text-[#4A505C]">
                    <X className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </div>
                <div className="aspect-[16/9] w-full overflow-hidden bg-[#ECEFF4]">
                  <img src="./immagini/ulivo.jpg" alt="Ombra di ulivo" className="h-full w-full object-cover" />
                </div>
                <div className="flex border-b border-[#ECEFF4] px-6">
                  {DRAWER_TABS.map((tab) => {
                    const isActive = tab.id === activeTab;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative px-4 py-3 text-xs font-medium transition-colors ${isActive ? 'text-[#1D4ED8]' : 'text-[#5B6270] hover:text-[#111318]'}`}
                      >
                        {tab.label}
                        {isActive && (
                          <motion.span
                            layoutId="drawer-tab-underline"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            className="absolute inset-x-2 bottom-0 h-0.5 bg-[#1D4ED8]"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentTab.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                      className="space-y-2.5"
                    >
                      <h4 className="font-serif text-lg font-medium text-[#111318]">{currentTab.heading}</h4>
                      <p className="text-sm leading-relaxed text-[#3B404B]">{currentTab.body}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              <div className="border-t border-[#ECEFF4] bg-[#F8F9FB] px-6 py-4 text-xs text-[#5B6270]">
                Premi ESC o clicca fuori dal pannello per chiudere.
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default SlideOverDrawerModal;
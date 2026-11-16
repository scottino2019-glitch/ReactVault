// Dipendenze: npm install framer-motion (oppure importa da 'motion/react')
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VOCI = [
  { id: 'f1', group: 'Architettura', title: 'Arco in travertino' },
  { id: 'f2', group: 'Botanica', title: 'Ramo d’olivo' },
  { id: 'f3', group: 'Materia', title: 'Cilindro in calcare' },
  { id: 'f4', group: 'Architettura', title: 'Vasca al crepuscolo' },
  { id: 'f5', group: 'Botanica', title: 'Felce su cotone' },
  { id: 'f6', group: 'Materia', title: 'Ceramica cruda' },
];

export default function FiltroIstantaneo() {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('Tutti');

  const matches = useMemo(() => {
    return VOCI.filter((item) => {
      const okGroup = group === 'Tutti' || item.group === group;
      const okQuery = item.title.toLowerCase().includes(query.trim().toLowerCase());
      return okGroup && okQuery;
    });
  }, [query, group]);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="w-full max-w-2xl mx-auto rounded-2xl border border-[#E2DCD2] bg-white p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca voce..."
          className="flex-1 min-w-[160px] px-3 py-1.5 text-xs rounded-lg border border-[#E2DCD2] bg-[#FAF8F4]"
        />
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#F1EDE6]">
          {['Tutti', 'Architettura', 'Botanica', 'Materia'].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGroup(g)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md ${group === g ? 'bg-white text-[#1A1917] shadow-xs' : 'text-[#57534E]'}`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 min-h-[160px] content-start">
        <AnimatePresence mode="popLayout">
          {matches.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="p-3.5 rounded-xl border border-[#E2DCD2] bg-[#FAF8F4]"
            >
              <p className="text-[11px] text-[#1E3A8A]">{item.group}</p>
              <p style={{ fontFamily: "'Fraunces', Georgia, serif" }} className="text-sm font-medium text-[#1A1917] mt-0.5">{item.title}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
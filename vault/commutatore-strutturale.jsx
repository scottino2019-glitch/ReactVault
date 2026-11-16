// Dipendenze: npm install framer-motion (oppure importa da 'motion/react')
import { useState } from 'react';
import { motion, LayoutGroup } from 'framer-motion';

const VOCI = [
  { id: 'c1', code: 'A', title: 'Pietra chiara', note: 'Superfici piane e ombre nette.' },
  { id: 'c2', code: 'B', title: 'Fibra naturale', note: 'Carta cotone non sbiancata.' },
  { id: 'c3', code: 'C', title: 'Luce radente', note: 'Tagli diagonali sul muro.' },
];

export default function CommutatoreStrutturale() {
  const [mode, setMode] = useState('griglia');
  const modes = [
    { id: 'griglia', label: 'Colonne' },
    { id: 'elenco', label: 'Righe' },
    { id: 'compatto', label: 'Compatto' },
  ];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="w-full max-w-2xl mx-auto rounded-2xl border border-[#E2DCD2] bg-white p-6">
      <LayoutGroup>
        <div className="space-y-4">
          <div className="inline-flex p-1 rounded-lg bg-[#F1EDE6]">
            {modes.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className="relative px-3.5 py-1.5 text-xs font-medium rounded-md"
              >
                {mode === m.id && (
                  <motion.span layoutId="pill" className="absolute inset-0 bg-white rounded-md shadow-xs" />
                )}
                <span className="relative z-10">{m.label}</span>
              </button>
            ))}
          </div>

          <div className={mode === 'griglia' ? 'grid grid-cols-3 gap-3' : mode === 'elenco' ? 'flex flex-col gap-2.5' : 'flex flex-wrap gap-2'}>
            {VOCI.map((card) => (
              <motion.div
                key={card.id}
                layout
                transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                className={`rounded-xl border border-[#E2DCD2] bg-[#FAF8F4] ${mode === 'compatto' ? 'px-4 py-2.5' : 'p-4'}`}
              >
                <motion.span layout="position" className="text-xs font-mono text-[#1E3A8A]">{card.code}</motion.span>
                <motion.h4 layout="position" style={{ fontFamily: "'Fraunces', Georgia, serif" }} className="text-base font-medium text-[#1A1917]">{card.title}</motion.h4>
                {mode !== 'compatto' && <p className="text-xs text-[#57534E] mt-1">{card.note}</p>}
              </motion.div>
            ))}
          </div>
        </div>
      </LayoutGroup>
    </div>
  );
}
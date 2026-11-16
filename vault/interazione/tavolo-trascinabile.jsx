// Dipendenze: npm install framer-motion (oppure importa da 'motion/react')
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const FOGLI = [
  { id: 'n1', label: 'Nota A', text: 'Trascinami liberamente sul tavolo.', bg: 'bg-white', x: 16, y: 18, rot: -2 },
  { id: 'n2', label: 'Nota B', text: 'Clicca per portarmi in primo piano.', bg: 'bg-[#F1EDE6]', x: 170, y: 58, rot: 2 },
  { id: 'n3', label: 'Nota C', text: 'Resto dentro i bordi del riquadro.', bg: 'bg-[#181715] text-[#F5F2EB]', x: 80, y: 140, rot: -1 },
];

export default function TavoloTrascinabile() {
  const boundsRef = useRef(null);
  const [zOrder, setZOrder] = useState(['n1', 'n2', 'n3']);
  const [resetKey, setResetKey] = useState(0);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="w-full max-w-2xl mx-auto rounded-2xl border border-[#E2DCD2] bg-white p-6 space-y-3">
      <div className="flex justify-end">
        <button type="button" onClick={() => { setZOrder(['n1', 'n2', 'n3']); setResetKey((k) => k + 1); }} className="text-xs text-[#1E3A8A] hover:underline">
          ↻ Riordina fogli
        </button>
      </div>
      <div key={resetKey} ref={boundsRef} className="relative h-[260px] rounded-xl border border-dashed border-[#D6CEBE] bg-[#FAF8F4] overflow-hidden select-none">
        {FOGLI.map((note) => (
          <motion.div
            key={note.id}
            drag
            dragConstraints={boundsRef}
            dragElastic={0.14}
            whileDrag={{ scale: 1.04, rotate: 0 }}
            onPointerDown={() => setZOrder((prev) => [...prev.filter((x) => x !== note.id), note.id])}
            initial={{ x: note.x, y: note.y, rotate: note.rot }}
            style={{ zIndex: zOrder.indexOf(note.id) + 1 }}
            className={`absolute w-48 p-4 rounded-xl border border-[#E2DCD2] shadow-sm cursor-grab active:cursor-grabbing ${note.bg}`}
          >
            <p className="text-[11px] font-mono opacity-60">{note.label}</p>
            <p className="text-xs font-medium mt-1 leading-relaxed">{note.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
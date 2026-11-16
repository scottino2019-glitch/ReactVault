// Dipendenze: npm install framer-motion (oppure importa da 'motion/react')
import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function SiparioDiviso() {
  const containerRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const rawPercent = useMotionValue(50);
  const smoothPercent = useSpring(rawPercent, { stiffness: 300, damping: 28 });
  const clipPath = useTransform(smoothPercent, (v) => `inset(0 ${100 - v}% 0 0)`);
  const handleLeft = useTransform(smoothPercent, (v) => `${v}%`);

  const updateX = (clientX) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    rawPercent.set(Math.min(92, Math.max(8, ((clientX - rect.left) / rect.width) * 100)));
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="w-full max-w-2xl mx-auto rounded-2xl border border-[#E2DCD2] bg-white p-6">
      <div
        ref={containerRef}
        onPointerDown={(e) => { setDragging(true); e.currentTarget.setPointerCapture(e.pointerId); updateX(e.clientX); }}
        onPointerMove={(e) => { if (e.buttons === 1) updateX(e.clientX); }}
        onPointerUp={() => setDragging(false)}
        className="relative w-full h-[300px] rounded-xl overflow-hidden border border-[#E2DCD2] select-none cursor-ew-resize touch-none"
      >
        <img src="https://ais-dev-ruz3axlaiqatpc2uvxvtuf-638126288051.europe-west1.run.app/images/courtyard-dusk.jpg" alt="Cortile al crepuscolo" className="w-full h-full object-cover absolute inset-0 pointer-events-none" />
        <span className="absolute bottom-4 right-4 z-10 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] bg-black/60 text-white rounded-sm pointer-events-none">
          Crepuscolo
        </span>

        <motion.div style={{ clipPath }} className="absolute inset-0 pointer-events-none">
          <img src="https://ais-dev-ruz3axlaiqatpc2uvxvtuf-638126288051.europe-west1.run.app/images/courtyard-day.jpg" alt="Cortile di giorno" className="w-full h-full object-cover" />
          <span className="absolute bottom-4 left-4 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] bg-white/90 text-[#1A1917] rounded-sm">
            Giorno
          </span>
        </motion.div>

        <motion.div style={{ left: handleLeft }} className="absolute inset-y-0 z-20 -translate-x-1/2 flex items-center justify-center pointer-events-none">
          <div className="w-0.5 h-full bg-white/95" />
          <motion.div
            animate={{ scale: dragging ? 1.18 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 24 }}
            className="absolute w-10 h-10 rounded-full bg-white text-[#1A1917] border border-[#E2DCD2] shadow-md flex items-center justify-center text-sm"
          >
            ↔
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
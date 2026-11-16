// Dipendenze: npm install framer-motion (oppure importa da 'motion/react')
import { useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function DioramaParallasse() {
  const stageRef = useRef(null);
  const normX = useMotionValue(0);
  const normY = useMotionValue(0);
  const smoothX = useSpring(normX, { stiffness: 180, damping: 24 });
  const smoothY = useSpring(normY, { stiffness: 180, damping: 24 });

  const bgX = useTransform(smoothX, [-1, 1], [-10, 10]);
  const bgY = useTransform(smoothY, [-1, 1], [-8, 8]);
  const imgX = useTransform(smoothX, [-1, 1], [-22, 22]);
  const imgY = useTransform(smoothY, [-1, 1], [-16, 16]);
  const fgX = useTransform(smoothX, [-1, 1], [-36, 36]);
  const fgY = useTransform(smoothY, [-1, 1], [-24, 24]);
  const rotateY = useTransform(smoothX, [-1, 1], [-6, 6]);
  const rotateX = useTransform(smoothY, [-1, 1], [6, -6]);

  useEffect(() => {
    if (document.getElementById('fraunces-font')) return;
    const link = document.createElement('link');
    link.id = 'fraunces-font';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400..600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap';
    document.head.appendChild(link);
  }, []);

  const handleMove = (cx, cy) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    normX.set(((cx - rect.left) / rect.width) * 2 - 1);
    normY.set(((cy - rect.top) / rect.height) * 2 - 1);
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="w-full max-w-2xl mx-auto rounded-2xl border border-[#E2DCD2] bg-white p-6">
      <div
        ref={stageRef}
        onPointerMove={(e) => handleMove(e.clientX, e.clientY)}
        onPointerLeave={() => { normX.set(0); normY.set(0); }}
        style={{ perspective: '1000px' }}
        className="relative w-full h-[300px] rounded-xl border border-[#E2DCD2] bg-[#F1EDE6] overflow-hidden flex items-center justify-center select-none"
      >
        <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className="relative w-full max-w-lg h-56 flex items-center justify-center">
          <motion.div style={{ x: bgX, y: bgY }} className="absolute w-72 h-48 border border-[#1E3A8A]/35 rounded-xl bg-[#FAF8F4]/70 -translate-x-10 -translate-y-4" />
          <motion.div style={{ x: imgX, y: imgY }} className="relative z-10 w-64 h-44 rounded-xl overflow-hidden border border-[#E2DCD2] shadow-lg translate-x-6">
            <img src="https://ais-dev-ruz3axlaiqatpc2uvxvtuf-638126288051.europe-west1.run.app/images/botanical.jpg" alt="Tavola botanica" className="w-full h-full object-cover" />
          </motion.div>
          <motion.div style={{ x: fgX, y: fgY }} className="absolute left-4 sm:left-6 bottom-4 z-20 bg-white/95 backdrop-blur-xs border border-[#E2DCD2] rounded-lg px-5 py-3.5 shadow-md">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#1E3A8A]">Livello anteriore</p>
            <h4 style={{ fontFamily: "'Fraunces', Georgia, serif" }} className="text-xl font-medium text-[#1A1917]">Profondità a tre piani</h4>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

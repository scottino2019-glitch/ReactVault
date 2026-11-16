// Dipendenze: npm install framer-motion (oppure importa da 'motion/react')
import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function RiflettoreMaschera() {
  const boxRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const mouseX = useMotionValue(260);
  const mouseY = useMotionValue(140);
  const springX = useSpring(mouseX, { stiffness: 280, damping: 28 });
  const springY = useSpring(mouseY, { stiffness: 280, damping: 28 });
  const radius = useSpring(hovered ? 135 : 85, { stiffness: 260, damping: 26 });
  const clipPath = useTransform([springX, springY, radius], ([x, y, r]) => `circle(${r}px at ${x}px ${y}px)`);

  useEffect(() => {
    if (document.getElementById('fraunces-font')) return;
    const link = document.createElement('link');
    link.id = 'fraunces-font';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400..600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap';
    document.head.appendChild(link);
  }, []);

  const handleMove = (cx, cy) => {
    const rect = boxRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(cx - rect.left);
    mouseY.set(cy - rect.top);
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="w-full max-w-2xl mx-auto rounded-2xl border border-[#E2DCD2] bg-white p-6">
      <div
        ref={boxRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onPointerMove={(e) => handleMove(e.clientX, e.clientY)}
        onClick={(e) => handleMove(e.clientX, e.clientY)}
        className="relative w-full h-[300px] rounded-xl overflow-hidden border border-[#E2DCD2] bg-[#181715] cursor-crosshair select-none"
      >
        <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-between text-[#F5F2EB]">
          <p className="text-xs uppercase tracking-[0.2em] text-[#A8A29E]">Strato base · Passa con il cursore</p>
          <h4 style={{ fontFamily: "'Fraunces', Georgia, serif" }} className="text-3xl md:text-5xl font-medium leading-tight max-w-xl">
            Ciò che resta nell’ombra attende uno sguardo vicino.
          </h4>
          <p className="text-xs text-[#78716C]">Muovi o tocca per rivelare l’immagine</p>
        </div>

        <motion.div style={{ clipPath }} className="absolute inset-0 pointer-events-none">
          <img src="https://ais-dev-ruz3axlaiqatpc2uvxvtuf-638126288051.europe-west1.run.app/images/courtyard-day.jpg" alt="Corte illuminata" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#FAF8F4]/25" />
          <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-between text-[#1A1917]">
            <p className="text-xs uppercase tracking-[0.2em] font-medium text-[#1E3A8A]">Strato rivelato · Luce piena</p>
            <h4 style={{ fontFamily: "'Fraunces', Georgia, serif" }} className="text-3xl md:text-5xl font-medium leading-tight max-w-xl drop-shadow-[0_1px_10px_rgba(255,255,255,0.85)]">
              Ciò che resta nell’ombra attende uno sguardo vicino.
            </h4>
            <p className="text-xs font-medium text-[#1A1917]">Lente dinamica</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
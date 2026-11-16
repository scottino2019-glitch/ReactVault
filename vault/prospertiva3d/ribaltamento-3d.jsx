// Dipendenze: npm install framer-motion (oppure importa da 'motion/react')
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Ribaltamento3D() {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (document.getElementById('fraunces-font')) return;
    const link = document.createElement('link');
    link.id = 'fraunces-font';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400..600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap';
    document.head.appendChild(link);
  }, []);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="w-full max-w-2xl mx-auto rounded-2xl border border-[#E2DCD2] bg-white p-6">
      <div className="w-full max-w-xl h-[300px] mx-auto" style={{ perspective: '1200px' }}>
        <motion.button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          animate={{ rotateY: flipped ? 180 : 0, scale: [1, 0.94, 1] }}
          transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-full h-full text-left rounded-xl cursor-pointer"
        >
          <div style={{ backfaceVisibility: 'hidden' }} className="absolute inset-0 rounded-xl overflow-hidden border border-[#E2DCD2] bg-[#FAF8F4] grid grid-cols-12">
            <div className="col-span-6 h-full overflow-hidden">
              <img src="https://ais-dev-ruz3axlaiqatpc2uvxvtuf-638126288051.europe-west1.run.app/images/sculptural.jpg" alt="Forme scultoree" className="w-full h-full object-cover" />
            </div>
            <div className="col-span-6 p-6 flex flex-col justify-between">
              <span className="text-xs uppercase tracking-[0.16em] text-[#1E3A8A]">Fronte · Tavola</span>
              <div>
                <h4 style={{ fontFamily: "'Fraunces', Georgia, serif" }} className="text-2xl font-medium text-[#1A1917]">Equilibrio della materia</h4>
                <p className="text-xs text-[#57534E] mt-2">Clicca per voltare la pagina sul retro.</p>
              </div>
              <span className="text-xs font-medium text-[#1A1917]">↻ Volta scheda</span>
            </div>
          </div>

          <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }} className="absolute inset-0 rounded-xl border border-[#2E2B27] bg-[#181715] text-[#F5F2EB] p-8 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.16em] text-[#93C5FD]">Retro · Nota editoriale</span>
              <span className="text-xs text-[#A8A29E]">↻ Torna al fronte</span>
            </div>
            <blockquote style={{ fontFamily: "'Fraunces', Georgia, serif" }} className="text-xl md:text-2xl italic leading-relaxed text-[#F5F2EB]">
              “Un foglio possiede sempre due facce: l’immagine visibile e il commento che la spiega.”
            </blockquote>
            <p className="text-xs text-[#A8A29E]">
              Rotazione spaziale 3D con prospettiva a 1200px e faccia posteriore nascosta.
            </p>
          </div>
        </motion.button>
      </div>
    </div>
  );
}

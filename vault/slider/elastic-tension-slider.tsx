import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

const NOTCHES = [
  { label: 'Chiuso', value: 0.12 },
  { label: 'Morbido', value: 0.38 },
  { label: 'Nitido', value: 0.62 },
  { label: 'Aperto', value: 0.92 },
];

export function ElasticTensionSlider() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState(0.62);
  const [magnetic, setMagnetic] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const rawProgress = useMotionValue(0.62);
  const smoothProgress = useSpring(rawProgress, { stiffness: 420, damping: 28 });
  const scaleX = useTransform(smoothProgress, (v) => v);

  const applyValue = (next: number) => {
    let target = Math.max(0.05, Math.min(0.98, next));
    if (magnetic) {
      for (const n of NOTCHES) {
        if (Math.abs(target - n.value) < 0.055) {
          target = n.value;
          break;
        }
      }
    }
    rawProgress.set(target);
    setRatio(target);
  };

  const handlePointer = (clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    applyValue((clientX - rect.left) / rect.width);
  };

  const blurAmount = Math.abs(ratio - 0.62) * 7;
  const letterSpacing = 0.02 + ratio * 0.28;
  const ringScale = 0.72 + ratio * 0.55;

  return (
    <div className="rounded-xl border border-[#E2E6EE] bg-white p-6">
      <div className="relative flex h-44 flex-col items-center justify-center overflow-hidden rounded-lg border border-[#ECEFF4] bg-[#F8F9FB] px-6 text-center">
        <motion.div
          animate={{ scale: ringScale, rotate: ratio * 45 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="pointer-events-none absolute h-32 w-32 rounded-full border border-[#1D4ED8]/20"
        />
        <motion.div
          animate={{ scale: ringScale * 0.68, rotate: -ratio * 60 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="pointer-events-none absolute h-24 w-24 rounded-lg border border-[#111318]/10"
        />

        <p
          className="relative z-10 font-serif text-2xl font-medium text-[#111318] transition-[filter,letter-spacing] duration-150 sm:text-3xl"
          style={{
            letterSpacing: `${letterSpacing}em`,
            filter: `blur(${blurAmount.toFixed(2)}px)`,
          }}
        >
          Diaframma Ottico
        </p>
        <p className="relative z-10 mt-3 text-xs text-[#5B6270]">
          Trascina il cursore per modulare respiro tipografico e messa a fuoco
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <div
          ref={trackRef}
          role="slider"
          tabIndex={0}
          aria-label="Regolazione diaframma ottico"
          aria-valuemin={5}
          aria-valuemax={98}
          aria-valuenow={Math.round(ratio * 100)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') applyValue(ratio - 0.08);
            if (e.key === 'ArrowRight') applyValue(ratio + 0.08);
          }}
          onPointerDown={(e) => {
            setIsDragging(true);
            e.currentTarget.setPointerCapture(e.pointerId);
            handlePointer(e.clientX);
          }}
          onPointerMove={(e) => {
            if (isDragging) handlePointer(e.clientX);
          }}
          onPointerUp={() => setIsDragging(false)}
          onPointerCancel={() => setIsDragging(false)}
          className="relative flex h-10 cursor-ew-resize items-center touch-none select-none"
        >
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[#E6E9F0]">
            <motion.div
              className="h-full w-full origin-left bg-[#1D4ED8]"
              style={{ scaleX }}
            />
          </div>

          {NOTCHES.map((notch) => (
            <span
              key={notch.label}
              aria-hidden="true"
              style={{ left: `${notch.value * 100}%` }}
              className={`pointer-events-none absolute top-1/2 h-3 w-px -translate-y-1/2 transition-colors ${
                Math.abs(ratio - notch.value) < 0.03 ? 'bg-[#1D4ED8]' : 'bg-[#B9C1CE]'
              }`}
            />
          ))}

          <motion.div
            animate={{
              left: `${ratio * 100}%`,
              scaleX: isDragging ? 1.28 : 1,
              scaleY: isDragging ? 0.84 : 1,
            }}
            transition={{ type: 'spring', stiffness: 450, damping: 28 }}
            className="pointer-events-none absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#1D4ED8] bg-white shadow-sm"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#ECEFF4] pt-4">
          <div className="flex flex-wrap items-center gap-2">
            {NOTCHES.map((notch) => {
              const active = Math.abs(ratio - notch.value) < 0.04;
              return (
                <button
                  key={notch.label}
                  type="button"
                  onClick={() => {
                    rawProgress.set(notch.value);
                    setRatio(notch.value);
                  }}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#1D4ED8] text-white'
                      : 'bg-[#F2F4F8] text-[#4A505C] hover:bg-[#E6E9F0]'
                  }`}
                >
                  {notch.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setMagnetic((m) => !m)}
            className="text-xs font-medium text-[#5B6270] underline-offset-4 hover:text-[#111318] hover:underline"
          >
            {magnetic ? 'Scatti magnetici: attivi' : 'Scatti magnetici: liberi'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ElasticTensionSlider;
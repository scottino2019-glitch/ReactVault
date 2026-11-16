// Dipendenze: npm install framer-motion (oppure importa da 'motion/react')
import { useState } from 'react';
import { Reorder } from 'framer-motion';

const INIZIALE = [
  { id: 'r1', tag: 'Primo', title: 'Scegliere la proporzione del margine' },
  { id: 'r2', tag: 'Secondo', title: 'Stabilire il ritmo tra le righe' },
  { id: 'r3', tag: 'Terzo', title: 'Calibrare luce e contrasto del testo' },
  { id: 'r4', tag: 'Quarto', title: 'Verificare la risposta su schermi piccoli' },
];

export default function RiordinoElastico() {
  const [items, setItems] = useState(INIZIALE);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="w-full max-w-2xl mx-auto rounded-2xl border border-[#E2DCD2] bg-white p-6 space-y-3">
      <div className="flex justify-end">
        <button type="button" onClick={() => setItems(INIZIALE)} className="text-xs text-[#1E3A8A] hover:underline">
          Ripristina sequenza
        </button>
      </div>
      <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2.5">
        {items.map((item) => (
          <Reorder.Item
            key={item.id}
            value={item}
            whileDrag={{ scale: 1.02, boxShadow: '0 10px 25px rgba(26,25,23,0.12)' }}
            className="flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl border border-[#E2DCD2] bg-[#FAF8F4] cursor-grab active:cursor-grabbing select-none"
          >
            <div className="flex items-baseline gap-3">
              <span className="text-[11px] font-mono uppercase text-[#1E3A8A]">{item.tag}</span>
              <span className="text-sm font-medium text-[#1A1917]">{item.title}</span>
            </div>
            <span className="text-xs text-[#78716C]">⋮⋮</span>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}
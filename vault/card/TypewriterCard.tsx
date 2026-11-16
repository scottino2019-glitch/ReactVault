import React, { useState } from 'react';
import { 
  FileText, 
  RotateCcw, 
  Sparkles, 
  Download, 
  Copy, 
  Volume2, 
  VolumeX,
  CornerDownLeft
} from 'lucide-react';

export function TypewriterCardPreview() {
  const [typedText, setTypedText] = useState(
    "Capitolo 1: La Notte dei Gatti Silenziosi.\n\nLa pioggia batteva ritmica sulle vetrate dell'antico studio. Sulla scrivania in noce massiccio, i tasti metallici attendevano solo di imprimere la prossima memoria."
  );
  const [soundOn, setSoundOn] = useState(true);
  const [carriagePos, setCarriagePos] = useState(15);
  const [lastChar, setLastChar] = useState('a');

  const typewriterKeys = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '.', ',']
  ];

  const handleKeyPress = (char: string) => {
    setTypedText(prev => prev + char);
    setLastChar(char);
    setCarriagePos(prev => (prev >= 90 ? 10 : prev + 3));
  };

  const handleReturn = () => {
    setTypedText(prev => prev + '\n');
    setCarriagePos(10);
  };

  const handleBackspace = () => {
    setTypedText(prev => prev.slice(0, -1));
    setCarriagePos(prev => Math.max(10, prev - 3));
  };

  return (
    <div id="typewriter-card-preview" className="w-full max-w-xl mx-auto select-none p-2 sm:p-4 font-sans">
      {/* Corpo Macchina da Scrivere Meccanica Vintage Anni '50 */}
      <div className="relative bg-gradient-to-b from-[#2b353b] via-[#1f262a] to-[#12171a] rounded-3xl p-4 sm:p-6 shadow-2xl border-4 border-[#3d4950] text-neutral-200">
        
        {/* Rullo Superiore e Foglio di Carta Battuta */}
        <div className="relative mb-6">
          {/* Barra Cromata Guida-Foglio con Scala Graduata */}
          <div className="w-full h-4 bg-gradient-to-r from-neutral-400 via-neutral-200 to-neutral-500 rounded-sm border border-neutral-600 shadow-sm flex items-center justify-between px-3">
            <span className="text-[7px] font-mono text-neutral-800 font-bold tracking-widest">
              |...|...|...|...|...|...|...|...|...|...|
            </span>
            <span className="text-[8px] font-mono text-neutral-900 font-black">
              ROYAL 1954
            </span>
          </div>

          {/* Rullo Gommato Cilindrico Nero */}
          <div className="w-[96%] mx-auto h-6 bg-gradient-to-b from-neutral-800 via-neutral-950 to-neutral-900 rounded-xs border-y-2 border-neutral-700 shadow-inner flex items-center justify-between px-2">
            <div className="w-3 h-5 bg-neutral-600 rounded-xs border border-neutral-400 shadow"></div>
            <div className="w-3 h-5 bg-neutral-600 rounded-xs border border-neutral-400 shadow"></div>
          </div>

          {/* FOGLIO DI CARTA PERGAMENATA CHE EMERGE DAL RULLO */}
          <div className="relative -mt-3 mx-auto max-w-md bg-[#faf7ee] rounded-t-sm p-4 sm:p-6 shadow-xl border-x-2 border-t-2 border-[#d6cfbe] text-neutral-900 min-h-[160px]">
            {/* Margini e Grana della Carta */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-rose-300/40"></div>
            <div className="pl-6 font-mono text-xs sm:text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap tracking-wide">
              {typedText}
              <span className="inline-block w-2 h-4 bg-neutral-900 animate-pulse ml-0.5 align-middle"></span>
            </div>
          </div>

          {/* Manopola di Carica e Ritorno Carrello (Leva Cromata con Ding!) */}
          <div className="absolute -top-4 right-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleReturn}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-b from-neutral-300 to-neutral-500 hover:from-neutral-200 text-neutral-950 text-xs font-mono font-black border border-neutral-400 shadow-md cursor-pointer active:scale-95 transition-all"
              title="Ritorno a capo con campanello"
            >
              <CornerDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>DING! A CAPO</span>
            </button>
          </div>
        </div>

        {/* Nastro Inchiostrato Bicolore (Nero / Rosso) con Martelli di Battitura */}
        <div className="relative my-4 bg-neutral-950 p-2 rounded-xl border border-neutral-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Bobina Sinistra */}
            <div className="w-8 h-8 rounded-full bg-neutral-800 border-2 border-neutral-600 flex items-center justify-center shadow-inner">
              <div className="w-3 h-3 rounded-full bg-neutral-900 border border-neutral-500"></div>
            </div>
            {/* Nastro */}
            <div className="h-3 w-20 bg-gradient-to-b from-neutral-900 via-neutral-900 to-rose-900 rounded-xs border border-neutral-700"></div>
          </div>

          {/* Battente Centrale che colpisce la carta */}
          <div className="flex flex-col items-center">
            <div className="w-2 h-4 bg-gradient-to-b from-neutral-300 to-neutral-500 rounded-t-sm shadow"></div>
            <span className="text-[9px] font-mono text-amber-400 font-bold uppercase tracking-wider">
              {lastChar ? `[ ${lastChar} ]` : '[ · ]'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-3 w-20 bg-gradient-to-b from-neutral-900 via-neutral-900 to-rose-900 rounded-xs border border-neutral-700"></div>
            {/* Bobina Destra */}
            <div className="w-8 h-8 rounded-full bg-neutral-800 border-2 border-neutral-600 flex items-center justify-center shadow-inner">
              <div className="w-3 h-3 rounded-full bg-neutral-900 border border-neutral-500"></div>
            </div>
          </div>
        </div>

        {/* TASTIERA FISICA RETRÒ A TASTI ROTONDI CROMATI */}
        <div className="bg-[#181e22] p-3 sm:p-4 rounded-2xl border-2 border-[#2b353b] shadow-inner space-y-2">
          {typewriterKeys.map((row, rowIdx) => (
            <div key={rowIdx} className="flex justify-center gap-1.5 sm:gap-2">
              {row.map(k => (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleKeyPress(k.toLowerCase())}
                  className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-b from-neutral-100 via-white to-neutral-300 hover:from-white active:scale-95 text-neutral-900 font-serif font-black text-xs sm:text-sm flex items-center justify-center shadow-[0_3px_0_#4a555c] border-2 border-neutral-400 active:translate-y-0.5 active:shadow-none cursor-pointer transition-transform"
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-neutral-300 flex items-center justify-center shadow-inner">
                    {k}
                  </div>
                </button>
              ))}
            </div>
          ))}

          {/* Barra Spaziatrice Lunga & Tasto Cancella */}
          <div className="flex justify-center items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleBackspace}
              className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono font-bold border border-neutral-600 shadow cursor-pointer active:scale-95"
            >
              ⌫ Cancella
            </button>

            {/* Barra Spazio in Legno Laccato Nero con Bordo Cromato */}
            <button
              type="button"
              onClick={() => handleKeyPress(' ')}
              className="w-48 sm:w-64 h-8 rounded-lg bg-gradient-to-b from-neutral-800 via-neutral-900 to-neutral-950 hover:from-neutral-700 border-2 border-neutral-500 shadow-[0_3px_0_#2b353b] active:translate-y-0.5 active:shadow-none cursor-pointer text-center text-[10px] font-mono text-neutral-400 uppercase tracking-widest flex items-center justify-center"
            >
              SPAZIO
            </button>

            <button
              type="button"
              onClick={() => setTypedText('')}
              className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono font-bold border border-neutral-600 shadow cursor-pointer active:scale-95"
            >
              Pulisci
            </button>
          </div>
        </div>

        {/* Footer Macchina da Scrivere */}
        <div className="mt-3 pt-2 border-t border-neutral-700/60 flex items-center justify-between text-xs text-neutral-400">
          <span className="font-mono">Parole: {typedText.trim() ? typedText.trim().split(/\s+/).length : 0} | Battute: {typedText.length}</span>
          <span className="text-[11px] text-amber-300 font-serif italic">Meccanica di Precisione 1954</span>
        </div>

      </div>
    </div>
  );
}

export const typewriterHtmlCode = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Macchina da Scrivere Meccanica Vintage</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#171a1c] text-neutral-200 min-h-screen flex items-center justify-center p-3 sm:p-6 font-sans">

<div class="w-full max-w-xl mx-auto select-none p-2 sm:p-4 font-sans">
  <div class="relative bg-gradient-to-b from-[#2b353b] via-[#1f262a] to-[#12171a] rounded-3xl p-4 sm:p-6 shadow-2xl border-4 border-[#3d4950] text-neutral-200">
    
    <!-- Barra Rullo Foglio -->
    <div class="relative mb-6">
      <div class="w-full h-4 bg-gradient-to-r from-neutral-400 via-neutral-200 to-neutral-500 rounded-sm border border-neutral-600 shadow-sm flex items-center justify-between px-3">
        <span class="text-[7px] font-mono text-neutral-800 font-bold tracking-widest">|...|...|...|...|...|...|...|</span>
        <span class="text-[8px] font-mono text-neutral-900 font-black">ROYAL 1954</span>
      </div>

      <!-- Foglio di Carta Battuta -->
      <div class="relative -mt-2 mx-auto max-w-md bg-[#faf7ee] rounded-t-sm p-4 sm:p-6 shadow-xl border-x-2 border-t-2 border-[#d6cfbe] text-neutral-900 min-h-[140px]">
        <div id="paper-text" class="font-mono text-xs sm:text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap">Capitolo 1: La Notte dei Gatti Silenziosi.</div>
      </div>

      <!-- Tasto A Capo -->
      <button id="return-btn" class="absolute -top-3 right-2 px-3 py-1 rounded-full bg-gradient-to-b from-neutral-300 to-neutral-500 text-neutral-950 text-xs font-mono font-black border border-neutral-400 shadow cursor-pointer">
        DING! A CAPO
      </button>
    </div>

    <!-- Tastiera Rotonda Cromata -->
    <div class="bg-[#181e22] p-3 sm:p-4 rounded-2xl border-2 border-[#2b353b] shadow-inner space-y-2">
      <div id="keys-container" class="flex flex-wrap justify-center gap-1.5 sm:gap-2">
        <!-- Tasti generati via JS -->
      </div>
      <div class="flex justify-center items-center gap-2 pt-2">
        <button id="space-btn" class="w-48 sm:w-64 h-8 rounded-lg bg-neutral-900 border-2 border-neutral-500 text-neutral-400 font-mono text-xs cursor-pointer">
          SPAZIO
        </button>
        <button id="backspace-btn" class="px-3 py-1.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-mono font-bold cursor-pointer">
          ⌫ Canc
        </button>
      </div>
    </div>

  </div>
</div>

<script>
(function initTypewriter() {
  const paperText = document.getElementById('paper-text');
  const keysContainer = document.getElementById('keys-container');
  const letters = "QWERTYUIOPASDFGHJKLZXCVBNM.,";

  letters.split('').forEach(char => {
    const btn = document.createElement('button');
    btn.className = "w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-b from-white to-neutral-300 text-neutral-900 font-serif font-black text-xs sm:text-sm flex items-center justify-center shadow border border-neutral-400 active:scale-95 cursor-pointer";
    btn.textContent = char;
    btn.onclick = () => {
      paperText.textContent += char.toLowerCase();
    };
    keysContainer.appendChild(btn);
  });

  document.getElementById('space-btn')?.addEventListener('click', () => {
    paperText.textContent += ' ';
  });

  document.getElementById('backspace-btn')?.addEventListener('click', () => {
    paperText.textContent = paperText.textContent.slice(0, -1);
  });

  document.getElementById('return-btn')?.addEventListener('click', () => {
    paperText.textContent += '\\n';
  });
})();
</script>
</body>
</html>`;

export const typewriterJsCode = `/**
 * Mechanical Typewriter - Standalone Controller
 */
export class VintageTypewriter {
  constructor(initialText = '') {
    this.text = initialText;
  }
  type(char) {
    this.text += char;
    return this.text;
  }
  backspace() {
    this.text = this.text.slice(0, -1);
    return this.text;
  }
  returnCarriage() {
    this.text += '\\n';
    return this.text;
  }
}
`;

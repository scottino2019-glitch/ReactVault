import React, { useMemo, useRef, useState } from 'react';
import type { AppTheme } from '../theme';

interface CodeEditorProps {
  value: string;
  onChange: (nextValue: string) => void;
  relativePath: string;
  lineCount: number;
  hasUnsavedChanges: boolean;
  theme: AppTheme;
}

type TokenType = 'plain' | 'comment' | 'string' | 'keyword' | 'tag' | 'number' | 'type';

interface Token {
  type: TokenType;
  text: string;
}

const KEYWORDS = new Set([
  'import',
  'from',
  'export',
  'default',
  'function',
  'const',
  'let',
  'var',
  'return',
  'if',
  'else',
  'for',
  'while',
  'switch',
  'case',
  'break',
  'continue',
  'interface',
  'type',
  'extends',
  'implements',
  'async',
  'await',
  'try',
  'catch',
  'finally',
  'throw',
  'new',
  'typeof',
  'keyof',
  'as',
  'true',
  'false',
  'null',
  'undefined',
]);

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    if (line[i] === '/' && line[i + 1] === '/') {
      tokens.push({ type: 'comment', text: line.slice(i) });
      break;
    }

    if (line[i] === "'" || line[i] === '"' || line[i] === '`') {
      const quote = line[i];
      let j = i + 1;
      while (j < line.length) {
        if (line[j] === '\\') {
          j += 2;
          continue;
        }
        if (line[j] === quote) {
          j += 1;
          break;
        }
        j += 1;
      }
      tokens.push({ type: 'string', text: line.slice(i, j) });
      i = j;
      continue;
    }

    if (line[i] === '<' && /[a-zA-Z/]/.test(line[i + 1] ?? '')) {
      let j = i + 1;
      if (line[j] === '/') j += 1;
      while (j < line.length && /[a-zA-Z0-9_.]/.test(line[j])) {
        j += 1;
      }
      tokens.push({ type: 'tag', text: line.slice(i, j) });
      i = j;
      continue;
    }

    if (/[0-9]/.test(line[i]) && (i === 0 || !/[a-zA-Z0-9_]/.test(line[i - 1]))) {
      let j = i + 1;
      while (j < line.length && /[0-9.]/.test(line[j])) {
        j += 1;
      }
      tokens.push({ type: 'number', text: line.slice(i, j) });
      i = j;
      continue;
    }

    if (/[a-zA-Z_$]/.test(line[i])) {
      let j = i + 1;
      while (j < line.length && /[a-zA-Z0-9_$]/.test(line[j])) {
        j += 1;
      }
      const word = line.slice(i, j);
      if (KEYWORDS.has(word)) {
        tokens.push({ type: 'keyword', text: word });
      } else if (/^[A-Z]/.test(word)) {
        tokens.push({ type: 'type', text: word });
      } else {
        tokens.push({ type: 'plain', text: word });
      }
      i = j;
      continue;
    }

    let j = i + 1;
    while (
      j < line.length &&
      line[j] !== '/' &&
      line[j] !== "'" &&
      line[j] !== '"' &&
      line[j] !== '`' &&
      line[j] !== '<' &&
      !/[a-zA-Z0-9_$]/.test(line[j])
    ) {
      j += 1;
    }
    tokens.push({ type: 'plain', text: line.slice(i, j) });
    i = j;
  }

  return tokens;
}

const FONT_SIZE_CLASSES: Record<number, string> = {
  15: 'text-[15px] leading-6',
  17: 'text-[17px] leading-7',
  19: 'text-[19px] leading-8',
  21: 'text-[21px] leading-9',
};

const LINE_MIN_H_CLASSES: Record<number, string> = {
  15: 'min-h-6',
  17: 'min-h-7',
  19: 'min-h-8',
  21: 'min-h-9',
};

const FONT_STEPS = [15, 17, 19, 21] as const;

export function CodeEditor({
  value,
  onChange,
  relativePath,
  lineCount,
  hasUnsavedChanges,
  theme,
}: CodeEditorProps) {
  const [fontSize, setFontSize] = useState<number>(17);
  const preRef = useRef<HTMLPreElement | null>(null);
  const gutterRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const lines = useMemo(() => value.split('\n'), [value]);
  const tokenizedLines = useMemo(() => lines.map((l) => tokenizeLine(l)), [lines]);

  const handleScroll = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (preRef.current) {
      preRef.current.scrollTop = ta.scrollTop;
      preRef.current.scrollLeft = ta.scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = ta.scrollTop;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const updated = `${value.slice(0, start)}  ${value.slice(end)}`;
      onChange(updated);
      window.requestAnimationFrame(() => {
        target.selectionStart = start + 2;
        target.selectionEnd = start + 2;
      });
    }
  };

  const getTokenClass = (type: TokenType) => {
    switch (type) {
      case 'keyword':
        return theme.tokKeyword;
      case 'string':
        return theme.tokString;
      case 'tag':
        return theme.tokTag;
      case 'number':
        return theme.tokNumber;
      case 'type':
        return theme.tokType;
      case 'comment':
        return `${theme.tokComment} italic`;
      default:
        return theme.tokPlain;
    }
  };

  const stepFont = (dir: -1 | 1) => {
    const idx = FONT_STEPS.indexOf(fontSize as (typeof FONT_STEPS)[number]);
    const nextIdx = Math.min(FONT_STEPS.length - 1, Math.max(0, idx + dir));
    setFontSize(FONT_STEPS[nextIdx]);
  };

  const fontSizeClass = FONT_SIZE_CLASSES[fontSize] ?? FONT_SIZE_CLASSES[17];
  const lineMinHClass = LINE_MIN_H_CLASSES[fontSize] ?? LINE_MIN_H_CLASSES[17];

  return (
    <div className={`flex-1 min-h-0 flex flex-col ${theme.editorBg}`}>
      <div
        className={`shrink-0 px-4 py-3 border-b-2 ${theme.editorHeaderBg} ${theme.borderStrong} ${theme.inkPrimary} flex flex-wrap items-center justify-between gap-3`}
      >
        <span className="font-mono text-base font-bold truncate">{relativePath}</span>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`tabular-nums font-mono text-[15px] font-semibold ${theme.inkSecondary}`}>
            {lineCount} righe · {hasUnsavedChanges ? 'Modificato' : 'Sincronizzato'}
          </span>
          <div className={`flex items-center rounded-lg border-2 ${theme.borderStrong} ${theme.cardAltBg} overflow-hidden`}>
            <button
              type="button"
              onClick={() => stepFont(-1)}
              disabled={fontSize === FONT_STEPS[0]}
              title="Riduci testo codice"
              className={`px-2.5 py-1 text-[15px] font-bold ${theme.inkPrimary} ${theme.cardHoverBg} disabled:opacity-40 cursor-pointer`}
            >
              A-
            </button>
            <span className={`px-2 text-sm font-mono font-bold ${theme.inkSecondary}`}>
              {fontSize}px
            </span>
            <button
              type="button"
              onClick={() => stepFont(1)}
              disabled={fontSize === FONT_STEPS[FONT_STEPS.length - 1]}
              title="Ingrandisci testo codice"
              className={`px-2.5 py-1 text-[15px] font-bold ${theme.inkPrimary} ${theme.cardHoverBg} disabled:opacity-40 cursor-pointer`}
            >
              A+
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Line numbers */}
        <div
          ref={gutterRef}
          aria-hidden="true"
          className={`select-none py-4 pl-4 pr-4 text-right font-mono ${fontSizeClass} font-semibold border-r-2 ${theme.editorGutterBg} ${theme.borderStrong} ${theme.editorGutterInk} tabular-nums overflow-hidden shrink-0`}
        >
          {Array.from({ length: lineCount }, (_, idx) => (
            <div key={idx}>{idx + 1}</div>
          ))}
        </div>

        {/* Highlighted code + transparent aligned textarea */}
        <div className="relative flex-1 min-w-0 min-h-0 overflow-hidden">
          <pre
            ref={preRef}
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 m-0 p-4 font-mono ${fontSizeClass} font-medium whitespace-pre overflow-hidden`}
          >
            {tokenizedLines.map((lineTokens, idx) => (
              <div key={idx} className={lineMinHClass}>
                {lineTokens.length === 0 ? (
                  ' '
                ) : (
                  lineTokens.map((tok, tIdx) => (
                    <span key={tIdx} className={getTokenClass(tok.type)}>
                      {tok.text}
                    </span>
                  ))
                )}
              </div>
            ))}
          </pre>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            aria-label="Editor codice componente React"
            className={`code-editor relative z-10 w-full h-full p-4 font-mono ${fontSizeClass} font-medium bg-transparent text-transparent focus:outline-none resize-none whitespace-pre overflow-auto selection:bg-amber-400/35 ${theme.editorCaret}`}
          />
        </div>
      </div>
    </div>
  );
}

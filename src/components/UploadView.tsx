import React, { useRef, useState } from 'react';
import { Upload, FolderPlus, FileCode2, X, Check } from 'lucide-react';
import type { VaultCategory } from '../types/vault';
import type { AppTheme } from '../theme';

interface PendingFile {
  fileName: string;
  code: string;
  sizeBytes: number;
}

interface UploadViewProps {
  categories: VaultCategory[];
  onUploadSuccess: (savedIds: string[]) => Promise<void>;
  onCancel: () => void;
  theme: AppTheme;
}

export function UploadView({ categories, onUploadSuccess, onCancel, theme }: UploadViewProps) {
  const [mode, setMode] = useState<'files' | 'paste'>('files');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categories[0]?.name ?? 'generale'
  );
  const [newCategoryName, setNewCategoryName] = useState('');
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [pasteFileName, setPasteFileName] = useState('');
  const [pasteCode, setPasteCode] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const effectiveCategory = newCategoryName.trim() || selectedCategory || 'generale';

  const readDroppedFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMsg(null);

    const validExtensions = ['.tsx', '.jsx', '.ts', '.js'];
    const loaded: PendingFile[] = [];

    for (const file of Array.from(fileList)) {
      const lower = file.name.toLowerCase();
      if (!validExtensions.some((ext) => lower.endsWith(ext))) {
        continue;
      }
      const text = await file.text();
      loaded.push({
        fileName: file.name,
        code: text,
        sizeBytes: file.size,
      });
    }

    if (loaded.length === 0) {
      setErrorMsg('Seleziona almeno un file React valido (.tsx, .jsx, .ts, .js).');
      return;
    }

    setPendingFiles((prev) => {
      const byName = new Map(prev.map((f) => [f.fileName, f]));
      for (const item of loaded) {
        byName.set(item.fileName, item);
      }
      return Array.from(byName.values());
    });
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    await readDroppedFiles(e.dataTransfer.files);
  };

  const handleSaveFiles = async () => {
    setErrorMsg(null);
    setSubmitting(true);

    try {
      let payloadFiles: Array<{ fileName: string; code: string }> = [];

      if (mode === 'files') {
        if (pendingFiles.length === 0) {
          setErrorMsg('Aggiungi almeno un file prima di salvare nella cartella interna.');
          setSubmitting(false);
          return;
        }
        payloadFiles = pendingFiles.map((f) => ({ fileName: f.fileName, code: f.code }));
      } else {
        const trimmedName = pasteFileName.trim();
        if (!trimmedName) {
          setErrorMsg('Inserisci un nome file per il componente (es. MioBottone.tsx).');
          setSubmitting(false);
          return;
        }
        if (!pasteCode.trim()) {
          setErrorMsg('Incolla il codice React del componente.');
          setSubmitting(false);
          return;
        }
        payloadFiles = [{ fileName: trimmedName, code: pasteCode }];
      }

      const res = await fetch('/api/components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: effectiveCategory,
          files: payloadFiles,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Errore durante il salvataggio');
      }

      await onUploadSuccess(data.savedIds ?? []);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Errore imprevisto');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`flex-1 min-h-0 overflow-y-auto p-6 lg:p-10 ${theme.canvasBg}`}>
      <div
        className={`max-w-3xl mx-auto rounded-xl border-2 ${theme.borderStrong} ${theme.cardBg} p-6 lg:p-8 shadow-xl space-y-6`}
      >
        <div
          className={`flex flex-wrap items-center justify-between gap-4 border-b-2 ${theme.borderSubtle} pb-5`}
        >
          <div>
            <h1 className={`text-[26px] font-bold tracking-tight ${theme.inkPrimary}`}>
              Carica componenti nella cartella interna
            </h1>
            <p className={`mt-2 text-[17px] ${theme.inkSecondary}`}>
              Destinazione:{' '}
              <code className={`font-mono text-base font-bold ${theme.highlightText}`}>
                src/vault/{effectiveCategory.toLowerCase().replace(/\s+/g, '-')}/
              </code>
            </p>
          </div>
          <div className={`flex items-center gap-1 p-1 rounded-lg ${theme.inputBg} border-2 ${theme.borderStrong}`}>
            <button
              type="button"
              onClick={() => setMode('files')}
              className={`px-4 py-2 text-base font-bold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'files'
                  ? `${theme.accentBg} ${theme.accentInk} shadow-xs`
                  : `${theme.inkPrimary} ${theme.cardHoverBg}`
              }`}
            >
              Da file (.tsx / .jsx)
            </button>
            <button
              type="button"
              onClick={() => setMode('paste')}
              className={`px-4 py-2 text-base font-bold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'paste'
                  ? `${theme.accentBg} ${theme.accentInk} shadow-xs`
                  : `${theme.inkPrimary} ${theme.cardHoverBg}`
              }`}
            >
              Incolla codice
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={`block text-base font-bold ${theme.inkPrimary} mb-2`}>
              Categoria di destinazione
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setNewCategoryName('');
              }}
              className={`w-full px-4 py-3 text-base font-semibold rounded-lg border-2 ${theme.borderStrong} ${theme.inputBg} ${theme.inkPrimary} focus:outline-none ${theme.focusBorder}`}
            >
              {categories.length === 0 && <option value="generale">generale</option>}
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name} ({cat.count})
                </option>
              ))}
              {!categories.some((c) => c.name === 'generale') && categories.length > 0 && (
                <option value="generale">generale</option>
              )}
            </select>
          </div>

          <div>
            <label className={`block text-base font-bold ${theme.inkPrimary} mb-2`}>
              Oppure crea una nuova categoria
            </label>
            <div className="relative">
              <FolderPlus
                className={`w-5 h-5 ${theme.inkMuted} absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none`}
              />
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Es. modali, grafici, tabelle..."
                className={`w-full pl-11 pr-4 py-3 text-base font-medium rounded-lg border-2 ${theme.borderStrong} ${theme.inputBg} ${theme.inkPrimary} placeholder:opacity-70 focus:outline-none ${theme.focusBorder}`}
              />
            </div>
          </div>
        </div>

        {mode === 'files' ? (
          <div className="space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer ${
                isDragging
                  ? `${theme.activeBorder} ${theme.cardAltBg}`
                  : `${theme.borderStrong} ${theme.inputBg} ${theme.cardHoverBg}`
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".tsx,.jsx,.ts,.js"
                onChange={(e) => readDroppedFiles(e.target.files)}
                className="hidden"
              />
              <Upload className={`w-11 h-11 mx-auto ${theme.highlightText}`} />
              <p className={`mt-3.5 text-lg font-bold ${theme.inkPrimary}`}>
                Trascina qui i tuoi file .tsx o .jsx, oppure clicca per selezionarli
              </p>
              <p className={`mt-1.5 text-base ${theme.inkSecondary}`}>
                Puoi caricare più componenti contemporaneamente nella categoria scelta
              </p>
            </div>

            {pendingFiles.length > 0 && (
              <div
                className={`rounded-xl border-2 ${theme.borderStrong} ${theme.cardAltBg} divide-y ${theme.divideSubtle}`}
              >
                {pendingFiles.map((file) => (
                  <div
                    key={file.fileName}
                    className="flex items-center justify-between gap-4 px-4 py-3.5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileCode2 className={`w-5 h-5 ${theme.highlightText} shrink-0`} />
                      <div className="min-w-0">
                        <p className={`text-base font-bold ${theme.inkPrimary} truncate font-mono`}>
                          {file.fileName}
                        </p>
                        <p className={`text-[15px] ${theme.inkSecondary} tabular-nums`}>
                          {(file.sizeBytes / 1024).toFixed(1)} KB · src/vault/
                          {effectiveCategory.toLowerCase().replace(/\s+/g, '-')}/
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setPendingFiles((prev) =>
                          prev.filter((item) => item.fileName !== file.fileName)
                        )
                      }
                      aria-label={`Rimuovi ${file.fileName}`}
                      className={`p-2 rounded-md ${theme.inkSecondary} hover:text-red-500 ${theme.cardHoverBg} cursor-pointer`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className={`block text-base font-bold ${theme.inkPrimary} mb-2`}>
                Nome del file componente
              </label>
              <input
                type="text"
                value={pasteFileName}
                onChange={(e) => setPasteFileName(e.target.value)}
                placeholder="Es. MioComponente.tsx"
                className={`w-full px-4 py-3 text-base font-mono rounded-lg border-2 ${theme.borderStrong} ${theme.inputBg} ${theme.inkPrimary} placeholder:opacity-70 focus:outline-none ${theme.focusBorder}`}
              />
            </div>

            <div>
              <label className={`block text-base font-bold ${theme.inkPrimary} mb-2`}>
                Codice sorgente React (TSX / JSX)
              </label>
              <textarea
                value={pasteCode}
                onChange={(e) => setPasteCode(e.target.value)}
                rows={13}
                spellCheck={false}
                placeholder={`import { useState } from 'react';\n\nexport default function MioComponente() {\n  const [count, setCount] = useState(0);\n  return (\n    <button onClick={() => setCount(c => c + 1)} className="px-4 py-2 rounded-lg bg-amber-600 text-white">\n      Conteggio: {count}\n    </button>\n  );\n}`}
                className={`code-editor w-full p-4 text-[17px] leading-7 font-medium rounded-xl border-2 ${theme.borderStrong} ${theme.editorBg} ${theme.tokPlain} placeholder:opacity-60 focus:outline-none ${theme.focusBorder} resize-y`}
              />
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="rounded-lg border-2 border-red-600 bg-red-100 px-4 py-3 text-base font-bold text-red-950">
            {errorMsg}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className={`px-5 py-3 text-base font-bold rounded-lg border-2 ${theme.borderStrong} ${theme.cardAltBg} ${theme.inkPrimary} ${theme.cardHoverBg} cursor-pointer`}
          >
            Annulla
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleSaveFiles}
            className={`inline-flex items-center gap-2 px-5 py-3 text-base font-bold rounded-lg ${theme.accentBg} ${theme.accentHoverBg} ${theme.accentInk} disabled:opacity-60 cursor-pointer`}
          >
            <Check className="w-5 h-5" />
            {submitting ? 'Salvataggio in corso...' : 'Salva nella cartella interna'}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { VaultCategory } from '../types/vault';
import type { AppTheme } from '../theme';

interface NewComponentModalProps {
  open: boolean;
  categories: VaultCategory[];
  defaultCategory: string;
  onClose: () => void;
  onCreated: (savedId: string) => Promise<void>;
  theme: AppTheme;
}

function buildNeutralTemplate(componentName: string): string {
  const cleanName = componentName.replace(/[^a-zA-Z0-9_]/g, '') || 'NuovoComponente';
  const pascal = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  return `import { useState } from 'react';

interface ${pascal}Props {
  titolo?: string;
}

export default function ${pascal}({ titolo = '${pascal}' }: ${pascal}Props) {
  const [attivo, setAttivo] = useState(false);

  return (
    <div className="p-6 rounded-xl border-2 border-amber-500/60 bg-slate-800 max-w-sm text-amber-50">
      <h2 className="text-xl font-bold">
        {titolo}
      </h2>
      <p className="mt-2 text-base text-slate-200">
        Stato attuale: {attivo ? 'Attivo' : 'Inattivo'}
      </p>
      <button
        type="button"
        onClick={() => setAttivo((prev) => !prev)}
        className="mt-4 px-4 py-2.5 rounded-lg text-base font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer"
      >
        Cambia stato
      </button>
    </div>
  );
}
`;
}

export function NewComponentModal({
  open,
  categories,
  defaultCategory,
  onClose,
  onCreated,
  theme,
}: NewComponentModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(defaultCategory || 'generale');
  const [customCategory, setCustomCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawName = name.trim();
    if (!rawName) {
      setError('Inserisci il nome del componente.');
      return;
    }

    const fileName =
      rawName.endsWith('.tsx') || rawName.endsWith('.jsx') ? rawName : `${rawName}.tsx`;
    const baseName = fileName.replace(/\.(tsx|jsx|ts|js)$/i, '');
    const targetCategory = customCategory.trim() || category || 'generale';

    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: targetCategory,
          fileName,
          code: buildNeutralTemplate(baseName),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Errore creazione componente');
      }
      const savedId = data.savedIds?.[0];
      setName('');
      setCustomCategory('');
      await onCreated(savedId);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore imprevisto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4">
      <div
        className={`w-full max-w-md rounded-xl border-2 ${theme.borderStrong} ${theme.cardBg} p-6 shadow-2xl`}
      >
        <div
          className={`flex items-center justify-between gap-4 pb-4 border-b-2 ${theme.borderSubtle}`}
        >
          <h2 className={`text-xl font-bold ${theme.inkPrimary}`}>
            Crea nuovo componente
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi"
            className={`p-1.5 rounded-md ${theme.inkSecondary} ${theme.cardHoverBg} cursor-pointer`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className={`block text-base font-bold ${theme.inkPrimary} mb-2`}>
              Nome file (.tsx o .jsx)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es. PannelloFiltri.tsx"
              autoFocus
              className={`w-full px-4 py-3 text-base font-mono rounded-lg border-2 ${theme.borderStrong} ${theme.inputBg} ${theme.inkPrimary} placeholder:opacity-70 focus:outline-none ${theme.focusBorder}`}
            />
          </div>

          <div>
            <label className={`block text-base font-bold ${theme.inkPrimary} mb-2`}>
              Categoria esistente
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCustomCategory('');
              }}
              className={`w-full px-4 py-3 text-base font-semibold rounded-lg border-2 ${theme.borderStrong} ${theme.inputBg} ${theme.inkPrimary} focus:outline-none ${theme.focusBorder}`}
            >
              {categories.length === 0 && <option value="generale">generale</option>}
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
              {!categories.some((c) => c.name === 'generale') && categories.length > 0 && (
                <option value="generale">generale</option>
              )}
            </select>
          </div>

          <div>
            <label className={`block text-base font-bold ${theme.inkPrimary} mb-2`}>
              Oppure nuova categoria
            </label>
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Es. moduli, layout, pulsanti..."
              className={`w-full px-4 py-3 text-base rounded-lg border-2 ${theme.borderStrong} ${theme.inputBg} ${theme.inkPrimary} placeholder:opacity-70 focus:outline-none ${theme.focusBorder}`}
            />
          </div>

          {error && <p className="text-base font-bold text-red-400">{error}</p>}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2.5 text-base font-bold rounded-lg border-2 ${theme.borderStrong} ${theme.cardAltBg} ${theme.inkPrimary} ${theme.cardHoverBg} cursor-pointer`}
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-5 py-2.5 text-base font-bold rounded-lg ${theme.accentBg} ${theme.accentHoverBg} ${theme.accentInk} disabled:opacity-60 cursor-pointer`}
            >
              {saving ? 'Creazione...' : 'Crea componente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

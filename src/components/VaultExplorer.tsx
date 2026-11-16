import React, { useState } from 'react';
import {
  Folder,
  FolderPlus,
  RefreshCw,
  Trash2,
  ExternalLink,
  Download,
  Edit3,
  Check,
  X,
} from 'lucide-react';
import type { VaultCategory, VaultComponent } from '../types/vault';
import type { AppTheme } from '../theme';

interface VaultExplorerProps {
  vaultPath: string;
  writable?: boolean;
  categories: VaultCategory[];
  components: VaultComponent[];
  onRefresh: () => Promise<void>;
  onSyncSeed?: () => void;
  onOpenComponent: (componentId: string) => void;
  onDeleteComponent: (comp: VaultComponent) => Promise<void>;
  onMoveComponent: (comp: VaultComponent, newCategory: string) => Promise<void>;
  onCreateCategory: (name: string) => Promise<void>;
  onRenameCategory: (oldName: string, newName: string) => Promise<void>;
  onDeleteCategory: (name: string, force: boolean) => Promise<void>;
  theme: AppTheme;
}

export function VaultExplorer({
  vaultPath,
  writable,
  categories,
  components,
  onRefresh,
  onSyncSeed,
  onOpenComponent,
  onDeleteComponent,
  onMoveComponent,
  onCreateCategory,
  onRenameCategory,
  onDeleteCategory,
  theme,
}: VaultExplorerProps) {
  const [newCat, setNewCat] = useState('');
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editingCatValue, setEditingCatValue] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    await onCreateCategory(newCat.trim());
    setNewCat('');
  };

  const handleDownload = (comp: VaultComponent) => {
    const blob = new Blob([comp.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = comp.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex-1 min-h-0 overflow-y-auto p-6 lg:p-10 ${theme.canvasBg}`}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div
          className={`rounded-xl border-2 ${theme.borderStrong} ${theme.cardBg} p-6 shadow-md space-y-4`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className={`text-[26px] font-bold tracking-tight ${theme.inkPrimary}`}>
                Cartella interna dell&apos;app
              </h1>
              <p className={`mt-1.5 text-[17px] ${theme.inkSecondary}`}>
                Percorso locale:{' '}
                <code className={`font-mono text-base font-bold ${theme.highlightText}`}>
                  {vaultPath}/
                </code>{' '}
                · <span className="tabular-nums font-bold">{categories.length}</span> categorie ·{' '}
                <span className="tabular-nums font-bold">{components.length}</span> componenti
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {writable === false && onSyncSeed && (
                <button
                  type="button"
                  onClick={onSyncSeed}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 text-base font-bold rounded-lg border-2 ${theme.activeBorder} ${theme.cardAltBg} ${theme.inkPrimary} ${theme.cardHoverBg} cursor-pointer whitespace-nowrap shrink-0`}
                >
                  Importa da vault/
                </button>
              )}
              <button
                type="button"
                onClick={handleRefresh}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-base font-bold rounded-lg border-2 ${theme.borderStrong} ${theme.cardAltBg} ${theme.inkPrimary} ${theme.cardHoverBg} cursor-pointer whitespace-nowrap shrink-0`}
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                Scansiona cartella
              </button>
            </div>
          </div>

          {writable === false && (
            <div
              className={`rounded-lg border-2 ${theme.borderSubtle} ${theme.inputBg} px-4 py-3 text-base ${theme.inkSecondary}`}
            >
              Su Vercel il filesystem del server è in sola lettura: puoi aggiungere i file{' '}
              <code className={`font-mono font-bold ${theme.highlightText}`}>.tsx/.jsx</code>{' '}
              direttamente nella cartella{' '}
              <code className={`font-mono font-bold ${theme.highlightText}`}>
                vault/&lt;categoria&gt;/
              </code>{' '}
              del progetto prima del deploy per averli già inclusi automaticamente, mentre i file
              caricati qui dal browser vengono salvati nella memoria locale del browser.
            </div>
          )}
        </div>

        <section
          className={`rounded-xl border-2 ${theme.borderStrong} ${theme.cardBg} p-6 shadow-md space-y-4`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className={`text-xl font-bold ${theme.inkPrimary}`}>
              Sottocartelle / Categorie
            </h2>
            <form onSubmit={handleCreateCat} className="flex items-center gap-2">
              <input
                type="text"
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                placeholder="Nuova categoria..."
                className={`px-4 py-2.5 text-base rounded-lg border-2 ${theme.borderStrong} ${theme.inputBg} ${theme.inkPrimary} placeholder:opacity-70 focus:outline-none ${theme.focusBorder}`}
              />
              <button
                type="submit"
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-base font-bold rounded-lg ${theme.accentBg} ${theme.accentHoverBg} ${theme.accentInk} cursor-pointer whitespace-nowrap shrink-0`}
              >
                <FolderPlus className="w-5 h-5" />
                Crea cartella
              </button>
            </form>
          </div>

          {categories.length === 0 ? (
            <div
              className={`rounded-lg border-2 ${theme.borderStrong} ${theme.cardAltBg} p-5 text-base ${theme.inkPrimary}`}
            >
              Nessuna cartella categoria presente in{' '}
              <code className="font-mono font-bold">vault/</code>.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {categories.map((cat) => {
                const isEditing = editingCat === cat.name;
                return (
                  <div
                    key={cat.name}
                    className={`flex items-center justify-between gap-2 px-4 py-3.5 rounded-xl border-2 ${theme.borderStrong} ${theme.cardAltBg}`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Folder className={`w-5 h-5 ${theme.highlightText} shrink-0`} />
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingCatValue}
                          onChange={(e) => setEditingCatValue(e.target.value)}
                          autoFocus
                          className={`w-full px-2.5 py-1 text-base font-mono rounded border-2 ${theme.activeBorder} ${theme.inputBg} ${theme.inkPrimary} focus:outline-none`}
                        />
                      ) : (
                        <div className="min-w-0">
                          <p className={`text-[17px] font-bold ${theme.inkPrimary} truncate font-mono`}>
                            {cat.name}
                          </p>
                          <p className={`text-[15px] font-semibold ${theme.inkSecondary} tabular-nums`}>
                            {cat.count} file
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={async () => {
                              if (editingCatValue.trim()) {
                                await onRenameCategory(cat.name, editingCatValue.trim());
                              }
                              setEditingCat(null);
                            }}
                            aria-label="Conferma rinomina"
                            className={`p-2 rounded text-emerald-400 ${theme.cardHoverBg} cursor-pointer`}
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCat(null)}
                            aria-label="Annulla rinomina"
                            className={`p-2 rounded ${theme.inkSecondary} ${theme.cardHoverBg} cursor-pointer`}
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCat(cat.name);
                              setEditingCatValue(cat.name);
                            }}
                            title="Rinomina cartella"
                            className={`p-2 rounded ${theme.inkSecondary} ${theme.cardHoverBg} cursor-pointer`}
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteCategory(cat.name, cat.count > 0)}
                            title="Elimina cartella"
                            className={`p-2 rounded ${theme.inkSecondary} hover:text-red-400 ${theme.cardHoverBg} cursor-pointer`}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section
          className={`rounded-xl border-2 ${theme.borderStrong} ${theme.cardBg} p-6 shadow-md space-y-4`}
        >
          <h2 className={`text-xl font-bold ${theme.inkPrimary}`}>
            Elenco file registrati
          </h2>
          {components.length === 0 ? (
            <div
              className={`rounded-lg border-2 ${theme.borderStrong} ${theme.cardAltBg} p-8 text-center text-[17px] font-semibold ${theme.inkSecondary}`}
            >
              Nessun componente ancora caricato nella cartella interna.
            </div>
          ) : (
            <div
              className={`rounded-xl border-2 ${theme.borderStrong} ${theme.cardAltBg} overflow-x-auto`}
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr
                    className={`border-b-2 ${theme.borderStrong} ${theme.editorHeaderBg} text-[15px] font-bold ${theme.inkPrimary}`}
                  >
                    <th className="py-3.5 px-4">Componente</th>
                    <th className="py-3.5 px-4">Percorso file</th>
                    <th className="py-3.5 px-4">Categoria</th>
                    <th className="py-3.5 px-4 text-right">Dimensione</th>
                    <th className="py-3.5 px-4 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme.divideSubtle} text-base`}>
                  {components.map((comp) => (
                    <tr key={comp.id} className={`${theme.cardHoverBg} transition-colors`}>
                      <td className={`py-3.5 px-4 font-bold ${theme.inkPrimary}`}>
                        {comp.name}
                      </td>
                      <td className={`py-3.5 px-4 font-mono text-[15px] ${theme.inkSecondary}`}>
                        {comp.relativePath}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={comp.category}
                          onChange={(e) => onMoveComponent(comp, e.target.value)}
                          aria-label={`Categoria per ${comp.name}`}
                          className={`px-3 py-1.5 text-base font-semibold rounded border-2 ${theme.borderStrong} ${theme.inputBg} ${theme.inkPrimary} focus:outline-none ${theme.focusBorder}`}
                        >
                          {categories.map((cat) => (
                            <option key={cat.name} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-mono text-[15px] font-semibold ${theme.inkSecondary} tabular-nums`}
                      >
                        {(comp.sizeBytes / 1024).toFixed(1)} KB
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenComponent(comp.id)}
                            title="Apri anteprima"
                            className={`p-2 rounded ${theme.inkSecondary} ${theme.cardHoverBg} cursor-pointer`}
                          >
                            <ExternalLink className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownload(comp)}
                            title="Scarica file"
                            className={`p-2 rounded ${theme.inkSecondary} ${theme.cardHoverBg} cursor-pointer`}
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteComponent(comp)}
                            title="Elimina file"
                            className={`p-2 rounded ${theme.inkSecondary} hover:text-red-400 ${theme.cardHoverBg} cursor-pointer`}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

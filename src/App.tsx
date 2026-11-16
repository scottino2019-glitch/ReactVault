import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Folder,
  FolderPlus,
  FileCode2,
  Plus,
  Monitor,
  Tablet,
  Smartphone,
  Copy,
  Check,
  Download,
  Trash2,
  Save,
  SlidersHorizontal,
  Upload,
  Menu,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import type { CompileResult, VaultComponent, VaultStateResponse } from './types/vault';
import {
  LivePreviewFrame,
  type PreviewBackdrop,
  type PreviewViewport,
} from './components/LivePreviewFrame';
import { CodeEditor } from './components/CodeEditor';
import { UploadView } from './components/UploadView';
import { VaultExplorer } from './components/VaultExplorer';
import { NewComponentModal } from './components/NewComponentModal';
import { APP_THEMES, type AppThemeId } from './theme';
import * as vaultClient from './lib/vaultClient';
import { compileInBrowser } from './lib/browserCompiler';

type ActiveSection = 'library' | 'upload' | 'explorer';
type SplitMode = 'split' | 'preview' | 'code';

export default function App() {
  const [themeId, setThemeId] = useState<AppThemeId>(() => {
    try {
      const saved = window.localStorage.getItem('reactvault_theme');
      return saved === 'salvia' ? 'salvia' : 'petrolio';
    } catch {
      return 'petrolio';
    }
  });
  const theme = APP_THEMES[themeId];

  useEffect(() => {
    try {
      window.localStorage.setItem('reactvault_theme', themeId);
    } catch {
      // ignore storage errors
    }
  }, [themeId]);

  const [vault, setVault] = useState<VaultStateResponse>({
    vaultPath: 'vault',
    categories: [],
    components: [],
  });
  const [loadingVault, setLoadingVault] = useState(true);
  const [section, setSection] = useState<ActiveSection>('library');
  const [selectedCategory, setSelectedCategory] = useState<string>('__all__');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [draftCode, setDraftCode] = useState('');
  const [savedCode, setSavedCode] = useState('');
  const [savingCode, setSavingCode] = useState(false);

  const [splitMode, setSplitMode] = useState<SplitMode>('split');
  const [viewport, setViewport] = useState<PreviewViewport>('desktop');
  const [backdrop, setBackdrop] = useState<PreviewBackdrop>('neutral');
  const [paddedStage, setPaddedStage] = useState(true);

  const [compileResult, setCompileResult] = useState<CompileResult | null>(null);
  const [compiling, setCompiling] = useState(false);
  const [showPropsPanel, setShowPropsPanel] = useState(false);
  const [propOverrides, setPropOverrides] = useState<Record<string, string | number | boolean>>({});

  const [newCategoryInline, setNewCategoryInline] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [copied, setCopied] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [dropActive, setDropActive] = useState(false);

  const quickFileInputRef = useRef<HTMLInputElement | null>(null);
  const compileAbortRef = useRef<AbortController | null>(null);

  const fetchVault = useCallback(async (preferredId?: string) => {
    try {
      const data = await vaultClient.loadVault();
      setVault(data);

      setSelectedId((prevId) => {
        if (preferredId && data.components.some((c) => c.id === preferredId)) {
          return preferredId;
        }
        if (prevId && data.components.some((c) => c.id === prevId)) {
          return prevId;
        }
        return data.components[0]?.id ?? null;
      });
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : 'Errore lettura libreria');
    } finally {
      setLoadingVault(false);
    }
  }, []);

  useEffect(() => {
    fetchVault();
  }, [fetchVault]);

  const activeComponent: VaultComponent | null = useMemo(
    () => vault.components.find((c) => c.id === selectedId) ?? null,
    [vault.components, selectedId]
  );

  useEffect(() => {
    if (activeComponent) {
      setDraftCode(activeComponent.code);
      setSavedCode(activeComponent.code);
      setPropOverrides({});
      setConfirmDeleteId(null);
    } else {
      setDraftCode('');
      setSavedCode('');
      setCompileResult(null);
    }
  }, [activeComponent?.id]);

  const runCompile = useCallback(async (code: string, fileName: string) => {
    if (!code.trim()) {
      setCompileResult(null);
      return;
    }

    compileAbortRef.current?.abort();
    const controller = new AbortController();
    compileAbortRef.current = controller;

    setCompiling(true);
    try {
      const diskAvailable = await vaultClient.isDiskBackendAvailable();
      if (diskAvailable) {
        try {
          const res = await fetch('/api/compile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, fileName }),
            signal: controller.signal,
          });
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            const data: CompileResult = await res.json();
            if (!controller.signal.aborted) {
              setCompileResult(data);
            }
            return;
          }
        } catch (err) {
          if ((err as { name?: string })?.name === 'AbortError') return;
          // Fallback seamlessly to in-browser compiler below
        }
      }

      const browserData = await compileInBrowser(code, fileName);
      if (!controller.signal.aborted) {
        setCompileResult(browserData);
      }
    } catch (err) {
      if ((err as { name?: string })?.name !== 'AbortError') {
        setCompileResult({
          error: {
            message: err instanceof Error ? err.message : 'Errore compilazione componente',
          },
        });
      }
    } finally {
      if (!controller.signal.aborted) {
        setCompiling(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!activeComponent) return;
    const timer = window.setTimeout(() => {
      runCompile(draftCode, activeComponent.fileName);
    }, 160);
    return () => window.clearTimeout(timer);
  }, [draftCode, activeComponent?.id, activeComponent?.fileName, runCompile]);

  const hasUnsavedChanges = activeComponent !== null && draftCode !== savedCode;

  const handleSaveCode = useCallback(async () => {
    if (!activeComponent || !hasUnsavedChanges) return;
    setSavingCode(true);
    setBannerError(null);
    try {
      const data = await vaultClient.updateComponent(activeComponent, { code: draftCode });
      setSavedCode(draftCode);
      setVault(data.vault);
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : 'Errore salvataggio file');
    } finally {
      setSavingCode(false);
    }
  }, [activeComponent, draftCode, hasUnsavedChanges]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        if (section === 'library' && activeComponent) {
          e.preventDefault();
          handleSaveCode();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [section, activeComponent, handleSaveCode]);

  const handleCreateCategory = async (name: string) => {
    setBannerError(null);
    try {
      const data = await vaultClient.createCategory(name);
      setVault(data.vault);
      setSelectedCategory(data.name);
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : 'Errore creazione categoria');
    }
  };

  const handleRenameCategory = async (oldName: string, newName: string) => {
    setBannerError(null);
    try {
      const data = await vaultClient.renameCategory(oldName, newName);
      setVault(data.vault);
      if (selectedCategory === oldName) {
        setSelectedCategory(data.name);
      }
      if (activeComponent?.category === oldName) {
        setSelectedId(`${data.name}/${activeComponent.fileName}`);
      }
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : 'Errore rinomina categoria');
    }
  };

  const handleDeleteCategory = async (name: string, force: boolean) => {
    setBannerError(null);
    try {
      const data = await vaultClient.deleteCategory(name, force);
      setVault(data.vault);
      if (selectedCategory === name) {
        setSelectedCategory('__all__');
      }
      if (activeComponent?.category === name) {
        setSelectedId(data.vault.components[0]?.id ?? null);
      }
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : 'Errore eliminazione categoria');
    }
  };

  const handleMoveComponent = async (comp: VaultComponent, newCategory: string) => {
    if (comp.category === newCategory) return;
    setBannerError(null);
    try {
      const data = await vaultClient.updateComponent(comp, { newCategory });
      setVault(data.vault);
      if (selectedId === comp.id) {
        setSelectedId(data.id);
      }
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : 'Errore spostamento componente');
    }
  };

  const handleDeleteComponent = async (comp: VaultComponent) => {
    setBannerError(null);
    try {
      const data = await vaultClient.deleteComponent(comp);
      setVault(data.vault);
      setConfirmDeleteId(null);
      if (selectedId === comp.id) {
        setSelectedId(data.vault.components[0]?.id ?? null);
      }
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : 'Errore eliminazione componente');
    }
  };

  const handleQuickUploadFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const validExt = ['.tsx', '.jsx', '.ts', '.js'];
    const payload: Array<{ fileName: string; code: string }> = [];

    for (const file of Array.from(fileList)) {
      if (!validExt.some((ext) => file.name.toLowerCase().endsWith(ext))) continue;
      payload.push({
        fileName: file.name,
        code: await file.text(),
      });
    }

    if (payload.length === 0) {
      setBannerError('Carica file con estensione .tsx, .jsx, .ts o .js.');
      return;
    }

    const targetCategory =
      selectedCategory !== '__all__' ? selectedCategory : vault.categories[0]?.name || 'generale';

    try {
      const data = await vaultClient.uploadComponents({
        category: targetCategory,
        files: payload,
      });
      setVault(data.vault);
      if (data.savedIds?.[0]) {
        setSelectedId(data.savedIds[0]);
        setSection('library');
      }
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : 'Errore caricamento rapido');
    }
  };

  const filteredComponents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return vault.components.filter((comp) => {
      if (selectedCategory !== '__all__' && comp.category !== selectedCategory) {
        return false;
      }
      if (!q) return true;
      return (
        comp.name.toLowerCase().includes(q) ||
        comp.fileName.toLowerCase().includes(q) ||
        comp.category.toLowerCase().includes(q)
      );
    });
  }, [vault.components, selectedCategory, searchQuery]);

  const detectedProps = compileResult?.detectedProps ?? [];
  const lineCount = useMemo(() => Math.max(1, draftCode.split('\n').length), [draftCode]);

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(draftCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const handleDownloadActive = () => {
    if (!activeComponent) return;
    const blob = new Blob([draftCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeComponent.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`h-screen flex flex-col ${theme.canvasBg} ${theme.inkPrimary} overflow-hidden text-[17px]`}>
      {/* Top Bar */}
      <header
        className={`h-[70px] shrink-0 border-b-[3px] ${theme.headerBorder} ${theme.headerBg} px-5 lg:px-7 flex items-center justify-between gap-6 ${theme.inkPrimary}`}
      >
        <div className="flex items-center gap-3 shrink-0">
          {section === 'library' && (
            <button
              type="button"
              onClick={() => setMobileSidebarOpen((v) => !v)}
              aria-label="Apri menu categorie"
              className={`lg:hidden p-2 -ml-2 rounded-lg ${theme.inkPrimary} ${theme.cardHoverBg} cursor-pointer`}
            >
              {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
          <button
            type="button"
            onClick={() => setSection('library')}
            className={`font-display text-2xl font-bold tracking-tight ${theme.inkPrimary} whitespace-nowrap shrink-0 cursor-pointer`}
          >
            ReactVault
          </button>
        </div>

        <nav className="flex items-center gap-6 lg:gap-9 h-full">
          <button
            type="button"
            onClick={() => setSection('library')}
            className={`relative h-full inline-flex items-center text-[17px] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              section === 'library' ? theme.highlightText : `${theme.inkSecondary} hover:opacity-100`
            }`}
          >
            Libreria
            {section === 'library' && (
              <span className={`absolute inset-x-0 bottom-0 h-1 ${theme.accentBg}`} />
            )}
          </button>
          <button
            type="button"
            onClick={() => setSection('upload')}
            className={`relative h-full inline-flex items-center text-[17px] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              section === 'upload' ? theme.highlightText : `${theme.inkSecondary} hover:opacity-100`
            }`}
          >
            Carica File
            {section === 'upload' && (
              <span className={`absolute inset-x-0 bottom-0 h-1 ${theme.accentBg}`} />
            )}
          </button>
          <button
            type="button"
            onClick={() => setSection('explorer')}
            className={`relative h-full inline-flex items-center text-[17px] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              section === 'explorer' ? theme.highlightText : `${theme.inkSecondary} hover:opacity-100`
            }`}
          >
            Esplora Cartella
            {section === 'explorer' && (
              <span className={`absolute inset-x-0 bottom-0 h-1 ${theme.accentBg}`} />
            )}
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {/* Eye-comfort palette switcher */}
          <div
            className={`hidden md:flex items-center p-1 rounded-lg border-2 ${theme.borderStrong} ${theme.inputBg}`}
            role="group"
            aria-label="Tema visivo riposante"
          >
            {(['petrolio', 'salvia'] as const).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setThemeId(id)}
                className={`px-3 py-1 rounded-md text-[15px] font-bold transition-colors cursor-pointer ${
                  themeId === id
                    ? `${theme.accentBg} ${theme.accentInk}`
                    : `${theme.inkSecondary} ${theme.cardHoverBg}`
                }`}
              >
                {APP_THEMES[id].label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-base font-bold rounded-lg ${theme.accentBg} ${theme.accentHoverBg} ${theme.accentInk} transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm`}
          >
            <Plus className="w-5 h-5" />
            Nuovo
          </button>
        </div>
      </header>

      {bannerError && (
        <div className="shrink-0 bg-red-100 border-b-2 border-red-600 px-6 py-3 flex items-center justify-between gap-4 text-base font-bold text-red-950">
          <span>{bannerError}</span>
          <button
            type="button"
            onClick={() => setBannerError(null)}
            className="p-1 hover:opacity-75 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main Content */}
      {section === 'upload' ? (
        <UploadView
          categories={vault.categories}
          theme={theme}
          onUploadSuccess={async (savedIds) => {
            await fetchVault(savedIds[0]);
            setSection('library');
          }}
          onCancel={() => setSection('library')}
        />
      ) : section === 'explorer' ? (
        <VaultExplorer
          vaultPath={vault.vaultPath}
          writable={vault.writable}
          categories={vault.categories}
          components={vault.components}
          theme={theme}
          onRefresh={() => fetchVault()}
          onSyncSeed={() => {
            const next = vaultClient.syncFromRepoSeed();
            setVault(next);
          }}
          onOpenComponent={(id) => {
            setSelectedId(id);
            setSection('library');
          }}
          onDeleteComponent={handleDeleteComponent}
          onMoveComponent={handleMoveComponent}
          onCreateCategory={handleCreateCategory}
          onRenameCategory={handleRenameCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      ) : (
        <div className="flex-1 min-h-0 flex relative overflow-hidden">
          {/* Sidebar */}
          <aside
            className={`${
              mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            } fixed lg:static inset-y-[70px] left-0 z-30 w-[340px] shrink-0 border-r-2 ${theme.borderStrong} ${theme.sidebarBg} ${theme.inkPrimary} flex flex-col transition-transform duration-150`}
          >
            <div className={`p-4 border-b-2 ${theme.borderSubtle}`}>
              <div className="relative">
                <Search className={`w-5 h-5 ${theme.inkMuted} absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cerca componente..."
                  className={`w-full pl-11 pr-4 py-3 text-base font-semibold rounded-lg border-2 ${theme.borderStrong} ${theme.inputBg} ${theme.inkPrimary} placeholder:opacity-70 focus:outline-none ${theme.focusBorder}`}
                />
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6">
              {/* Categories */}
              <div>
                <div className="flex items-center justify-between px-1 mb-3">
                  <span className={`text-[15px] font-bold uppercase tracking-wider ${theme.inkSecondary}`}>
                    Categorie
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowNewCategoryInput((v) => !v)}
                    title="Nuova categoria"
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border-2 ${theme.borderStrong} ${theme.cardBg} ${theme.inkPrimary} ${theme.cardHoverBg} text-sm font-bold cursor-pointer`}
                  >
                    <FolderPlus className="w-4 h-4" />
                    Nuova
                  </button>
                </div>

                {showNewCategoryInput && (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!newCategoryInline.trim()) return;
                      await handleCreateCategory(newCategoryInline.trim());
                      setNewCategoryInline('');
                      setShowNewCategoryInput(false);
                    }}
                    className="mb-3 flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={newCategoryInline}
                      onChange={(e) => setNewCategoryInline(e.target.value)}
                      placeholder="Nome cartella..."
                      autoFocus
                      className={`flex-1 min-w-0 px-3 py-2.5 text-base rounded-lg border-2 ${theme.borderStrong} ${theme.inputBg} ${theme.inkPrimary} placeholder:opacity-70 focus:outline-none ${theme.focusBorder}`}
                    />
                    <button
                      type="submit"
                      className={`px-4 py-2.5 text-base font-bold rounded-lg ${theme.accentBg} ${theme.accentHoverBg} ${theme.accentInk} cursor-pointer`}
                    >
                      Ok
                    </button>
                  </form>
                )}

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('__all__')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-base font-bold transition-colors border-2 cursor-pointer ${
                      selectedCategory === '__all__'
                        ? `${theme.accentBg} ${theme.accentInk} ${theme.activeBorder} shadow-sm`
                        : `${theme.cardAltBg} ${theme.inkPrimary} ${theme.borderSubtle} ${theme.cardHoverBg}`
                    }`}
                  >
                    <span className="truncate">Tutti i componenti</span>
                    <span className="tabular-nums text-[15px] font-mono">
                      {vault.components.length}
                    </span>
                  </button>

                  {vault.categories.map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-base font-bold transition-colors border-2 cursor-pointer ${
                        selectedCategory === cat.name
                          ? `${theme.accentBg} ${theme.accentInk} ${theme.activeBorder} shadow-sm`
                          : `${theme.cardAltBg} ${theme.inkPrimary} ${theme.borderSubtle} ${theme.cardHoverBg}`
                      }`}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <Folder className="w-5 h-5 shrink-0" />
                        <span className="truncate">{cat.name}</span>
                      </span>
                      <span className="tabular-nums text-[15px] font-mono">
                        {cat.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Components List */}
              <div>
                <div className="flex items-center justify-between px-1 mb-3">
                  <span className={`text-[15px] font-bold uppercase tracking-wider ${theme.inkSecondary}`}>
                    File ({filteredComponents.length})
                  </span>
                </div>

                {loadingVault ? (
                  <div className="space-y-2 px-1">
                    <div className={`h-14 rounded-lg ${theme.cardBg} animate-pulse`} />
                    <div className={`h-14 rounded-lg ${theme.cardBg} animate-pulse`} />
                  </div>
                ) : filteredComponents.length === 0 ? (
                  <p className={`px-3 py-2 text-base font-semibold ${theme.inkSecondary}`}>
                    Nessun componente trovato.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredComponents.map((comp) => {
                      const isSelected = comp.id === selectedId;
                      return (
                        <button
                          key={comp.id}
                          type="button"
                          onClick={() => {
                            setSelectedId(comp.id);
                            setMobileSidebarOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors border-2 cursor-pointer ${
                            isSelected
                              ? `${theme.accentBg} ${theme.accentInk} ${theme.activeBorder} shadow-sm`
                              : `${theme.cardBg} ${theme.inkPrimary} ${theme.borderSubtle} ${theme.cardHoverBg}`
                          }`}
                        >
                          <FileCode2 className="w-5 h-5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-base font-bold truncate">{comp.name}</p>
                            <p
                              className={`text-[15px] truncate font-mono ${
                                isSelected ? 'opacity-90' : theme.inkSecondary
                              }`}
                            >
                              {comp.category} / {comp.fileName}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div
              className={`p-4 border-t-2 ${theme.borderStrong} ${theme.editorHeaderBg} flex items-center justify-between gap-2 text-[15px] font-bold ${theme.inkSecondary}`}
            >
              <span className="font-mono truncate">Cartella: {vault.vaultPath}/</span>
            </div>
          </aside>

          {/* Main Workbench */}
          <main className={`flex-1 min-w-0 min-h-0 flex flex-col ${theme.canvasBg}`}>
            {!activeComponent ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDropActive(true);
                }}
                onDragLeave={() => setDropActive(false)}
                onDrop={async (e) => {
                  e.preventDefault();
                  setDropActive(false);
                  await handleQuickUploadFiles(e.dataTransfer.files);
                }}
                className="flex-1 flex items-center justify-center p-6"
              >
                <div
                  className={`w-full max-w-xl rounded-xl border-2 p-10 text-center shadow-xl transition-colors ${
                    dropActive
                      ? `${theme.activeBorder} ${theme.cardHoverBg}`
                      : `${theme.borderStrong} ${theme.cardBg}`
                  }`}
                >
                  <input
                    ref={quickFileInputRef}
                    type="file"
                    multiple
                    accept=".tsx,.jsx,.ts,.js"
                    onChange={(e) => handleQuickUploadFiles(e.target.files)}
                    className="hidden"
                  />
                  <Upload className={`w-12 h-12 mx-auto ${theme.highlightText}`} />
                  <h2 className={`mt-4 text-2xl font-bold ${theme.inkPrimary}`}>
                    {vault.components.length === 0
                      ? 'La tua cartella componenti è vuota'
                      : 'Nessun componente selezionato'}
                  </h2>
                  <p className={`mt-3 text-[17px] leading-relaxed ${theme.inkSecondary}`}>
                    Trascina qui i tuoi file{' '}
                    <code className={`font-mono font-bold ${theme.highlightText}`}>.tsx</code> o{' '}
                    <code className={`font-mono font-bold ${theme.highlightText}`}>.jsx</code> per
                    salvarli in <code className="font-mono font-bold">vault/</code> e
                    visualizzarli subito in anteprima.
                  </p>
                  <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
                    <button
                      type="button"
                      onClick={() => quickFileInputRef.current?.click()}
                      className={`inline-flex items-center gap-2 px-5 py-3 text-base font-bold rounded-lg ${theme.accentBg} ${theme.accentHoverBg} ${theme.accentInk} cursor-pointer shadow-sm`}
                    >
                      <Upload className="w-5 h-5" />
                      Seleziona file dal computer
                    </button>
                    <button
                      type="button"
                      onClick={() => setSection('upload')}
                      className={`px-5 py-3 text-base font-bold rounded-lg border-2 ${theme.borderStrong} ${theme.cardAltBg} ${theme.inkPrimary} ${theme.cardHoverBg} cursor-pointer`}
                    >
                      Incolla codice
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Workspace Toolbar */}
                <div
                  className={`shrink-0 border-b-2 ${theme.borderStrong} ${theme.toolbarBg} ${theme.inkPrimary} px-4 py-3 flex flex-wrap items-center justify-between gap-3`}
                >
                  {/* Breadcrumb & Category move */}
                  <div className="flex items-center gap-2.5 min-w-0 text-base">
                    <span className={`font-mono font-semibold ${theme.inkMuted} hidden xl:inline`}>
                      {vault.vaultPath} /
                    </span>
                    <select
                      value={activeComponent.category}
                      onChange={(e) => handleMoveComponent(activeComponent, e.target.value)}
                      aria-label="Cambia categoria componente"
                      className={`px-3 py-1.5 rounded-lg border-2 ${theme.borderStrong} ${theme.inputBg} font-mono text-base font-bold ${theme.inkPrimary} focus:outline-none ${theme.focusBorder} cursor-pointer`}
                    >
                      {vault.categories.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <span className={theme.inkMuted}>/</span>
                    <span className={`font-mono font-bold ${theme.highlightText} truncate`}>
                      {activeComponent.fileName}
                    </span>
                    {compileResult?.compileTimeMs !== undefined && !compileResult.error && (
                      <span className={`hidden md:inline text-[15px] font-semibold ${theme.inkSecondary} tabular-nums`}>
                        · {compileResult.compileTimeMs} ms
                      </span>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Layout mode */}
                    <div
                      className={`flex items-center p-1 rounded-lg ${theme.inputBg} border-2 ${theme.borderStrong} text-[15px] font-bold`}
                    >
                      {(
                        [
                          { id: 'split', label: 'Diviso' },
                          { id: 'preview', label: 'Anteprima' },
                          { id: 'code', label: 'Codice' },
                        ] as const
                      ).map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setSplitMode(tab.id)}
                          className={`px-3.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            splitMode === tab.id
                              ? `${theme.accentBg} ${theme.accentInk}`
                              : `${theme.inkSecondary} ${theme.cardHoverBg}`
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Viewport toggles */}
                    {splitMode !== 'code' && (
                      <div
                        className={`hidden sm:flex items-center p-1 rounded-lg ${theme.inputBg} border-2 ${theme.borderStrong}`}
                      >
                        <button
                          type="button"
                          onClick={() => setViewport('desktop')}
                          title="Vista Desktop"
                          className={`p-1.5 rounded-md cursor-pointer ${
                            viewport === 'desktop'
                              ? `${theme.accentBg} ${theme.accentInk}`
                              : `${theme.inkSecondary} ${theme.cardHoverBg}`
                          }`}
                        >
                          <Monitor className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewport('tablet')}
                          title="Vista Tablet (768px)"
                          className={`p-1.5 rounded-md cursor-pointer ${
                            viewport === 'tablet'
                              ? `${theme.accentBg} ${theme.accentInk}`
                              : `${theme.inkSecondary} ${theme.cardHoverBg}`
                          }`}
                        >
                          <Tablet className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewport('mobile')}
                          title="Vista Mobile (375px)"
                          className={`p-1.5 rounded-md cursor-pointer ${
                            viewport === 'mobile'
                              ? `${theme.accentBg} ${theme.accentInk}`
                              : `${theme.inkSecondary} ${theme.cardHoverBg}`
                          }`}
                        >
                          <Smartphone className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    {/* Preview backdrop */}
                    {splitMode !== 'code' && (
                      <div
                        className={`flex items-center p-1 rounded-lg ${theme.inputBg} border-2 ${theme.borderStrong} text-sm font-bold`}
                      >
                        {(
                          [
                            { id: 'neutral', label: 'Neutro' },
                            { id: 'paper', label: 'Carta' },
                            { id: 'dark', label: 'Scuro' },
                            { id: 'checker', label: 'Griglia' },
                          ] as const
                        ).map((bg) => (
                          <button
                            key={bg.id}
                            type="button"
                            onClick={() => setBackdrop(bg.id)}
                            className={`px-2.5 py-1 rounded-md cursor-pointer ${
                              backdrop === bg.id
                                ? `${theme.accentBg} ${theme.accentInk}`
                                : `${theme.inkSecondary} ${theme.cardHoverBg}`
                            }`}
                          >
                            {bg.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {splitMode !== 'code' && (
                      <button
                        type="button"
                        onClick={() => setPaddedStage((v) => !v)}
                        title={paddedStage ? 'Passa a pieno schermo' : 'Passa a vista centrata'}
                        className={`p-2 rounded-lg border-2 ${theme.borderStrong} ${theme.cardBg} ${theme.inkPrimary} ${theme.cardHoverBg} cursor-pointer`}
                      >
                        {paddedStage ? (
                          <Maximize2 className="w-5 h-5" />
                        ) : (
                          <Minimize2 className="w-5 h-5" />
                        )}
                      </button>
                    )}

                    {detectedProps.length > 0 && splitMode !== 'code' && (
                      <button
                        type="button"
                        onClick={() => setShowPropsPanel((v) => !v)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-[15px] font-bold rounded-lg border-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          showPropsPanel
                            ? `${theme.activeBorder} ${theme.accentBg} ${theme.accentInk}`
                            : `${theme.borderStrong} ${theme.cardBg} ${theme.inkPrimary} ${theme.cardHoverBg}`
                        }`}
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                        Props ({detectedProps.length})
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleCopyCode}
                      title="Copia codice"
                      className={`p-2 rounded-lg border-2 ${theme.borderStrong} ${theme.cardBg} ${theme.inkPrimary} ${theme.cardHoverBg} cursor-pointer`}
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadActive}
                      title="Scarica file"
                      className={`p-2 rounded-lg border-2 ${theme.borderStrong} ${theme.cardBg} ${theme.inkPrimary} ${theme.cardHoverBg} cursor-pointer`}
                    >
                      <Download className="w-5 h-5" />
                    </button>

                    {confirmDeleteId === activeComponent.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteComponent(activeComponent)}
                          className="px-3.5 py-2 text-[15px] font-bold rounded-lg bg-red-600 text-white hover:bg-red-700 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          Conferma elimina
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className={`px-3.5 py-2 text-[15px] font-bold rounded-lg border-2 ${theme.borderStrong} ${theme.cardBg} ${theme.inkPrimary} cursor-pointer`}
                        >
                          Annulla
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(activeComponent.id)}
                        title="Elimina componente"
                        className={`p-2 rounded-lg border-2 ${theme.borderStrong} ${theme.cardBg} ${theme.inkPrimary} hover:text-red-400 hover:border-red-500 cursor-pointer`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={!hasUnsavedChanges || savingCode}
                      onClick={handleSaveCode}
                      className={`inline-flex items-center gap-2 px-4 py-2 text-[15px] font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        hasUnsavedChanges
                          ? `${theme.accentBg} ${theme.accentHoverBg} ${theme.accentInk}`
                          : `${theme.cardAltBg} ${theme.inkMuted} border-2 ${theme.borderSubtle} cursor-default`
                      }`}
                    >
                      <Save className="w-5 h-5" />
                      {savingCode ? 'Salvataggio...' : hasUnsavedChanges ? 'Salva su disco' : 'Salvato'}
                    </button>
                  </div>
                </div>

                {/* Split Preview + Code */}
                <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
                  {splitMode !== 'code' && (
                    <div
                      className={`${
                        splitMode === 'split'
                          ? `flex-1 min-h-[300px] lg:min-h-0 border-b-2 lg:border-b-0 lg:border-r-[3px] ${theme.borderStrong}`
                          : 'flex-1 min-h-0'
                      } flex flex-col min-w-0`}
                    >
                      <LivePreviewFrame
                        compileResult={compileResult}
                        compiling={compiling}
                        viewport={viewport}
                        backdrop={backdrop}
                        padded={paddedStage}
                        propOverrides={propOverrides}
                        componentKey={activeComponent.id}
                        theme={theme}
                      />

                      {showPropsPanel && detectedProps.length > 0 && (
                        <div
                          className={`shrink-0 border-t-2 ${theme.borderStrong} ${theme.toolbarBg} p-4 max-h-64 overflow-y-auto`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-base font-bold ${theme.inkPrimary}`}>
                              Props rilevate (modifica in tempo reale)
                            </span>
                            <button
                              type="button"
                              onClick={() => setPropOverrides({})}
                              className={`text-base font-bold ${theme.highlightText} hover:underline cursor-pointer`}
                            >
                              Ripristina default
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {detectedProps.map((prop) => {
                              const currentVal =
                                prop.name in propOverrides
                                  ? propOverrides[prop.name]
                                  : prop.defaultValue;
                              return (
                                <div key={prop.name} className="space-y-1.5">
                                  <label className={`block font-mono text-[15px] font-bold ${theme.inkSecondary}`}>
                                    {prop.name}
                                  </label>
                                  {prop.type === 'boolean' ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPropOverrides((prev) => ({
                                          ...prev,
                                          [prop.name]: !Boolean(currentVal),
                                        }))
                                      }
                                      className={`px-3.5 py-2 text-base font-mono font-bold rounded-lg border-2 cursor-pointer ${
                                        Boolean(currentVal)
                                          ? `${theme.activeBorder} ${theme.accentBg} ${theme.accentInk}`
                                          : `${theme.borderStrong} ${theme.inputBg} ${theme.inkPrimary}`
                                      }`}
                                    >
                                      {String(Boolean(currentVal))}
                                    </button>
                                  ) : prop.type === 'number' ? (
                                    <input
                                      type="number"
                                      value={Number(currentVal)}
                                      onChange={(e) =>
                                        setPropOverrides((prev) => ({
                                          ...prev,
                                          [prop.name]: Number(e.target.value),
                                        }))
                                      }
                                      className={`w-full px-3.5 py-2 text-base font-mono rounded-lg border-2 ${theme.borderStrong} ${theme.inputBg} ${theme.inkPrimary} focus:outline-none ${theme.focusBorder}`}
                                    />
                                  ) : (
                                    <input
                                      type="text"
                                      value={String(currentVal)}
                                      onChange={(e) =>
                                        setPropOverrides((prev) => ({
                                          ...prev,
                                          [prop.name]: e.target.value,
                                        }))
                                      }
                                      className={`w-full px-3.5 py-2 text-base font-mono rounded-lg border-2 ${theme.borderStrong} ${theme.inputBg} ${theme.inkPrimary} focus:outline-none ${theme.focusBorder}`}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {splitMode !== 'preview' && (
                    <div
                      className={`${
                        splitMode === 'split' ? 'flex-1 lg:max-w-[50%]' : 'flex-1'
                      } min-h-[260px] lg:min-h-0 min-w-0 flex flex-col`}
                    >
                      <CodeEditor
                        value={draftCode}
                        onChange={setDraftCode}
                        relativePath={activeComponent.relativePath}
                        lineCount={lineCount}
                        hasUnsavedChanges={hasUnsavedChanges}
                        theme={theme}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      )}

      <NewComponentModal
        open={showNewModal}
        categories={vault.categories}
        defaultCategory={selectedCategory !== '__all__' ? selectedCategory : 'generale'}
        theme={theme}
        onClose={() => setShowNewModal(false)}
        onCreated={async (savedId) => {
          await fetchVault(savedId);
          setSection('library');
        }}
      />
    </div>
  );
}

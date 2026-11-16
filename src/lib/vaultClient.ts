import vaultSeed from 'virtual:vault-seed';
import type { VaultComponent, VaultStateResponse } from '../types/vault';

const BROWSER_VAULT_KEY = 'reactvault_browser_vault_v1';
const ALLOWED_EXTENSIONS = ['.tsx', '.jsx', '.ts', '.js'];

let diskModeCache: boolean | null = null;

function sanitizeCategoryName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '');
}

function sanitizeFileName(raw: string): string {
  const cleaned = raw
    .trim()
    .split(/[\\/]/)
    .pop()!
    .replace(/[^a-zA-Z0-9._-]/g, '');
  if (!cleaned) return '';
  const lower = cleaned.toLowerCase();
  if (ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
    return cleaned;
  }
  return `${cleaned}.tsx`;
}

function recomputeVault(categoryNames: string[], components: VaultComponent[]): VaultStateResponse {
  const catSet = new Set(categoryNames);
  for (const c of components) {
    catSet.add(c.category);
  }

  const categories = Array.from(catSet)
    .map((name) => ({
      name,
      count: components.filter((c) => c.category === name).length,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'it'));

  const sortedComponents = [...components].sort((a, b) =>
    a.name.localeCompare(b.name, 'it')
  );

  return {
    writable: false,
    vaultPath: 'vault (browser)',
    categories,
    components: sortedComponents,
  };
}

function readBrowserVault(): VaultStateResponse {
  try {
    const raw = window.localStorage.getItem(BROWSER_VAULT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as VaultStateResponse;
      return recomputeVault(
        (parsed.categories ?? []).map((c) => c.name),
        parsed.components ?? []
      );
    }
  } catch {
    // fallback to seed
  }

  const initial = recomputeVault(
    vaultSeed.categories.map((c) => c.name),
    vaultSeed.components
  );
  writeBrowserVault(initial);
  return initial;
}

function writeBrowserVault(state: VaultStateResponse) {
  try {
    window.localStorage.setItem(BROWSER_VAULT_KEY, JSON.stringify(state));
  } catch {
    // ignore storage quota errors
  }
}

export async function isDiskBackendAvailable(): Promise<boolean> {
  if (diskModeCache !== null) return diskModeCache;
  try {
    const res = await fetch('/api/vault');
    if (!res.ok) {
      diskModeCache = false;
      return false;
    }
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      diskModeCache = false;
      return false;
    }
    const data = (await res.json()) as VaultStateResponse;
    diskModeCache = data.writable === true;
    return diskModeCache;
  } catch {
    diskModeCache = false;
    return false;
  }
}

export async function loadVault(): Promise<VaultStateResponse> {
  try {
    const res = await fetch('/api/vault');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = (await res.json()) as VaultStateResponse;
      if (data.writable === true) {
        diskModeCache = true;
        return data;
      }
    }
  } catch {
    // fall through to browser storage
  }
  diskModeCache = false;
  return readBrowserVault();
}

export async function createCategory(
  name: string
): Promise<{ name: string; vault: VaultStateResponse }> {
  if (await isDiskBackendAvailable()) {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Errore creazione categoria');
    return data;
  }

  const slug = sanitizeCategoryName(name);
  if (!slug) throw new Error('Nome categoria non valido');
  const current = readBrowserVault();
  if (current.categories.some((c) => c.name === slug)) {
    throw new Error(`La categoria "${slug}" esiste già`);
  }
  const next = recomputeVault(
    [...current.categories.map((c) => c.name), slug],
    current.components
  );
  writeBrowserVault(next);
  return { name: slug, vault: next };
}

export async function renameCategory(
  oldName: string,
  newName: string
): Promise<{ name: string; vault: VaultStateResponse }> {
  if (await isDiskBackendAvailable()) {
    const res = await fetch(`/api/categories/${encodeURIComponent(oldName)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Errore rinomina categoria');
    return data;
  }

  const oldSlug = sanitizeCategoryName(oldName);
  const newSlug = sanitizeCategoryName(newName);
  if (!oldSlug || !newSlug) throw new Error('Nome categoria non valido');
  const current = readBrowserVault();
  if (oldSlug !== newSlug && current.categories.some((c) => c.name === newSlug)) {
    throw new Error(`La categoria "${newSlug}" esiste già`);
  }

  const nextCats = current.categories.map((c) => (c.name === oldSlug ? newSlug : c.name));
  const nextComps = current.components.map((comp) =>
    comp.category === oldSlug
      ? {
          ...comp,
          category: newSlug,
          id: `${newSlug}/${comp.fileName}`,
          relativePath: `vault/${newSlug}/${comp.fileName}`,
        }
      : comp
  );
  const next = recomputeVault(nextCats, nextComps);
  writeBrowserVault(next);
  return { name: newSlug, vault: next };
}

export async function deleteCategory(
  name: string,
  force: boolean
): Promise<{ vault: VaultStateResponse }> {
  if (await isDiskBackendAvailable()) {
    const res = await fetch(
      `/api/categories/${encodeURIComponent(name)}?force=${force ? 'true' : 'false'}`,
      { method: 'DELETE' }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Errore eliminazione categoria');
    return data;
  }

  const slug = sanitizeCategoryName(name);
  const current = readBrowserVault();
  const hasFiles = current.components.some((c) => c.category === slug);
  if (hasFiles && !force) {
    throw new Error('La categoria contiene file. Conferma eliminazione forzata.');
  }
  const next = recomputeVault(
    current.categories.filter((c) => c.name !== slug).map((c) => c.name),
    current.components.filter((c) => c.category !== slug)
  );
  writeBrowserVault(next);
  return { vault: next };
}

export async function uploadComponents(params: {
  category: string;
  files: Array<{ fileName: string; code: string }>;
}): Promise<{ savedIds: string[]; vault: VaultStateResponse }> {
  if (await isDiskBackendAvailable()) {
    const res = await fetch('/api/components', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Errore salvataggio componente');
    return data;
  }

  const category = sanitizeCategoryName(params.category || 'generale') || 'generale';
  const current = readBrowserVault();
  const byId = new Map(current.components.map((c) => [c.id, c]));
  const savedIds: string[] = [];

  for (const item of params.files) {
    const fileName = sanitizeFileName(item.fileName);
    if (!fileName) throw new Error('Nome file non valido');
    const extIdx = fileName.lastIndexOf('.');
    const baseName = extIdx > 0 ? fileName.slice(0, extIdx) : fileName;
    const id = `${category}/${fileName}`;
    const code = String(item.code ?? '');

    byId.set(id, {
      id,
      name: baseName,
      fileName,
      category,
      relativePath: `vault/${category}/${fileName}`,
      code,
      updatedAt: new Date().toISOString(),
      sizeBytes: new Blob([code]).size,
    });
    savedIds.push(id);
  }

  const next = recomputeVault(
    [...current.categories.map((c) => c.name), category],
    Array.from(byId.values())
  );
  writeBrowserVault(next);
  return { savedIds, vault: next };
}

export async function updateComponent(
  currentComp: VaultComponent,
  updates: { code?: string; newCategory?: string; newFileName?: string }
): Promise<{ id: string; vault: VaultStateResponse }> {
  if (await isDiskBackendAvailable()) {
    const res = await fetch(
      `/api/components/${encodeURIComponent(currentComp.category)}/${encodeURIComponent(
        currentComp.fileName
      )}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Errore aggiornamento componente');
    return data;
  }

  const nextCategory = updates.newCategory
    ? sanitizeCategoryName(updates.newCategory)
    : currentComp.category;
  const nextFileName = updates.newFileName
    ? sanitizeFileName(updates.newFileName)
    : currentComp.fileName;
  if (!nextCategory || !nextFileName) {
    throw new Error('Nuovo nome o categoria non validi');
  }

  const current = readBrowserVault();
  const nextId = `${nextCategory}/${nextFileName}`;
  if (nextId !== currentComp.id && current.components.some((c) => c.id === nextId)) {
    throw new Error(`Esiste già "${nextFileName}" in "${nextCategory}"`);
  }

  const nextCode = typeof updates.code === 'string' ? updates.code : currentComp.code;
  const extIdx = nextFileName.lastIndexOf('.');
  const baseName = extIdx > 0 ? nextFileName.slice(0, extIdx) : nextFileName;

  const updatedList = current.components.map((c) =>
    c.id === currentComp.id
      ? {
          id: nextId,
          name: baseName,
          fileName: nextFileName,
          category: nextCategory,
          relativePath: `vault/${nextCategory}/${nextFileName}`,
          code: nextCode,
          updatedAt: new Date().toISOString(),
          sizeBytes: new Blob([nextCode]).size,
        }
      : c
  );

  const next = recomputeVault(
    [...current.categories.map((c) => c.name), nextCategory],
    updatedList
  );
  writeBrowserVault(next);
  return { id: nextId, vault: next };
}

export async function deleteComponent(
  comp: VaultComponent
): Promise<{ vault: VaultStateResponse }> {
  if (await isDiskBackendAvailable()) {
    const res = await fetch(
      `/api/components/${encodeURIComponent(comp.category)}/${encodeURIComponent(comp.fileName)}`,
      { method: 'DELETE' }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Errore eliminazione componente');
    return data;
  }

  const current = readBrowserVault();
  const next = recomputeVault(
    current.categories.map((c) => c.name),
    current.components.filter((c) => c.id !== comp.id)
  );
  writeBrowserVault(next);
  return { vault: next };
}

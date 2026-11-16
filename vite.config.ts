import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';

const ALLOWED_EXTENSIONS = new Set(['.tsx', '.jsx', '.ts', '.js']);

function readVaultSeed(rootDir: string) {
  const vaultDir = path.resolve(rootDir, 'vault');
  const categories: Array<{ name: string; count: number }> = [];
  const components: Array<{
    id: string;
    name: string;
    fileName: string;
    category: string;
    relativePath: string;
    code: string;
    updatedAt: string;
    sizeBytes: number;
  }> = [];

  if (!fs.existsSync(vaultDir)) {
    return { writable: false, vaultPath: 'vault', categories, components };
  }

  const entries = fs.readdirSync(vaultDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.') || !entry.isDirectory()) continue;
    const catName = entry.name;
    const catPath = path.join(vaultDir, catName);
    const files = fs.readdirSync(catPath, { withFileTypes: true });
    let count = 0;

    for (const file of files) {
      if (!file.isFile() || file.name.startsWith('.')) continue;
      const ext = path.extname(file.name).toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(ext)) continue;

      const fullPath = path.join(catPath, file.name);
      const stat = fs.statSync(fullPath);
      const code = fs.readFileSync(fullPath, 'utf8');
      const baseName = file.name.slice(0, -ext.length);

      count += 1;
      components.push({
        id: `${catName}/${file.name}`,
        name: baseName,
        fileName: file.name,
        category: catName,
        relativePath: `vault/${catName}/${file.name}`,
        code,
        updatedAt: stat.mtime.toISOString(),
        sizeBytes: stat.size,
      });
    }

    categories.push({ name: catName, count });
  }

  categories.sort((a, b) => a.name.localeCompare(b.name, 'it'));
  components.sort((a, b) => a.name.localeCompare(b.name, 'it'));

  return { writable: false, vaultPath: 'vault', categories, components };
}

function vaultSeedPlugin(): Plugin {
  const virtualModuleId = 'virtual:vault-seed';
  const resolvedVirtualModuleId = `\0${virtualModuleId}`;

  return {
    name: 'reactvault-seed',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        const seed = readVaultSeed(__dirname);
        return `export default ${JSON.stringify(seed)};`;
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), vaultSeedPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

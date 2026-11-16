import express from 'express';
import type { Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { transform } from 'esbuild';
import { compile as compileTailwind } from 'tailwindcss';
import { createServer as createViteServer } from 'vite';

const PORT = Number(process.env.PORT || 3000);
const ROOT_DIR = process.cwd();
const VAULT_DIR = path.resolve(ROOT_DIR, 'src', 'vault');
const ALLOWED_EXTENSIONS = new Set(['.tsx', '.jsx', '.ts', '.js']);

fs.mkdirSync(VAULT_DIR, { recursive: true });

let tailwindCompilerPromise: ReturnType<typeof compileTailwind> | null = null;

function getTailwindCompiler() {
  if (!tailwindCompilerPromise) {
    tailwindCompilerPromise = compileTailwind(
      `@import "tailwindcss";\n@custom-variant dark (&:where(.dark, .dark *));`,
      {
        loadStylesheet: async (id: string) => {
          if (id === 'tailwindcss') {
            const twIndex = path.resolve(ROOT_DIR, 'node_modules', 'tailwindcss', 'index.css');
            return {
              path: twIndex,
              base: path.dirname(twIndex),
              content: fs.readFileSync(twIndex, 'utf8'),
            };
          }
          throw new Error(`Stylesheet non supportato: ${id}`);
        },
      }
    );
  }
  return tailwindCompilerPromise;
}

function sanitizeCategoryName(raw: string): string {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '');
  return cleaned;
}

function sanitizeFileName(raw: string): string {
  const base = path.basename(raw.trim()).replace(/[^a-zA-Z0-9._-]/g, '');
  if (!base) return '';
  const ext = path.extname(base).toLowerCase();
  if (ALLOWED_EXTENSIONS.has(ext)) {
    return base;
  }
  return `${base}.tsx`;
}

function resolveSafePath(...segments: string[]): string {
  const resolved = path.resolve(VAULT_DIR, ...segments);
  if (resolved !== VAULT_DIR && !resolved.startsWith(`${VAULT_DIR}${path.sep}`)) {
    throw new Error('Percorso non valido');
  }
  return resolved;
}

function scanVault() {
  fs.mkdirSync(VAULT_DIR, { recursive: true });
  const entries = fs.readdirSync(VAULT_DIR, { withFileTypes: true });

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

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;

    if (entry.isDirectory()) {
      const catName = entry.name;
      const catPath = path.join(VAULT_DIR, catName);
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
          relativePath: `src/vault/${catName}/${file.name}`,
          code,
          updatedAt: stat.mtime.toISOString(),
          sizeBytes: stat.size,
        });
      }

      categories.push({ name: catName, count });
    }
  }

  categories.sort((a, b) => a.name.localeCompare(b.name, 'it'));
  components.sort((a, b) => a.name.localeCompare(b.name, 'it'));

  return {
    vaultPath: 'src/vault',
    categories,
    components,
  };
}

function extractCandidates(code: string): string[] {
  const matches = code.match(/[a-zA-Z0-9_:/\[\].#()%!-]+/g);
  if (!matches) return [];
  return Array.from(new Set(matches));
}

function extractDetectedProps(code: string) {
  const detected: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean';
    defaultValue: string | number | boolean;
  }> = [];
  const seen = new Set<string>();

  const defaultAssignRegex = /([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(?:'([^'\n]*)'|"([^"\n]*)"|(true|false)|(-?\d+(?:\.\d+)?))\s*(?:,|\n|\})/g;
  const paramBlockMatch = code.match(/(?:function\s+[A-Z][A-Za-z0-9_]*|const\s+[A-Z][A-Za-z0-9_]*\s*=\s*)\(\s*\{([\s\S]*?)\}/);

  if (paramBlockMatch?.[1]) {
    let match: RegExpExecArray | null;
    while ((match = defaultAssignRegex.exec(paramBlockMatch[1])) !== null) {
      const propName = match[1];
      if (!propName || seen.has(propName) || propName === 'children' || propName === 'className') {
        continue;
      }
      seen.add(propName);

      if (match[2] !== undefined || match[3] !== undefined) {
        detected.push({
          name: propName,
          type: 'string',
          defaultValue: match[2] ?? match[3] ?? '',
        });
      } else if (match[4] !== undefined) {
        detected.push({
          name: propName,
          type: 'boolean',
          defaultValue: match[4] === 'true',
        });
      } else if (match[5] !== undefined) {
        detected.push({
          name: propName,
          type: 'number',
          defaultValue: Number(match[5]),
        });
      }
    }
  }

  return detected;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  app.get('/api/vault', (_req: Request, res: Response) => {
    try {
      res.json(scanVault());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore scansione cartella';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/categories', (req: Request, res: Response) => {
    try {
      const rawName = String(req.body?.name ?? '');
      const slug = sanitizeCategoryName(rawName);
      if (!slug) {
        res.status(400).json({ error: 'Nome categoria non valido' });
        return;
      }
      const catPath = resolveSafePath(slug);
      if (fs.existsSync(catPath)) {
        res.status(409).json({ error: `La categoria "${slug}" esiste già` });
        return;
      }
      fs.mkdirSync(catPath, { recursive: true });
      res.status(201).json({ name: slug, vault: scanVault() });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore creazione categoria';
      res.status(500).json({ error: message });
    }
  });

  app.patch('/api/categories/:category', (req: Request, res: Response) => {
    try {
      const oldSlug = sanitizeCategoryName(String(req.params.category ?? ''));
      const newSlug = sanitizeCategoryName(String(req.body?.newName ?? ''));
      if (!oldSlug || !newSlug) {
        res.status(400).json({ error: 'Nome categoria non valido' });
        return;
      }
      const oldPath = resolveSafePath(oldSlug);
      const newPath = resolveSafePath(newSlug);
      if (!fs.existsSync(oldPath)) {
        res.status(404).json({ error: 'Categoria non trovata' });
        return;
      }
      if (oldPath !== newPath && fs.existsSync(newPath)) {
        res.status(409).json({ error: `La categoria "${newSlug}" esiste già` });
        return;
      }
      if (oldPath !== newPath) {
        fs.renameSync(oldPath, newPath);
      }
      res.json({ name: newSlug, vault: scanVault() });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore rinomina categoria';
      res.status(500).json({ error: message });
    }
  });

  app.delete('/api/categories/:category', (req: Request, res: Response) => {
    try {
      const slug = sanitizeCategoryName(String(req.params.category ?? ''));
      if (!slug) {
        res.status(400).json({ error: 'Categoria non valida' });
        return;
      }
      const catPath = resolveSafePath(slug);
      if (!fs.existsSync(catPath)) {
        res.status(404).json({ error: 'Categoria non trovata' });
        return;
      }
      const force = req.query.force === 'true';
      const children = fs.readdirSync(catPath).filter((n) => !n.startsWith('.'));
      if (children.length > 0 && !force) {
        res.status(409).json({ error: 'La categoria contiene file. Conferma eliminazione forzata.' });
        return;
      }
      fs.rmSync(catPath, { recursive: true, force: true });
      res.json({ vault: scanVault() });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore eliminazione categoria';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/components', (req: Request, res: Response) => {
    try {
      const category = sanitizeCategoryName(String(req.body?.category ?? 'generale')) || 'generale';
      const catPath = resolveSafePath(category);
      fs.mkdirSync(catPath, { recursive: true });

      const batch = Array.isArray(req.body?.files)
        ? req.body.files
        : [{ fileName: req.body?.fileName, code: req.body?.code }];

      const savedIds: string[] = [];

      for (const item of batch) {
        const fileName = sanitizeFileName(String(item?.fileName ?? ''));
        if (!fileName) {
          res.status(400).json({ error: 'Nome file non valido' });
          return;
        }
        const code = String(item?.code ?? '');
        const filePath = resolveSafePath(category, fileName);
        fs.writeFileSync(filePath, code, 'utf8');
        savedIds.push(`${category}/${fileName}`);
      }

      res.status(201).json({ savedIds, vault: scanVault() });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore salvataggio componente';
      res.status(500).json({ error: message });
    }
  });

  app.put('/api/components/:category/:fileName', (req: Request, res: Response) => {
    try {
      const currentCategory = sanitizeCategoryName(String(req.params.category ?? ''));
      const currentFileName = sanitizeFileName(String(req.params.fileName ?? ''));
      if (!currentCategory || !currentFileName) {
        res.status(400).json({ error: 'Percorso componente non valido' });
        return;
      }

      const oldPath = resolveSafePath(currentCategory, currentFileName);
      if (!fs.existsSync(oldPath)) {
        res.status(404).json({ error: 'Componente non trovato' });
        return;
      }

      const nextCategory = req.body?.newCategory
        ? sanitizeCategoryName(String(req.body.newCategory))
        : currentCategory;
      const nextFileName = req.body?.newFileName
        ? sanitizeFileName(String(req.body.newFileName))
        : currentFileName;

      if (!nextCategory || !nextFileName) {
        res.status(400).json({ error: 'Nuovo nome o categoria non validi' });
        return;
      }

      const nextCatPath = resolveSafePath(nextCategory);
      fs.mkdirSync(nextCatPath, { recursive: true });
      const newPath = resolveSafePath(nextCategory, nextFileName);

      if (newPath !== oldPath && fs.existsSync(newPath)) {
        res.status(409).json({ error: `Esiste già "${nextFileName}" in "${nextCategory}"` });
        return;
      }

      const nextCode =
        typeof req.body?.code === 'string' ? req.body.code : fs.readFileSync(oldPath, 'utf8');

      fs.writeFileSync(newPath, nextCode, 'utf8');
      if (newPath !== oldPath) {
        fs.unlinkSync(oldPath);
      }

      res.json({
        id: `${nextCategory}/${nextFileName}`,
        vault: scanVault(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore aggiornamento componente';
      res.status(500).json({ error: message });
    }
  });

  app.delete('/api/components/:category/:fileName', (req: Request, res: Response) => {
    try {
      const category = sanitizeCategoryName(String(req.params.category ?? ''));
      const fileName = sanitizeFileName(String(req.params.fileName ?? ''));
      const filePath = resolveSafePath(category, fileName);
      if (!fs.existsSync(filePath)) {
        res.status(404).json({ error: 'Componente non trovato' });
        return;
      }
      fs.unlinkSync(filePath);
      res.json({ vault: scanVault() });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore eliminazione componente';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/compile', async (req: Request, res: Response) => {
    const started = performance.now();
    const code = String(req.body?.code ?? '');
    const fileName = String(req.body?.fileName ?? 'Component.tsx');
    const ext = path.extname(fileName).toLowerCase();
    const loader = ext === '.jsx' ? 'jsx' : ext === '.js' ? 'js' : ext === '.ts' ? 'ts' : 'tsx';

    try {
      const result = await transform(code, {
        loader,
        format: 'cjs',
        jsx: 'automatic',
        target: 'es2022',
        sourcefile: fileName,
      });

      const compiler = await getTailwindCompiler();
      const candidates = extractCandidates(code);
      const css = compiler.build(candidates);
      const detectedProps = extractDetectedProps(code);

      res.json({
        compiledCode: result.code,
        css,
        detectedProps,
        compileTimeMs: Math.round(performance.now() - started),
      });
    } catch (err: unknown) {
      const e = err as {
        message?: string;
        errors?: Array<{
          text?: string;
          location?: { line?: number; column?: number; lineText?: string };
        }>;
      };
      const firstErr = e?.errors?.[0];
      res.json({
        error: {
          message: firstErr?.text || e?.message || 'Errore di compilazione TSX/JSX',
          line: firstErr?.location?.line,
          column: firstErr?.location?.column,
          lineText: firstErr?.location?.lineText,
        },
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(ROOT_DIR, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ReactVault server in ascolto su http://0.0.0.0:${PORT}`);
  });
}

startServer();

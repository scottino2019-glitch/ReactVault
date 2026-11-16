import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { transform } from 'esbuild';
import { compile as compileTailwind } from 'tailwindcss';

const require = createRequire(import.meta.url);

let tailwindCompilerPromise: ReturnType<typeof compileTailwind> | null = null;

function resolveTailwindCssPath(): string {
  try {
    return require.resolve('tailwindcss/index.css');
  } catch {
    return path.resolve(process.cwd(), 'node_modules', 'tailwindcss', 'index.css');
  }
}

export function getTailwindCompiler() {
  if (!tailwindCompilerPromise) {
    tailwindCompilerPromise = compileTailwind(
      `@import "tailwindcss";\n@custom-variant dark (&:where(.dark, .dark *));`,
      {
        loadStylesheet: async (id: string) => {
          if (id === 'tailwindcss') {
            const twIndex = resolveTailwindCssPath();
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

export function extractCandidates(code: string): string[] {
  const matches = code.match(/[a-zA-Z0-9_:/\[\].#()%!-]+/g);
  if (!matches) return [];
  return Array.from(new Set(matches));
}

export function extractDetectedProps(code: string) {
  const detected: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean';
    defaultValue: string | number | boolean;
  }> = [];
  const seen = new Set<string>();

  const defaultAssignRegex =
    /([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(?:'([^'\n]*)'|"([^"\n]*)"|(true|false)|(-?\d+(?:\.\d+)?))\s*(?:,|\n|\})/g;
  const paramBlockMatch = code.match(
    /(?:function\s+[A-Z][A-Za-z0-9_]*|const\s+[A-Z][A-Za-z0-9_]*\s*=\s*)\(\s*\{([\s\S]*?)\}/
  );

  if (paramBlockMatch?.[1]) {
    let match: RegExpExecArray | null;
    while ((match = defaultAssignRegex.exec(paramBlockMatch[1])) !== null) {
      const propName = match[1];
      if (
        !propName ||
        seen.has(propName) ||
        propName === 'children' ||
        propName === 'className'
      ) {
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

export async function compileComponentCode(code: string, fileName: string) {
  const started = performance.now();
  const ext = path.extname(fileName || 'Component.tsx').toLowerCase();
  const loader =
    ext === '.jsx' ? 'jsx' : ext === '.js' ? 'js' : ext === '.ts' ? 'ts' : 'tsx';

  try {
    const result = await transform(code, {
      loader,
      format: 'cjs',
      jsx: 'automatic',
      target: 'es2022',
      sourcefile: fileName || 'Component.tsx',
    });

    const compiler = await getTailwindCompiler();
    const candidates = extractCandidates(code);
    const css = compiler.build(candidates);
    const detectedProps = extractDetectedProps(code);

    return {
      compiledCode: result.code,
      css,
      detectedProps,
      compileTimeMs: Math.round(performance.now() - started),
    };
  } catch (err: unknown) {
    const e = err as {
      message?: string;
      errors?: Array<{
        text?: string;
        location?: { line?: number; column?: number; lineText?: string };
      }>;
    };
    const firstErr = e?.errors?.[0];
    return {
      error: {
        message: firstErr?.text || e?.message || 'Errore di compilazione TSX/JSX',
        line: firstErr?.location?.line,
        column: firstErr?.location?.column,
        lineText: firstErr?.location?.lineText,
      },
    };
  }
}

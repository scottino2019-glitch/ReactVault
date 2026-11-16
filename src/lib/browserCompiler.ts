import { transform as sucraseTransform } from 'sucrase';
import { compile as compileTailwind } from 'tailwindcss';
import tailwindIndexCss from 'tailwindcss/index.css?raw';
import type { CompileResult, DetectedProp } from '../types/vault';

let browserTailwindCompilerPromise: ReturnType<typeof compileTailwind> | null = null;

function getBrowserTailwindCompiler() {
  if (!browserTailwindCompilerPromise) {
    browserTailwindCompilerPromise = compileTailwind(
      `@import "tailwindcss";\n@custom-variant dark (&:where(.dark, .dark *));`,
      {
        loadStylesheet: async (id: string) => {
          if (id === 'tailwindcss') {
            return {
              path: 'tailwindcss/index.css',
              base: 'tailwindcss',
              content: tailwindIndexCss,
            };
          }
          throw new Error(`Stylesheet non supportato: ${id}`);
        },
      }
    );
  }
  return browserTailwindCompilerPromise;
}

function extractCandidates(code: string): string[] {
  const matches = code.match(/[a-zA-Z0-9_:/\[\].#()%!-]+/g);
  if (!matches) return [];
  return Array.from(new Set(matches));
}

function extractDetectedProps(code: string): DetectedProp[] {
  const detected: DetectedProp[] = [];
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

export async function compileInBrowser(code: string, fileName: string): Promise<CompileResult> {
  const started = performance.now();
  const lower = (fileName || 'Component.tsx').toLowerCase();
  const isTs = lower.endsWith('.ts') && !lower.endsWith('.tsx');
  const transforms: Array<'typescript' | 'jsx' | 'imports'> = isTs
    ? ['typescript', 'imports']
    : ['typescript', 'jsx', 'imports'];

  try {
    const result = sucraseTransform(code, {
      transforms,
      jsxRuntime: 'automatic',
      production: true,
      filePath: fileName || 'Component.tsx',
    });

    const compiler = await getBrowserTailwindCompiler();
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
      loc?: { line?: number; column?: number };
    };
    const line = e?.loc?.line;
    const column = e?.loc?.column;
    const lineText =
      typeof line === 'number' && line >= 1 ? code.split('\n')[line - 1] : undefined;

    return {
      error: {
        message: e?.message || 'Errore di compilazione TSX/JSX',
        line,
        column,
        lineText,
      },
    };
  }
}

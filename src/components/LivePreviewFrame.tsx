import React, { useEffect, useRef, useState } from 'react';
import * as ReactJSXRuntime from 'react/jsx-runtime';
import * as ReactDOM from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';
import * as LucideReact from 'lucide-react';
import * as MotionReact from 'motion/react';
import type { CompileResult } from '../types/vault';
import type { AppTheme } from '../theme';

export type PreviewViewport = 'desktop' | 'tablet' | 'mobile';
export type PreviewBackdrop = 'neutral' | 'paper' | 'dark' | 'checker';

interface LivePreviewFrameProps {
  compileResult: CompileResult | null;
  compiling: boolean;
  viewport: PreviewViewport;
  backdrop: PreviewBackdrop;
  padded: boolean;
  propOverrides: Record<string, string | number | boolean>;
  componentKey: string;
  theme: AppTheme;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (err: Error) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

class PreviewErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: '18px',
            margin: '18px',
            borderRadius: '10px',
            border: '2px solid #dc2626',
            backgroundColor: '#fee2e2',
            color: '#7f1d1d',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '15px',
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: '6px' }}>
            Errore di esecuzione nel componente
          </div>
          <div style={{ whiteSpace: 'pre-wrap' }}>{this.state.error.message}</div>
        </div>
      );
    }
    return this.props.children;
  }
}

function createModuleRequire() {
  const reactModule = Object.assign({}, React, { default: React });
  const reactDomModule = Object.assign({}, ReactDOM, { default: ReactDOM });
  const lucideModule = Object.assign({}, LucideReact, { default: LucideReact });
  const motionModule = Object.assign({}, MotionReact, { default: MotionReact });

  const registry: Record<string, unknown> = {
    react: reactModule,
    'react-dom': reactDomModule,
    'react-dom/client': { createRoot },
    'react/jsx-runtime': ReactJSXRuntime,
    'react/jsx-dev-runtime': ReactJSXRuntime,
    'lucide-react': lucideModule,
    'motion/react': motionModule,
    'framer-motion': motionModule,
  };

  return (id: string) => {
    if (id in registry) {
      return registry[id];
    }
    if (id.endsWith('.css') || id.endsWith('.scss')) {
      return {};
    }
    throw new Error(
      `Modulo "${id}" non disponibile nell'anteprima locale. Moduli supportati: react, lucide-react, motion/react.`
    );
  };
}

function resolveComponentExport(
  modExports: Record<string, unknown>
): React.ComponentType<Record<string, unknown>> | null {
  if (typeof modExports.default === 'function') {
    return modExports.default as React.ComponentType<Record<string, unknown>>;
  }
  const defaultObj = modExports.default as Record<string, unknown> | undefined;
  if (defaultObj && typeof defaultObj === 'object' && typeof defaultObj.$$typeof === 'symbol') {
    return modExports.default as React.ComponentType<Record<string, unknown>>;
  }
  for (const [key, val] of Object.entries(modExports)) {
    if (key === '__esModule') continue;
    if (typeof val === 'function') {
      return val as React.ComponentType<Record<string, unknown>>;
    }
  }
  return null;
}

const IFRAME_SRC_DOC = `<!doctype html>
<html lang="it">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap" rel="stylesheet" />
    <style id="base-preview-style">
      *, *::before, *::after { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; min-height: 100%; font-family: "DM Sans", system-ui, sans-serif; }
      #preview-root { min-height: 100vh; width: 100%; }
    </style>
    <style id="tw-style"></style>
  </head>
  <body>
    <div id="preview-root"></div>
  </body>
</html>`;

export function LivePreviewFrame({
  compileResult,
  compiling,
  viewport,
  backdrop,
  padded,
  propOverrides,
  componentKey,
  theme,
}: LivePreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const rootRef = useRef<Root | null>(null);
  const [iframeReady, setIframeReady] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      rootRef.current?.unmount();
      rootRef.current = null;
    };
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframeReady) return;
    const doc = iframe.contentDocument;
    if (!doc) return;

    const htmlEl = doc.documentElement;
    if (backdrop === 'dark') {
      htmlEl.classList.add('dark');
    } else {
      htmlEl.classList.remove('dark');
    }

    const mountEl = doc.getElementById('preview-root');
    if (mountEl) {
      mountEl.style.display = padded ? 'flex' : 'block';
      mountEl.style.alignItems = padded ? 'center' : 'stretch';
      mountEl.style.justifyContent = padded ? 'center' : 'flex-start';
      mountEl.style.padding = padded ? '28px' : '0';
      mountEl.style.minHeight = '100vh';
      mountEl.style.backgroundColor =
        backdrop === 'dark'
          ? '#1e2832'
          : backdrop === 'paper'
            ? '#cfc7b4'
            : backdrop === 'neutral'
              ? theme.previewDefaultBgHex
              : 'transparent';
    }
  }, [backdrop, padded, iframeReady, theme.previewDefaultBgHex]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframeReady || !compileResult) return;

    if (compileResult.error || !compileResult.compiledCode) {
      setEvalError(null);
      return;
    }

    const doc = iframe.contentDocument;
    if (!doc) return;

    const styleEl = doc.getElementById('tw-style');
    if (styleEl && compileResult.css !== undefined) {
      styleEl.textContent = compileResult.css;
    }

    const mountEl = doc.getElementById('preview-root');
    if (!mountEl) return;

    try {
      const moduleObj = { exports: {} as Record<string, unknown> };
      const customRequire = createModuleRequire();
      const fn = new Function('require', 'module', 'exports', compileResult.compiledCode);
      fn(customRequire, moduleObj, moduleObj.exports);

      const ExportedComponent = resolveComponentExport(moduleObj.exports);
      if (!ExportedComponent) {
        setEvalError(
          'Nessun componente React esportato trovato. Usa "export default function MioComponente() { ... }" o un export nominato.'
        );
        return;
      }

      setEvalError(null);
      if (!rootRef.current) {
        rootRef.current = createRoot(mountEl);
      }

      rootRef.current.render(
        <PreviewErrorBoundary key={`${componentKey}-${compileResult.compileTimeMs}-${JSON.stringify(propOverrides)}`}>
          <ExportedComponent {...propOverrides} />
        </PreviewErrorBoundary>
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore valutazione componente';
      setEvalError(message);
    }
  }, [compileResult, iframeReady, propOverrides, componentKey]);

  const widthClass =
    viewport === 'mobile'
      ? `w-[375px] shadow-xl rounded-xl border-2 ${theme.borderStrong}`
      : viewport === 'tablet'
        ? `w-[768px] shadow-xl rounded-xl border-2 ${theme.borderStrong}`
        : 'w-full';

  const stageBgClass =
    backdrop === 'checker'
      ? 'checkerboard-light'
      : backdrop === 'dark'
        ? 'bg-[#1e2832]'
        : backdrop === 'paper'
          ? 'bg-[#cfc7b4]'
          : theme.previewDefaultBgClass;

  const activeError = compileResult?.error?.message || evalError;

  return (
    <div className={`relative flex-1 min-h-0 flex flex-col overflow-hidden ${stageBgClass}`}>
      <div className="flex-1 min-h-0 overflow-auto flex justify-center">
        <div
          className={`h-full min-h-[380px] transition-[width] duration-200 overflow-hidden bg-transparent ${widthClass}`}
        >
          <iframe
            ref={iframeRef}
            title="Anteprima componente React"
            srcDoc={IFRAME_SRC_DOC}
            onLoad={() => setIframeReady(true)}
            className="w-full h-full border-0 bg-transparent"
          />
        </div>
      </div>

      {compiling && (
        <div
          className={`pointer-events-none absolute top-3 right-3 px-4 py-2 rounded-lg border-2 ${theme.cardBg} ${theme.borderStrong} ${theme.inkPrimary} text-base font-mono font-bold shadow-md`}
        >
          Compilazione...
        </div>
      )}

      {activeError && (
        <div className="absolute inset-x-4 bottom-4 rounded-xl border-2 border-red-600 bg-red-100 p-4 text-red-950 shadow-lg">
          <div className="flex items-center justify-between gap-2 text-lg font-bold">
            <span>
              {compileResult?.error?.line
                ? `Errore di sintassi alla riga ${compileResult.error.line}${
                    compileResult.error.column !== undefined
                      ? `:${compileResult.error.column}`
                      : ''
                  }`
                : 'Errore anteprima'}
            </span>
          </div>
          <p className="mt-1.5 font-mono text-base whitespace-pre-wrap break-words">
            {activeError}
          </p>
          {compileResult?.error?.lineText && (
            <pre className="mt-2 p-3 rounded bg-red-200 border border-red-400 font-mono text-base overflow-x-auto">
              {compileResult.error.lineText}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

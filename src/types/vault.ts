export interface VaultCategory {
  name: string;
  count: number;
}

export interface DetectedProp {
  name: string;
  type: 'string' | 'number' | 'boolean';
  defaultValue: string | number | boolean;
}

export interface VaultComponent {
  id: string;
  name: string;
  fileName: string;
  category: string;
  relativePath: string;
  code: string;
  updatedAt: string;
  sizeBytes: number;
}

export interface VaultStateResponse {
  writable?: boolean;
  vaultPath: string;
  categories: VaultCategory[];
  components: VaultComponent[];
}

export interface CompileResult {
  compiledCode?: string;
  css?: string;
  exportNames?: string[];
  detectedProps?: DetectedProp[];
  compileTimeMs?: number;
  error?: {
    message: string;
    line?: number;
    column?: number;
    lineText?: string;
  };
}

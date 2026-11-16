/// <reference types="vite/client" />

declare module 'virtual:vault-seed' {
  const seed: import('./types/vault').VaultStateResponse;
  export default seed;
}

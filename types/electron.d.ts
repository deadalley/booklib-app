// Type definitions for Electron API exposed to renderer process

export interface ElectronAPI {
  readFile: (filePath: string) => Promise<string>
  writeFile: (filePath: string, data: string) => Promise<void>
  fileExists: (filePath: string) => Promise<boolean>
  getDbPath: () => Promise<string>
  ensureDir: (dirPath: string) => Promise<void>
  // Book covers (see electron/covers.ts). Return booklib-cover:// URLs.
  saveCover: (
    id: string,
    bytes: Uint8Array,
    mimeType: string,
  ) => Promise<string>
  deleteCover: (id: string) => Promise<void>
  renameCover: (fromId: string, toId: string) => Promise<string | null>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {} // Make this a module

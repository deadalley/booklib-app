// Type definitions for Electron API exposed to renderer process

export interface ElectronAPI {
  readFile: (filePath: string) => Promise<string>
  writeFile: (filePath: string, data: string) => Promise<void>
  fileExists: (filePath: string) => Promise<boolean>
  getDbPath: () => Promise<string>
  ensureDir: (dirPath: string) => Promise<void>
  // File names in a folder; none if it doesn't exist
  listDir: (dirPath: string) => Promise<string[]>
  deleteFile: (filePath: string) => Promise<void>
  // Asks the user for a folder; null if they cancel
  pickFolder: () => Promise<string | null>
  // Book covers (see electron/covers.ts). Return booklib-cover:// URLs.
  saveCover: (
    id: string,
    bytes: Uint8Array,
    mimeType: string,
  ) => Promise<string>
  // Downloads a cover found by an ISBN lookup and saves it for `id`
  downloadCover: (id: string, url: string) => Promise<string>
  deleteCover: (id: string) => Promise<void>
  // Ebook files for the reader (see electron/ebooks.ts)
  saveEbook: (
    id: string,
    format: 'epub' | 'pdf',
    bytes: Uint8Array,
  ) => Promise<void>
  readEbook: (id: string, format: 'epub' | 'pdf') => Promise<Uint8Array>
  deleteEbook: (id: string) => Promise<void>
  renameCover: (fromId: string, toId: string) => Promise<string | null>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {} // Make this a module

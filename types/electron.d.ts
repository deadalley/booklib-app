// Type definitions for Electron API exposed to renderer process

export interface ElectronAPI {
  readFile: (filePath: string) => Promise<string>
  writeFile: (filePath: string, data: string) => Promise<void>
  fileExists: (filePath: string) => Promise<boolean>
  getDbPath: () => Promise<string>
  ensureDir: (dirPath: string) => Promise<void>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {} // Make this a module

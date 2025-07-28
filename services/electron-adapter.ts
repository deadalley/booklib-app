import type { Adapter } from 'lowdb'

export class ElectronAdapter<T> implements Adapter<T> {
  private filePath: string

  constructor(filePath: string) {
    this.filePath = filePath
  }

  async read(): Promise<T | null> {
    try {
      // Check if we're in an Electron environment
      if (typeof window === 'undefined' || !window.electronAPI) {
        throw new Error('ElectronAPI not available')
      }

      // Check if file exists
      const exists = await window.electronAPI.fileExists(this.filePath)
      if (!exists) {
        return null
      }

      // Read file content
      const data = await window.electronAPI.readFile(this.filePath)
      return JSON.parse(data) as T
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in ${this.filePath}`)
      }
      // If file doesn't exist, return null to indicate no data
      return null
    }
  }

  async write(data: T): Promise<void> {
    try {
      // Check if we're in an Electron environment
      if (typeof window === 'undefined' || !window.electronAPI) {
        throw new Error('ElectronAPI not available')
      }

      // Ensure directory exists
      const dirPath = this.filePath.substring(0, this.filePath.lastIndexOf('/'))
      if (dirPath) {
        await window.electronAPI.ensureDir(dirPath)
      }

      // Write file
      const jsonData = JSON.stringify(data, null, 2)
      await window.electronAPI.writeFile(this.filePath, jsonData)
    } catch (error) {
      throw new Error(`Failed to write to ${this.filePath}: ${error}`)
    }
  }
}

// Factory function to create ElectronAdapter
export function createElectronAdapter<T>(filePath: string): ElectronAdapter<T> {
  return new ElectronAdapter<T>(filePath)
}

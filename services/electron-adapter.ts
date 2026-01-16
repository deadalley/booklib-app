import type { Adapter } from 'lowdb'
import { handleFileError } from '~/utils/error-handling'

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
      // Re-throw ElectronAPI errors (they shouldn't be swallowed)
      if (error instanceof Error && error.message === 'ElectronAPI not available') {
        throw error
      }
      // If file doesn't exist or other non-critical errors, return null to indicate no data
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
      // Handle both Unix (/) and Windows (\) path separators for cross-platform compatibility
      const lastSlash = Math.max(
        this.filePath.lastIndexOf('/'),
        this.filePath.lastIndexOf('\\'),
      )
      const dirPath = lastSlash > 0 ? this.filePath.substring(0, lastSlash) : ''
      if (dirPath) {
        await window.electronAPI.ensureDir(dirPath)
      }

      // Write file
      const jsonData = JSON.stringify(data, null, 2)
      await window.electronAPI.writeFile(this.filePath, jsonData)
    } catch (error) {
      throw handleFileError('write', this.filePath, error)
    }
  }
}

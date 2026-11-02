import type { Adapter } from 'lowdb'
import { handleFileError } from '~/utils/error-handling'

type FilesystemModule = typeof import('@capacitor/filesystem')

// Loaded lazily so the web and Electron bundles never evaluate the plugin.
let filesystemModule: Promise<FilesystemModule> | null = null
function loadFilesystem(): Promise<FilesystemModule> {
  filesystemModule ??= import('@capacitor/filesystem')
  return filesystemModule
}

/**
 * LowDB adapter for the Android app (Capacitor). The database is a JSON file
 * in the app's private data directory, which survives app updates and is not
 * cleared like WebView storage can be.
 *
 * Writes are crash-safe without relying on an atomic rename: the full content
 * is written to `<file>.tmp` first, then to the file itself, and the temp copy
 * is removed afterwards. If the app dies while the file itself is being
 * written, the next read finds it unreadable and recovers from the temp copy.
 */
export class CapacitorAdapter<T> implements Adapter<T> {
  private readonly tempPath: string

  constructor(private readonly filePath: string) {
    this.tempPath = `${filePath}.tmp`
  }

  private async readJson(path: string): Promise<T | null> {
    const { Filesystem, Directory, Encoding } = await loadFilesystem()
    let raw: string
    try {
      const result = await Filesystem.readFile({
        path,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      })
      raw = typeof result.data === 'string' ? result.data : ''
    } catch {
      // The plugin rejects when the file does not exist
      return null
    }
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }

  async read(): Promise<T | null> {
    const data = await this.readJson(this.filePath)
    if (data !== null) return data
    // Missing or half-written main file: fall back to the copy from an
    // interrupted save, if there is one.
    return this.readJson(this.tempPath)
  }

  async write(data: T): Promise<void> {
    const { Filesystem, Directory, Encoding } = await loadFilesystem()
    const json = JSON.stringify(data, null, 2)
    try {
      for (const path of [this.tempPath, this.filePath]) {
        await Filesystem.writeFile({
          path,
          data: json,
          directory: Directory.Data,
          encoding: Encoding.UTF8,
          recursive: true,
        })
      }
    } catch (error) {
      throw handleFileError('write', this.filePath, error)
    }
    try {
      await Filesystem.deleteFile({
        path: this.tempPath,
        directory: Directory.Data,
      })
    } catch {
      // The main file is already saved; a leftover temp copy is harmless
    }
  }
}

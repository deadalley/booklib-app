import fs from 'node:fs/promises'
import path from 'node:path'
import { atomicWriteFile, renameWithRetry } from './fs-utils'

export const COVER_PROTOCOL = 'booklib-cover'
export const MAX_COVER_BYTES = 10 * 1024 * 1024
const TEMP_COVER_MAX_AGE_MS = 24 * 60 * 60 * 1000

export const COVER_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}
const ALLOWED_EXTENSIONS = new Set(Object.values(COVER_EXTENSIONS))

// Book ids are uuids; unsaved books use `temp-<uuid>` until they are created.
const COVER_ID_PATTERN = /^(temp-)?[0-9a-f-]{36}$/i

export function assertCoverId(id: unknown): asserts id is string {
  if (typeof id !== 'string' || !COVER_ID_PATTERN.test(id)) {
    throw new Error(`Invalid cover id: ${String(id)}`)
  }
}

function coverUrl(fileName: string) {
  return `${COVER_PROTOCOL}://${fileName}?v=${Date.now()}`
}

// Image files for book covers, stored as `<coversDir>/<bookId>.<ext>` and
// served to the renderer through the `booklib-cover://` protocol.
export class CoverStore {
  constructor(private readonly coversDir: string) {}

  private async findFiles(id: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(this.coversDir)
      return entries.filter((name) => {
        const ext = path.extname(name)
        return (
          path.basename(name, ext) === id &&
          ALLOWED_EXTENSIONS.has(ext.slice(1))
        )
      })
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
      throw error
    }
  }

  private async removeFiles(id: string, keep?: string) {
    const files = await this.findFiles(id)
    await Promise.all(
      files
        .filter((name) => name !== keep)
        .map((name) => fs.rm(path.join(this.coversDir, name), { force: true })),
    )
  }

  async save(id: string, bytes: Uint8Array, mimeType: string) {
    assertCoverId(id)
    const ext = COVER_EXTENSIONS[mimeType]
    if (!ext) throw new Error(`Unsupported cover image type: ${mimeType}`)
    if (!(bytes instanceof Uint8Array) || bytes.byteLength === 0) {
      throw new Error('Cover image is empty')
    }
    if (bytes.byteLength > MAX_COVER_BYTES) {
      throw new Error('Cover image is larger than 10 MB')
    }

    const fileName = `${id}.${ext}`
    await fs.mkdir(this.coversDir, { recursive: true })
    await atomicWriteFile(path.join(this.coversDir, fileName), bytes)
    // A replaced cover may have had a different format
    await this.removeFiles(id, fileName)

    return coverUrl(fileName)
  }

  async delete(id: string) {
    assertCoverId(id)
    await this.removeFiles(id)
  }

  // Moves the cover uploaded for an unsaved book onto its real id.
  async rename(fromId: string, toId: string) {
    assertCoverId(fromId)
    assertCoverId(toId)

    const [fileName] = await this.findFiles(fromId)
    if (!fileName) return null

    const newFileName = `${toId}${path.extname(fileName)}`
    await this.removeFiles(toId)
    await renameWithRetry(
      path.join(this.coversDir, fileName),
      path.join(this.coversDir, newFileName),
    )
    await this.removeFiles(fromId)

    return coverUrl(newFileName)
  }

  // Maps a `booklib-cover://<id>.<ext>` URL to a file inside the covers dir.
  // Returns null for anything that is not a known cover file name.
  resolveUrl(url: string): string | null {
    let fileName: string
    try {
      fileName = decodeURIComponent(new URL(url).hostname)
    } catch {
      return null
    }

    const ext = path.extname(fileName)
    if (
      !ALLOWED_EXTENSIONS.has(ext.slice(1).toLowerCase()) ||
      !COVER_ID_PATTERN.test(path.basename(fileName, ext))
    ) {
      return null
    }

    const filePath = path.resolve(this.coversDir, fileName)
    if (path.dirname(filePath) !== path.resolve(this.coversDir)) return null
    return filePath
  }

  // Removes covers uploaded for books that were never saved.
  async removeStaleTempCovers(now = Date.now()) {
    let entries: string[]
    try {
      entries = await fs.readdir(this.coversDir)
    } catch {
      return
    }

    await Promise.all(
      entries
        .filter((name) => name.startsWith('temp-'))
        .map(async (name) => {
          const filePath = path.join(this.coversDir, name)
          const { mtimeMs } = await fs.stat(filePath)
          if (now - mtimeMs > TEMP_COVER_MAX_AGE_MS) {
            await fs.rm(filePath, { force: true })
          }
        }),
    )
  }
}

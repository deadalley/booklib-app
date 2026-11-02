import fs from 'node:fs/promises'

const RENAME_RETRIES = 5
const RETRYABLE_CODES = new Set(['EPERM', 'EBUSY', 'EACCES'])

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Renames with a few retries: on Windows, antivirus and search indexers can
// briefly lock the target file and make the rename fail with EPERM/EBUSY.
export async function renameWithRetry(from: string, to: string) {
  for (let attempt = 0; ; attempt++) {
    try {
      await fs.rename(from, to)
      return
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code
      if (attempt >= RENAME_RETRIES || !code || !RETRYABLE_CODES.has(code)) {
        throw error
      }
      await sleep(50 * 2 ** attempt)
    }
  }
}

// Writes the whole file or nothing: the data goes to a temp file next to the
// target, is flushed to disk, then renamed over the target. A crash mid-write
// leaves the previous file intact instead of a truncated one.
export async function atomicWriteFile(
  filePath: string,
  data: string | Uint8Array,
): Promise<void> {
  const tmpPath = `${filePath}.tmp`

  try {
    const handle = await fs.open(tmpPath, 'w')
    try {
      await handle.writeFile(data, typeof data === 'string' ? 'utf-8' : null)
      await handle.sync()
    } finally {
      await handle.close()
    }
    await renameWithRetry(tmpPath, filePath)
  } catch (error) {
    await fs.rm(tmpPath, { force: true }).catch(() => {})
    throw error
  }
}

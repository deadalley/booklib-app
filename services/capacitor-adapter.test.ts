import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CapacitorAdapter } from './capacitor-adapter'

// In-memory stand-in for the app's data directory
const files = new Map<string, string>()
const failWritesTo = new Set<string>()

vi.mock('@capacitor/filesystem', () => ({
  Directory: { Data: 'DATA' },
  Encoding: { UTF8: 'utf8' },
  Filesystem: {
    readFile: vi.fn(async ({ path }: { path: string }) => {
      if (!files.has(path)) throw new Error('File does not exist')
      return { data: files.get(path) }
    }),
    writeFile: vi.fn(async ({ path, data }: { path: string; data: string }) => {
      if (failWritesTo.has(path)) {
        // Simulate the app dying halfway through writing this file
        files.set(path, data.slice(0, data.length / 2))
        throw new Error('Disk full')
      }
      files.set(path, data)
      return { uri: `file:///data/${path}` }
    }),
    deleteFile: vi.fn(async ({ path }: { path: string }) => {
      if (!files.has(path)) throw new Error('File does not exist')
      files.delete(path)
    }),
  },
}))

type Data = { books: string[] }

describe('CapacitorAdapter', () => {
  beforeEach(() => {
    files.clear()
    failWritesTo.clear()
  })

  it('returns null when there is no database yet', async () => {
    const adapter = new CapacitorAdapter<Data>('booklib-data.json')

    expect(await adapter.read()).toBeNull()
  })

  it('writes the database and reads it back', async () => {
    const adapter = new CapacitorAdapter<Data>('booklib-data.json')

    await adapter.write({ books: ['Kindred'] })

    expect(await adapter.read()).toEqual({ books: ['Kindred'] })
    expect([...files.keys()]).toEqual(['booklib-data.json'])
  })

  it('keeps the previous save when writing the temp copy fails', async () => {
    const adapter = new CapacitorAdapter<Data>('booklib-data.json')
    await adapter.write({ books: ['Kindred'] })
    failWritesTo.add('booklib-data.json.tmp')

    await expect(adapter.write({ books: ['Kindred', 'Dawn'] })).rejects.toThrow(
      /Failed to write file/,
    )

    expect(await adapter.read()).toEqual({ books: ['Kindred'] })
  })

  it('recovers from the temp copy when the main file was half written', async () => {
    const adapter = new CapacitorAdapter<Data>('booklib-data.json')
    await adapter.write({ books: ['Kindred'] })
    failWritesTo.add('booklib-data.json')

    await expect(
      adapter.write({ books: ['Kindred', 'Dawn'] }),
    ).rejects.toThrow()

    expect(await adapter.read()).toEqual({ books: ['Kindred', 'Dawn'] })
  })
})

import type { EbookFormat } from '~/types/book'
import { getAppPlatform } from '~/utils/platform'

/*
 * Ebook files attached to books. The library only keeps a little about each
 * file (format, name, reading position); the file itself lives here, per
 * device: desktop files next to the library, Android app storage, or the
 * browser's IndexedDB in the web demo. Files aren't part of exports or sync.
 */

export interface EbookFiles {
  save(id: string, format: EbookFormat, bytes: Uint8Array): Promise<void>
  read(id: string, format: EbookFormat): Promise<Uint8Array>
  remove(id: string): Promise<void>
}

export const EBOOK_ACCEPT = '.epub,.pdf,application/epub+zip,application/pdf'

/** An ebook's format from its file name or type, or null if unsupported */
export function ebookFormatOf(file: { name: string; type?: string }) {
  const name = file.name.toLowerCase()
  if (name.endsWith('.epub') || file.type === 'application/epub+zip') {
    return 'epub' as const
  }
  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    return 'pdf' as const
  }
  return null
}

const electronFiles = (): EbookFiles => ({
  save: (id, format, bytes) => window.electronAPI.saveEbook(id, format, bytes),
  read: (id, format) => window.electronAPI.readEbook(id, format),
  remove: (id) => window.electronAPI.deleteEbook(id),
})

function capacitorFiles(): EbookFiles {
  const load = () => import('@capacitor/filesystem')
  const DIR = 'ebooks'
  const path = (id: string, format: EbookFormat) => `${DIR}/${id}.${format}`
  return {
    save: async (id, format, bytes) => {
      const { Filesystem, Directory } = await load()
      let binary = ''
      for (let i = 0; i < bytes.length; i += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
      }
      await Filesystem.writeFile({
        path: path(id, format),
        directory: Directory.Data,
        data: btoa(binary),
        recursive: true,
      })
    },
    read: async (id, format) => {
      const { Filesystem, Directory } = await load()
      const { data } = await Filesystem.readFile({
        path: path(id, format),
        directory: Directory.Data,
      })
      const text = typeof data === 'string' ? atob(data) : ''
      return Uint8Array.from(text, (char) => char.charCodeAt(0))
    },
    remove: async (id) => {
      const { Filesystem, Directory } = await load()
      for (const format of ['epub', 'pdf'] as const) {
        await Filesystem.deleteFile({
          path: path(id, format),
          directory: Directory.Data,
        }).catch(() => {})
      }
    },
  }
}

/** The web demo: one IndexedDB store, keyed "<id>.<format>" */
export function indexedDbFiles(factory: IDBFactory = indexedDB): EbookFiles {
  const STORE = 'files'
  let opening: Promise<IDBDatabase> | null = null
  const open = () =>
    (opening ??= new Promise((resolve, reject) => {
      const request = factory.open('booklib-ebooks', 1)
      request.onupgradeneeded = () => request.result.createObjectStore(STORE)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    }))
  const run = async <T>(
    mode: IDBTransactionMode,
    action: (store: IDBObjectStore) => IDBRequest<T>,
  ) => {
    const db = await open()
    return new Promise<T>((resolve, reject) => {
      const request = action(db.transaction(STORE, mode).objectStore(STORE))
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
  return {
    save: async (id, format, bytes) => {
      await run('readwrite', (store) => store.put(bytes, `${id}.${format}`))
    },
    read: async (id, format) => {
      const bytes = await run<Uint8Array | undefined>('readonly', (store) =>
        store.get(`${id}.${format}`),
      )
      if (!bytes) throw new Error('The ebook file is missing on this device')
      return bytes
    },
    remove: async (id) => {
      for (const format of ['epub', 'pdf']) {
        await run('readwrite', (store) => store.delete(`${id}.${format}`))
      }
    },
  }
}

let files: EbookFiles | null = null

export function getEbookFiles(): EbookFiles {
  files ??= (() => {
    switch (getAppPlatform()) {
      case 'electron':
        return electronFiles()
      case 'android':
        return capacitorFiles()
      default:
        return indexedDbFiles()
    }
  })()
  return files
}

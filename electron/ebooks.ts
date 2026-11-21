import fs from 'node:fs/promises'
import path from 'node:path'
import { atomicWriteFile } from './fs-utils'

export const EBOOK_FORMATS = ['epub', 'pdf'] as const
export type EbookFormat = (typeof EBOOK_FORMATS)[number]
export const MAX_EBOOK_BYTES = 500 * 1024 * 1024

// Book ids are uuids
const BOOK_ID_PATTERN = /^[0-9a-f-]{36}$/i

function assertEbook(id: unknown, format: unknown) {
  if (typeof id !== 'string' || !BOOK_ID_PATTERN.test(id)) {
    throw new Error(`Invalid book id: ${String(id)}`)
  }
  if (!EBOOK_FORMATS.includes(format as EbookFormat)) {
    throw new Error(`Unsupported ebook format: ${String(format)}`)
  }
}

/** Ebook files attached to books, stored as `<dir>/<bookId>.<epub|pdf>` */
export class EbookStore {
  constructor(private readonly dir: string) {}

  private file(id: string, format: EbookFormat) {
    return path.join(this.dir, `${id}.${format}`)
  }

  async save(id: string, format: EbookFormat, bytes: Uint8Array) {
    assertEbook(id, format)
    if (!(bytes instanceof Uint8Array) || bytes.byteLength === 0) {
      throw new Error('The ebook file is empty')
    }
    if (bytes.byteLength > MAX_EBOOK_BYTES) {
      throw new Error('The ebook file is larger than 500 MB')
    }
    await fs.mkdir(this.dir, { recursive: true })
    await atomicWriteFile(this.file(id, format), bytes)
    // A replaced ebook may have had the other format
    const other = format === 'epub' ? 'pdf' : 'epub'
    await fs.rm(this.file(id, other), { force: true })
  }

  async read(id: string, format: EbookFormat): Promise<Uint8Array> {
    assertEbook(id, format)
    return new Uint8Array(await fs.readFile(this.file(id, format)))
  }

  async delete(id: string) {
    for (const format of EBOOK_FORMATS) {
      assertEbook(id, format)
      await fs.rm(this.file(id, format), { force: true })
    }
  }
}

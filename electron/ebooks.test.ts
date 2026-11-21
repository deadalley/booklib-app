// @vitest-environment node
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { EbookStore } from './ebooks'

const BOOK_ID = '0b5c2f7e-1d1a-4c1e-9a43-6a2d7a0f1b23'
const BYTES = new Uint8Array([37, 80, 68, 70])

describe('EbookStore', () => {
  let dir: string
  let store: EbookStore

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'booklib-ebooks-'))
    store = new EbookStore(path.join(dir, 'ebooks'))
  })

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true })
  })

  const files = () => fs.readdir(path.join(dir, 'ebooks'))

  it('saves and reads a file back', async () => {
    await store.save(BOOK_ID, 'pdf', BYTES)
    expect(await store.read(BOOK_ID, 'pdf')).toEqual(BYTES)
    expect(await files()).toEqual([`${BOOK_ID}.pdf`])
  })

  it('replaces a file of the other format', async () => {
    await store.save(BOOK_ID, 'pdf', BYTES)
    await store.save(BOOK_ID, 'epub', BYTES)
    expect(await files()).toEqual([`${BOOK_ID}.epub`])
  })

  it('deletes, and refuses bad ids, formats and empty files', async () => {
    await store.save(BOOK_ID, 'epub', BYTES)
    await store.delete(BOOK_ID)
    expect(await files()).toEqual([])
    await expect(store.save('../escape', 'pdf', BYTES)).rejects.toThrow(
      'Invalid book id',
    )
    await expect(store.save(BOOK_ID, 'exe' as never, BYTES)).rejects.toThrow(
      'Unsupported',
    )
    await expect(store.save(BOOK_ID, 'pdf', new Uint8Array())).rejects.toThrow(
      'empty',
    )
  })
})

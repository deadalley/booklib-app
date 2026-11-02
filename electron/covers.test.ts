// @vitest-environment node
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { CoverStore } from './covers'

const BOOK_ID = '0b5c2f7e-1d1a-4c1e-9a43-6a2d7a0f1b23'
const OTHER_ID = '7f3e2b1a-5c4d-4e6f-8a9b-0c1d2e3f4a5b'
const TEMP_ID = `temp-${OTHER_ID}`
const PNG = new Uint8Array([137, 80, 78, 71])

describe('CoverStore', () => {
  let dir: string
  let store: CoverStore

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'booklib-covers-'))
    store = new CoverStore(path.join(dir, 'covers'))
  })

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true })
  })

  const files = () => fs.readdir(path.join(dir, 'covers'))

  it('saves a cover and returns a cache-busting URL', async () => {
    const url = await store.save(BOOK_ID, PNG, 'image/png')

    expect(url).toMatch(
      new RegExp(`^booklib-cover://${BOOK_ID}\\.png\\?v=\\d+$`),
    )
    expect(await files()).toEqual([`${BOOK_ID}.png`])
    expect(store.resolveUrl(url)).toBe(
      path.join(dir, 'covers', `${BOOK_ID}.png`),
    )
  })

  it('replaces a cover saved in another format', async () => {
    await store.save(BOOK_ID, PNG, 'image/png')
    await store.save(BOOK_ID, PNG, 'image/jpeg')

    expect(await files()).toEqual([`${BOOK_ID}.jpg`])
  })

  it('rejects bad ids, types and sizes', async () => {
    await expect(store.save('../evil', PNG, 'image/png')).rejects.toThrow(
      'Invalid cover id',
    )
    await expect(store.save(BOOK_ID, PNG, 'image/svg+xml')).rejects.toThrow(
      'Unsupported',
    )
    await expect(
      store.save(BOOK_ID, new Uint8Array(10 * 1024 * 1024 + 1), 'image/png'),
    ).rejects.toThrow('10 MB')
    await expect(store.delete('../../etc/passwd')).rejects.toThrow()
  })

  it('deletes a cover', async () => {
    await store.save(BOOK_ID, PNG, 'image/png')
    await store.save(OTHER_ID, PNG, 'image/png')

    await store.delete(BOOK_ID)

    expect(await files()).toEqual([`${OTHER_ID}.png`])
  })

  it('moves a temp cover to the book id', async () => {
    await store.save(TEMP_ID, PNG, 'image/webp')

    const url = await store.rename(TEMP_ID, BOOK_ID)

    expect(url).toMatch(`booklib-cover://${BOOK_ID}.webp?v=`)
    expect(await files()).toEqual([`${BOOK_ID}.webp`])
    expect(await store.rename(TEMP_ID, BOOK_ID)).toBeNull()
  })

  it('only resolves URLs to cover files inside the covers dir', () => {
    expect(store.resolveUrl('booklib-cover://..%2Fsecret.png')).toBeNull()
    expect(store.resolveUrl(`booklib-cover://${BOOK_ID}.exe`)).toBeNull()
    expect(store.resolveUrl('booklib-cover://notes.png')).toBeNull()
    expect(store.resolveUrl('not a url')).toBeNull()
  })

  it('removes temp covers older than a day', async () => {
    await store.save(TEMP_ID, PNG, 'image/png')
    await store.save(BOOK_ID, PNG, 'image/png')

    await store.removeStaleTempCovers(Date.now() + 1000)
    expect(await files()).toHaveLength(2)

    await store.removeStaleTempCovers(Date.now() + 25 * 60 * 60 * 1000)
    expect(await files()).toEqual([`${BOOK_ID}.png`])
  })
})

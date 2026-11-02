// @vitest-environment node
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { atomicWriteFile } from './fs-utils'

describe('atomicWriteFile', () => {
  let dir: string

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'booklib-fs-'))
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await fs.rm(dir, { recursive: true, force: true })
  })

  it('writes text and binary data', async () => {
    const textFile = path.join(dir, 'data.json')
    const binaryFile = path.join(dir, 'image.png')

    await atomicWriteFile(textFile, '{"a":1}')
    await atomicWriteFile(binaryFile, new Uint8Array([1, 2, 3]))

    expect(await fs.readFile(textFile, 'utf-8')).toBe('{"a":1}')
    expect([...(await fs.readFile(binaryFile))]).toEqual([1, 2, 3])
    expect(await fs.readdir(dir)).toEqual(['data.json', 'image.png'])
  })

  it('replaces an existing file without leaving a temp file', async () => {
    const file = path.join(dir, 'data.json')
    await fs.writeFile(file, 'old')

    await atomicWriteFile(file, 'new')

    expect(await fs.readFile(file, 'utf-8')).toBe('new')
    expect(await fs.readdir(dir)).toEqual(['data.json'])
  })

  it('keeps the previous file and cleans up when the rename fails', async () => {
    const file = path.join(dir, 'data.json')
    await fs.writeFile(file, 'old')
    vi.spyOn(fs, 'rename').mockRejectedValue(
      Object.assign(new Error('disk full'), { code: 'ENOSPC' }),
    )

    await expect(atomicWriteFile(file, 'new')).rejects.toThrow('disk full')

    expect(await fs.readFile(file, 'utf-8')).toBe('old')
    expect(await fs.readdir(dir)).toEqual(['data.json'])
  })

  it('retries a rename blocked by a transient lock', async () => {
    const file = path.join(dir, 'data.json')
    const rename = fs.rename.bind(fs)
    vi.spyOn(fs, 'rename')
      .mockRejectedValueOnce(
        Object.assign(new Error('busy'), { code: 'EBUSY' }),
      )
      .mockImplementation(rename)

    await atomicWriteFile(file, 'new')

    expect(await fs.readFile(file, 'utf-8')).toBe('new')
  })
})

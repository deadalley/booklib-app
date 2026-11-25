import { describe, expect, it } from 'vitest'
import {
  emptyBookRecord,
  listFileName,
  parseBookFile,
  readSharedList,
  serializeList,
  toSharedRecord,
  uniqueCollectionName,
  type BookRecord,
} from '.'

const record: BookRecord = {
  ...emptyBookRecord('Piranesi'),
  author: 'Susanna Clarke',
  isbn: '9781635575637',
  pages: 272,
  year: 2020,
  genres: ['Fantasy'],
  format: 'paperback',
  propertyStatus: 'owned',
  rating: 4.5,
  coverSrc: 'https://example.com/cover.jpg',
  createdAt: '2024-01-02T10:00:00.000Z',
  progress: {
    status: 'read',
    startedAt: '2024-02-01T00:00:00.000Z',
    finishedAt: '2024-03-01T00:00:00.000Z',
    currentPage: 272,
    notes: [{ createdAt: '2024-02-03T00:00:00.000Z', content: 'Mine.' }],
  },
}

describe('shared lists', () => {
  it('keeps the book but leaves out the sender’s reading data', () => {
    const shared = toSharedRecord(record)
    expect(shared).toMatchObject({
      title: 'Piranesi',
      author: 'Susanna Clarke',
      isbn: '9781635575637',
      pages: 272,
      genres: ['Fantasy'],
      coverSrc: 'https://example.com/cover.jpg',
      rating: null,
      propertyStatus: null,
      createdAt: null,
    })
    expect(shared.progress).toEqual(emptyBookRecord().progress)
  })

  it('drops covers only this device can open', () => {
    for (const coverSrc of [
      'booklib-cover://abc.jpg',
      'data:image/png;base64,AAAA',
    ]) {
      expect(toSharedRecord({ ...record, coverSrc }).coverSrc).toBeNull()
    }
  })

  it('round-trips through the importer with its name', () => {
    const text = serializeList('  Cosy autumn ', [record], '2026-01-01')
    expect(readSharedList(text)).toEqual({ ok: true, name: 'Cosy autumn' })
    const { records, issues } = parseBookFile(text, 'json')
    expect(issues.filter((i) => i.severity === 'error')).toEqual([])
    expect(records.map((r) => [r.title, r.author, r.rating])).toEqual([
      ['Piranesi', 'Susanna Clarke', null],
    ])
  })

  it('ignores other files and refuses newer versions', () => {
    expect(readSharedList('{"format":"booklib","books":[]}')).toBeNull()
    expect(readSharedList('not json')).toBeNull()
    expect(
      readSharedList('{"format":"booklib-list","version":9,"books":[]}'),
    ).toMatchObject({ ok: false })
    expect(
      readSharedList('{"format":"booklib-list","version":1,"books":[]}'),
    ).toEqual({ ok: true, name: 'Shared list' })
  })

  it('names files and avoids taken collection names', () => {
    expect(listFileName('Cosy Autumn!')).toBe('cosy-autumn.booklib-list.json')
    expect(uniqueCollectionName('Fantasy', ['Sci-fi'])).toBe('Fantasy')
    expect(uniqueCollectionName('Fantasy', ['fantasy', 'Fantasy (2)'])).toBe(
      'Fantasy (3)',
    )
  })
})

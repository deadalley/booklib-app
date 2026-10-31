import { describe, expect, it } from 'vitest'
import {
  filterElementsBySearchParam,
  filterElementsBySelectedArray,
  getUniqueElements,
  normalizeForMatch,
} from './filters'

const books = [
  {
    id: '1',
    title: 'Cien años de soledad',
    publisher: 'Penguin',
    genres: ['Magical Realism'],
  },
  {
    id: '2',
    title: 'Dune',
    publisher: 'penguin ',
    genres: ['Science Fiction', 'Classics'],
  },
  { id: '3', title: 'Piranesi', publisher: 'Bloomsbury', genres: [] },
  { id: '4', title: 'Untitled', publisher: null, genres: null },
]

const ids = (items: { id: string }[]) => items.map((item) => item.id)

describe('normalizeForMatch', () => {
  it('ignores case, surrounding/extra whitespace and accents', () => {
    expect(normalizeForMatch('  García  Márquez ')).toBe('garcia marquez')
    expect(normalizeForMatch(null)).toBe('')
  })
})

describe('filterElementsBySelectedArray', () => {
  it('keeps everything for an empty selection', () => {
    expect(ids(filterElementsBySelectedArray('publisher', books, []))).toEqual([
      '1',
      '2',
      '3',
      '4',
    ])
  })

  it('matches values regardless of case and whitespace', () => {
    expect(
      ids(filterElementsBySelectedArray('publisher', books, ['Penguin'])),
    ).toEqual(['1', '2'])
  })

  it('matches any value of array fields', () => {
    expect(
      ids(filterElementsBySelectedArray('genres', books, ['classics', 'Nope'])),
    ).toEqual(['2'])
  })
})

describe('filterElementsBySearchParam', () => {
  it('folds accents in both the query and the values', () => {
    expect(ids(filterElementsBySearchParam(books, 'anos', ['title']))).toEqual([
      '1',
    ])
    expect(ids(filterElementsBySearchParam(books, 'AÑOS', ['title']))).toEqual([
      '1',
    ])
  })

  it('returns everything for a blank query', () => {
    expect(filterElementsBySearchParam(books, '   ', ['title'])).toHaveLength(4)
  })
})

describe('getUniqueElements', () => {
  it('deduplicates case-insensitively and drops empty values', () => {
    expect(getUniqueElements(books, 'publisher')).toEqual([
      'Bloomsbury',
      'Penguin',
    ])
  })
})

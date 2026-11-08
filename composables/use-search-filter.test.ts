import { describe, expect, it } from 'vitest'
import type { SearchAutocompleteGroup } from '~/components/search-bar-autocomplete.vue'
import { useSearchFilter } from './use-search-filter'

const groups = ref<SearchAutocompleteGroup[]>([
  {
    label: 'Books',
    options: [
      {
        value: 'book:1',
        label: 'Cien años de soledad',
        subtitle: 'Gabriel García Márquez',
        group: 'books',
      },
      {
        value: 'book:2',
        label: 'Dune',
        subtitle: 'Frank Herbert',
        group: 'books',
      },
    ],
  },
  {
    label: 'Collections',
    options: [
      {
        value: 'collection:1',
        label: 'Favourites',
        subtitle: '12 books',
        group: 'collections',
      },
    ],
  },
  {
    label: 'Authors',
    options: [
      {
        value: 'author:1',
        label: 'Frank Herbert',
        subtitle: '1 book',
        group: 'authors',
      },
    ],
  },
])

function search(term: string) {
  const { visibleFlatOptions } = useSearchFilter(groups, ref(term))
  return visibleFlatOptions.value.map((option) => option.value)
}

describe('useSearchFilter', () => {
  it('ignores accents and case', () => {
    expect(search('ANOS')).toEqual(['book:1'])
    expect(search('garcia')).toEqual(['book:1'])
  })

  it('matches book authors but not the "N books" counts', () => {
    expect(search('herbert')).toEqual(['book:2', 'author:1'])
    expect(search('book')).toEqual([])
    expect(search('12')).toEqual([])
  })

  it('shows nothing for a blank term', () => {
    expect(search('  ')).toEqual([])
  })
})

describe('useSearchFilter keywords, goals and notes', () => {
  const extended = ref<SearchAutocompleteGroup[]>([
    {
      label: 'Books',
      options: [
        {
          value: 'book:3',
          label: 'The Left Hand of Darkness',
          subtitle: 'Ursula K. Le Guin',
          group: 'books',
          keywords: [
            { label: 'ISBN', value: '978-0-441-47812-5' },
            { label: 'ISBN', value: '9780441478125' },
            { label: 'publisher', value: 'Ace Books' },
          ],
        },
      ],
    },
    {
      label: 'Goals',
      options: [
        {
          value: 'goal:1',
          label: 'Read 24 books in 2026',
          subtitle: '24 books in total · Active',
          group: 'goals',
        },
      ],
    },
    {
      label: 'Notes',
      options: Array.from({ length: 12 }, (_, i) => ({
        value: `note:b:${i}`,
        label: `Darkness falls, note ${i}`,
        subtitle: 'The Left Hand of Darkness · p. 10',
        group: 'notes' as const,
      })),
    },
  ])

  const find = (term: string) =>
    useSearchFilter(extended, ref(term)).visibleFlatOptions.value

  it('matches book keywords and says which one matched', () => {
    const [isbn] = find('9780441478125')
    expect(isbn).toMatchObject({
      value: 'book:3',
      matchedBy: 'ISBN 9780441478125',
    })
    expect(find('ace books')[0]?.matchedBy).toBe('publisher Ace Books')
    // A title match needs no explanation
    expect(find('left hand')[0]?.matchedBy).toBeUndefined()
  })

  it('finds goals by title but not by their details', () => {
    expect(find('24 books').map(({ value }) => value)).toEqual(['goal:1'])
    expect(find('active')).toEqual([])
  })

  it('caps the notes group', () => {
    const notes = find('falls')
    expect(notes).toHaveLength(10)
    expect(notes.every(({ group }) => group === 'notes')).toBe(true)
  })
})

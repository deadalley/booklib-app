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

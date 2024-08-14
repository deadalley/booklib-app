import type { Book } from '~/types/book'
import type { View } from '~/types/ui'

export const useSortBooks = (books: Book[]) => {
  const router = useRouter()
  const route = useRoute()

  const sidebarContent = ref()
  const textSearch = ref()
  const view = ref<View>((route.query.view as View) ?? 'cards')

  watch(view, (v) => {
    router.push({ query: { view: v } })
  })

  watch(
    () => route.query.view,
    (v) => {
      view.value = (v as View) ?? 'cards'
    },
  )

  const defaultTableColumns = {
    coverSrc: { label: 'Cover', checked: true },
    publisher: { label: 'Publisher', checked: true },
    language: { label: 'Language', checked: true },
    year: { label: 'Year', checked: true },
    pages: { label: 'Pages', checked: true },
    rating: { label: 'Rating', checked: true },
    originalTitle: { label: 'Original Title', checked: true },
    originalLanguage: { label: 'Original Language', checked: true },
    isbn: { label: 'ISBN', checked: true },
  }

  const pages = computed(() => getUniqueElements(books ?? [], 'pages'))
  const years = computed(() => getUniqueElements(books ?? [], 'year'))
  const publishers = computed(() => getUniqueElements(books ?? [], 'publisher'))
  const languages = computed(() => getUniqueElements(books ?? [], 'language'))
  const originalLanguages = computed(() =>
    getUniqueElements(books ?? [], 'originalLanguage'),
  )
  const genres = computed(() => getUniqueElements(books ?? [], 'genres').flat())

  const minPages = computed(() => Math.max(Math.min(...pages.value) - 100, 0))
  const maxPages = computed(() => Math.max(...pages.value))

  const minYear = computed(() => Math.min(...years.value))
  const maxYear = computed(() => new Date().getFullYear())

  const selectedPublishers = ref<string[]>([])
  const selectedLanguages = ref<string[]>([])
  const selectedOriginalLanguages = ref<string[]>([])
  const selectedGenres = ref<string[]>([])
  const selectedYearRange = ref<[number, number]>([
    minYear.value,
    maxYear.value,
  ])
  const selectedPageRange = ref<[number, number]>([
    minPages.value,
    maxPages.value,
  ])
  const selectedTableColumns = ref<{
    [key in keyof Book]?: { label: string; checked: boolean }
  }>(defaultTableColumns)

  const filterCount = computed(() => {
    let count = 0

    if (selectedPublishers.value.length) {
      count++
    }
    if (selectedLanguages.value.length) {
      count++
    }
    if (selectedOriginalLanguages.value.length) {
      count++
    }
    if (selectedGenres.value.length) {
      count++
    }
    if (
      selectedYearRange.value[0] !== minYear.value ||
      selectedYearRange.value[1] !== maxYear.value
    ) {
      count++
    }
    if (
      selectedPageRange.value[0] !== minPages.value ||
      selectedPageRange.value[1] !== maxPages.value
    ) {
      count++
    }

    return count
  })

  const sortedBooks = computed(() => {
    const hasFilter =
      selectedPublishers.value.length ||
      selectedLanguages.value.length ||
      selectedOriginalLanguages.value.length ||
      selectedGenres.value.length

    let combinedFilters: Book[] = books ?? []

    if (hasFilter) {
      const filterByPublisher = filterElementsBySelectedArray(
        'publisher',
        books ?? [],
        selectedPublishers.value,
      )

      const filterByLanguage = filterElementsBySelectedArray(
        'language',
        books ?? [],
        selectedLanguages.value,
      )

      const filterByOriginalLanguage = filterElementsBySelectedArray(
        'originalLanguage',
        books ?? [],
        selectedOriginalLanguages.value,
      )

      const filterByGenres = filterElementsBySelectedArray(
        'genres',
        books ?? [],
        [selectedGenres.value],
      )

      combinedFilters = mergeAndFilter(
        'id',
        filterByPublisher,
        filterByLanguage,
        filterByOriginalLanguage,
        filterByGenres,
      )
    }

    const filterByTextSearch = filterElementsBySearchParam(
      combinedFilters,
      textSearch.value,
      ['title'],
    )

    const filterByYear = filterElementsByRange(
      'year',
      filterByTextSearch,
      selectedYearRange.value,
    )

    const filterByPages = filterElementsByRange(
      'pages',
      filterByYear,
      selectedPageRange.value,
    )

    const sorted = filterByPages?.sort((b1, b2) =>
      b1.title.localeCompare(b2.title),
    )

    return sorted
  })

  function onSearch($event: Event) {
    textSearch.value = ($event.target as HTMLInputElement)?.value
  }

  function onFilterOpen() {
    sidebarContent.value = 'Filter'
  }

  function onCloseSidebar() {
    sidebarContent.value = undefined
  }

  function onResetFilter() {
    selectedPublishers.value = []
    selectedLanguages.value = []
    selectedOriginalLanguages.value = []

    selectedYearRange.value = [minYear.value, maxYear.value]
    selectedPageRange.value = [minPages.value, maxPages.value]

    selectedTableColumns.value = defaultTableColumns
  }

  return {
    view,
    sortedBooks,
    filterCount,
    sidebarContent,
    selectedTableColumns,
    minYear,
    maxYear,
    minPages,
    maxPages,
    selectedPublishers,
    selectedLanguages,
    selectedOriginalLanguages,
    selectedGenres,
    selectedYearRange,
    selectedPageRange,
    textSearch,
    pages,
    years,
    publishers,
    languages,
    originalLanguages,
    genres,
    onSearch,
    onFilterOpen,
    onCloseSidebar,
    onResetFilter,
  }
}

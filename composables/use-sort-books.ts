import type { Book } from '~/types/book'
import type { View } from '~/types/ui'

export const useSortBooks = (books: Ref<Book[] | null>) => {
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
    publisher: { label: 'Publisher', checked: false },
    language: { label: 'Language', checked: true },
    year: { label: 'Year', checked: false },
    pages: { label: 'Pages', checked: true },
    rating: { label: 'Rating', checked: true },
    originalTitle: { label: 'Original Title', checked: false },
    originalLanguage: { label: 'Original Language', checked: false },
    isbn: { label: 'ISBN', checked: false },
    progressStatus: { label: 'Progress Status', checked: false },
  }

  const pages = computed(() => getUniqueElements(books.value ?? [], 'pages'))
  const years = computed(() => getUniqueElements(books.value ?? [], 'year'))
  const publishers = computed(() =>
    getUniqueElements(books.value ?? [], 'publisher'),
  )
  const languages = computed(() =>
    getUniqueElements(books.value ?? [], 'language'),
  )
  const originalLanguages = computed(() =>
    getUniqueElements(books.value ?? [], 'originalLanguage'),
  )
  const genres = computed(() =>
    getUniqueElements(books.value ?? [], 'genres').flat(),
  )

  const minPages = computed(() =>
    Math.max(Math.min(...pages.value, 0) - 100, 0),
  )
  const maxPages = computed(() => Math.max(...pages.value, 300))

  const minYear = computed(() => Math.min(...years.value, 0))
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
    const hasFilter = !!(
      selectedPublishers.value.length ||
      selectedLanguages.value.length ||
      selectedOriginalLanguages.value.length ||
      selectedGenres.value.length
    )

    let combinedFilters: Book[] = books.value ?? []

    if (hasFilter) {
      const filterByPublisher = filterElementsBySelectedArray(
        'publisher',
        books.value ?? [],
        selectedPublishers.value,
      )

      const filterByLanguage = filterElementsBySelectedArray(
        'language',
        books.value ?? [],
        selectedLanguages.value,
      )

      const filterByOriginalLanguage = filterElementsBySelectedArray(
        'originalLanguage',
        books.value ?? [],
        selectedOriginalLanguages.value,
      )

      const filterByGenres = filterElementsBySelectedArray(
        'genres',
        books.value ?? [],
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
    selectedGenres.value = []

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

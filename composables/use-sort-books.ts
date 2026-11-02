import type {
  BookFormat,
  BookProgressStatus,
  BookPropertyStatus,
  ViewBook,
} from '~/types/book'
import type { View } from '~/types/ui'

export type BookSortValue =
  | 'custom'
  | 'title-asc'
  | 'title-desc'
  | 'author-asc'
  | 'year-desc'
  | 'rating-desc'

const BOOK_SORT_VALUES: BookSortValue[] = [
  'custom',
  'title-asc',
  'title-desc',
  'author-asc',
  'year-desc',
  'rating-desc',
]

function compareNullableNumberDesc(
  val1: number | null | undefined,
  val2: number | null | undefined,
) {
  if (val1 === null || val1 === undefined) {
    return val2 === null || val2 === undefined ? 0 : 1
  }

  if (val2 === null || val2 === undefined) {
    return -1
  }

  return val2 - val1
}

export const useSortBooks = <T extends ViewBook>(books: Ref<T[] | null>) => {
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

  const currentPage = ref<number>(1)
  const sortBy = ref<BookSortValue>('custom')

  const defaultTableColumns = {
    coverSrc: { label: 'Cover', checked: false },
    publisher: { label: 'Publisher', checked: false },
    language: { label: 'Language', checked: true },
    year: { label: 'Year', checked: false },
    pages: { label: 'Pages', checked: true },
    rating: { label: 'Rating', checked: true },
    originalTitle: { label: 'Original Title', checked: false },
    originalLanguage: { label: 'Original Language', checked: false },
    isbn: { label: 'ISBN', checked: false },
    progress: { label: 'Progress Status', checked: false },
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
  const maxYear = computed(() => Math.max(...years.value, getCurrentYear()))

  const selectedCollections = ref<string[]>([])
  const selectedAuthor = ref<string | undefined>()
  const selectedPublishers = ref<string[]>([])
  const selectedLanguages = ref<string[]>([])
  const selectedOriginalLanguages = ref<string[]>([])
  const selectedGenres = ref<string[]>([])
  const selectedStatuses = ref<BookProgressStatus[]>([])
  const selectedPropertyStatuses = ref<BookPropertyStatus[]>([])
  const selectedFormats = ref<BookFormat[]>([])
  const selectedYearRange = ref<[number, number]>([
    minYear.value,
    maxYear.value,
  ])
  const selectedPageRange = ref<[number, number]>([
    minPages.value,
    maxPages.value,
  ])
  // Column visibility is a view preference, so it survives filter resets
  const selectedTableColumns = ref<{
    [key in keyof ViewBook]?: { label: string; checked: boolean }
  }>(structuredClone(defaultTableColumns))

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
    if (selectedCollections.value.length) {
      count++
    }
    if (selectedAuthor.value) {
      count++
    }
    if (selectedStatuses.value.length) {
      count++
    }
    if (selectedPropertyStatuses.value.length) {
      count++
    }
    if (selectedFormats.value.length) {
      count++
    }
    if (isYearRangeActive.value) {
      count++
    }
    if (isPageRangeActive.value) {
      count++
    }

    return count
  })

  const isYearRangeActive = computed(
    () =>
      selectedYearRange.value[0] > minYear.value ||
      selectedYearRange.value[1] < maxYear.value,
  )
  const isPageRangeActive = computed(
    () =>
      selectedPageRange.value[0] > minPages.value ||
      selectedPageRange.value[1] < maxPages.value,
  )

  // When the bounds change (books added/removed) an untouched range follows
  // them, so new books outside the old bounds are not silently hidden.
  watch([minYear, maxYear], ([min, max], [oldMin, oldMax]) => {
    const [from, to] = selectedYearRange.value
    selectedYearRange.value = [
      from <= oldMin ? min : from,
      to >= oldMax ? max : to,
    ]
  })
  watch([minPages, maxPages], ([min, max], [oldMin, oldMax]) => {
    const [from, to] = selectedPageRange.value
    selectedPageRange.value = [
      from <= oldMin ? min : from,
      to >= oldMax ? max : to,
    ]
  })

  const sortedBooks = computed<ViewBook[]>(() => {
    const allBooks: ViewBook[] = books.value ?? []

    // Categories combine with AND; values within a category combine with OR
    let combinedFilters = filterElementsBySelectedArray(
      'publisher',
      allBooks,
      selectedPublishers.value,
    )
    combinedFilters = filterElementsBySelectedArray(
      'language',
      combinedFilters,
      selectedLanguages.value,
    )
    combinedFilters = filterElementsBySelectedArray(
      'originalLanguage',
      combinedFilters,
      selectedOriginalLanguages.value,
    )
    combinedFilters = filterElementsBySelectedArray(
      'genres',
      combinedFilters,
      selectedGenres.value,
    )

    const filterByTextSearch = filterElementsBySearchParam(
      combinedFilters,
      textSearch.value,
      ['title', 'authorName'],
    )

    const filterByYear = isYearRangeActive.value
      ? filterElementsByRange(
          'year',
          filterByTextSearch,
          selectedYearRange.value,
        )
      : filterByTextSearch

    const filterByPages = isPageRangeActive.value
      ? filterElementsByRange('pages', filterByYear, selectedPageRange.value)
      : filterByYear

    const filterByStatus = filterByPages.filter(({ progress }) => {
      return (
        !selectedStatuses.value.length ||
        (progress.status && selectedStatuses.value.includes(progress.status))
      )
    })

    const filterByPropertyStatus = filterByStatus.filter(
      ({ propertyStatus }) => {
        return (
          !selectedPropertyStatuses.value.length ||
          (propertyStatus &&
            selectedPropertyStatuses.value.includes(propertyStatus))
        )
      },
    )

    const filterByFormat = filterByPropertyStatus.filter(({ format }) => {
      return (
        !selectedFormats.value.length ||
        (format && selectedFormats.value.includes(format))
      )
    })

    const filterByAuthor = selectedAuthor.value
      ? filterByFormat.filter(
          ({ author }) => String(author) === selectedAuthor.value,
        )
      : filterByFormat

    const filterByCollections = selectedCollections.value.length
      ? filterByAuthor.filter(({ collections }) =>
          collections.some((c) =>
            selectedCollections.value.includes(String(c)),
          ),
        )
      : filterByAuthor

    const booksWithCollections = filterByCollections.map((book) => ({
      ...book,
      isFavorite: isBookInDefaultCollection(book, FAVORITE_COLLECTION_ID),
    }))

    if (sortBy.value === 'custom') {
      return sortBooksByOrder(booksWithCollections)
    }

    if (sortBy.value === 'title-asc') {
      return booksWithCollections.concat().sort((book1, book2) =>
        book1.title.localeCompare(book2.title, undefined, {
          numeric: true,
        }),
      )
    }

    if (sortBy.value === 'title-desc') {
      return booksWithCollections.concat().sort((book1, book2) =>
        book2.title.localeCompare(book1.title, undefined, {
          numeric: true,
        }),
      )
    }

    if (sortBy.value === 'author-asc') {
      return sortBooksByAuthor(booksWithCollections)
    }

    if (sortBy.value === 'year-desc') {
      return booksWithCollections.concat().sort((book1, book2) => {
        const yearCompare = compareNullableNumberDesc(book1.year, book2.year)

        if (!yearCompare) {
          return book1.title.localeCompare(book2.title, undefined, {
            numeric: true,
          })
        }

        return yearCompare
      })
    }

    return booksWithCollections.concat().sort((book1, book2) => {
      const ratingCompare = compareNullableNumberDesc(
        book1.rating,
        book2.rating,
      )

      if (!ratingCompare) {
        return book1.title.localeCompare(book2.title, undefined, {
          numeric: true,
        })
      }

      return ratingCompare
    })
  })

  const pageCount = computed(() =>
    Math.max(1, Math.ceil(sortedBooks.value.length / BOOKS_PAGE_SIZE)),
  )

  // Keep the current page in range when books are removed or filtered out
  watch(pageCount, (count) => {
    if (currentPage.value > count) {
      currentPage.value = count
    }
  })

  // A new filter or search starts from the first page
  watch(
    [
      textSearch,
      selectedCollections,
      selectedAuthor,
      selectedPublishers,
      selectedLanguages,
      selectedOriginalLanguages,
      selectedGenres,
      selectedStatuses,
      selectedPropertyStatuses,
      selectedFormats,
      selectedYearRange,
      selectedPageRange,
    ],
    () => {
      currentPage.value = 1
    },
    { deep: true },
  )

  const filteredBooksByPage = computed(() => {
    const filteredByCurrentPage = sortedBooks.value.slice(
      (currentPage.value - 1) * BOOKS_PAGE_SIZE,
      currentPage.value * BOOKS_PAGE_SIZE,
    )

    return filteredByCurrentPage
  })

  function onSearch($event: Event) {
    textSearch.value = ($event.target as HTMLInputElement)?.value
  }

  function onFilterOpen() {
    sidebarContent.value = 'Filter'
  }

  function onTableSettingsOpen() {
    sidebarContent.value = 'Table'
  }

  function onCloseSidebar() {
    sidebarContent.value = undefined
  }

  function onResetFilter() {
    selectedCollections.value = []
    selectedFormats.value = []
    selectedAuthor.value = undefined
    selectedPublishers.value = []
    selectedLanguages.value = []
    selectedOriginalLanguages.value = []
    selectedGenres.value = []
    selectedStatuses.value = []
    selectedPropertyStatuses.value = []

    selectedYearRange.value = [minYear.value, maxYear.value]
    selectedPageRange.value = [minPages.value, maxPages.value]

    onCloseSidebar()
  }

  function onSortByChange(value: string) {
    if (!BOOK_SORT_VALUES.includes(value as BookSortValue)) {
      return
    }

    sortBy.value = value as BookSortValue
    currentPage.value = 1
  }

  return {
    view,
    currentPage,
    sortBy,
    sortedBooks,
    filteredBooksByPage,
    pageCount,
    filterCount,
    sidebarContent,
    selectedTableColumns,
    minYear,
    maxYear,
    minPages,
    maxPages,
    selectedCollections,
    selectedAuthor,
    selectedPublishers,
    selectedLanguages,
    selectedOriginalLanguages,
    selectedGenres,
    selectedStatuses,
    selectedPropertyStatuses,
    selectedFormats,
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
    onTableSettingsOpen,
    onCloseSidebar,
    onResetFilter,
    onSortByChange,
  }
}

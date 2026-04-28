import type { BookFormat, BookProgressStatus, ViewBook } from '~/types/book'
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
  const maxYear = computed(() => getCurrentYear())

  const selectedCollections = ref<string[]>([])
  const selectedAuthor = ref<string | undefined>()
  const selectedPublishers = ref<string[]>([])
  const selectedLanguages = ref<string[]>([])
  const selectedOriginalLanguages = ref<string[]>([])
  const selectedGenres = ref<string[]>([])
  const selectedStatuses = ref<BookProgressStatus[]>([])
  const selectedFormats = ref<BookFormat[]>([])
  const selectedYearRange = ref<[number, number]>([
    minYear.value,
    maxYear.value,
  ])
  const selectedPageRange = ref<[number, number]>([
    minPages.value,
    maxPages.value,
  ])
  const selectedTableColumns = ref<{
    [key in keyof ViewBook]?: { label: string; checked: boolean }
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

  const sortedBooks = computed<ViewBook[]>(() => {
    const hasFilter = !!(
      selectedPublishers.value.length ||
      selectedLanguages.value.length ||
      selectedOriginalLanguages.value.length ||
      selectedGenres.value.length
    )

    let combinedFilters: ViewBook[] = books.value ?? []

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
      ['title', 'authorName'],
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

    const filterByStatus = filterByPages.filter(({ progress }) => {
      return (
        !selectedStatuses.value.length ||
        (progress.status && selectedStatuses.value.includes(progress.status))
      )
    })

    const filterByFormat = filterByStatus.filter(({ format }) => {
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
      isWishlist: isBookInDefaultCollection(book, WISHLIST_COLLECTION_ID),
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

  const filteredBooksByPage = computed(() => {
    if ((currentPage.value - 1) * BOOKS_PAGE_SIZE >= sortedBooks.value.length) {
      currentPage.value = 1
    }

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
    selectedAuthor.value = undefined
    selectedPublishers.value = []
    selectedLanguages.value = []
    selectedOriginalLanguages.value = []
    selectedGenres.value = []
    selectedStatuses.value = []

    selectedYearRange.value = [minYear.value, maxYear.value]
    selectedPageRange.value = [minPages.value, maxPages.value]

    selectedTableColumns.value = defaultTableColumns

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

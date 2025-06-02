import type { ViewBook } from '~/types/book'
import type { View } from '~/types/ui'

export const useSortBooksByOrder = <T extends ViewBook>(
  books: Ref<T[] | null>,
) => {
  const router = useRouter()
  const route = useRoute()

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
    coverSrc: { label: 'Cover', checked: false },
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

  const selectedBooks = computed(() =>
    sortBooksByOrder((books.value ?? []).filter(({ selected }) => !!selected)),
  )

  const notSelectedBooks = computed(() =>
    sortBooksByOrder((books.value ?? []).filter(({ selected }) => !selected)),
  )

  return {
    view,
    selectedBooks,
    notSelectedBooks,
    selectedTableColumns: defaultTableColumns,
  }
}

import type { Collection } from '~/types/collection'
import type { View } from '~/types/ui'

export const useSortCollections = (collections: Collection[]) => {
  const router = useRouter()
  const route = useRoute()

  const textSearch = ref()
  const view = ref<View>((route.query.view as View) ?? 'expanded-cards')

  watch(view, (v) => {
    router.push({ query: { view: v } })
  })

  const currentPage = ref<number>(1)

  const sortedCollections = computed(() => {
    const filterByTextSearch = filterElementsBySearchParam(
      collections ?? [],
      textSearch.value,
      ['name'],
    )

    const sorted = sortCollections(filterByTextSearch)

    return sorted
  })

  const filteredCollectionsByPage = computed(() => {
    if (
      (currentPage.value - 1) * COLLECTIONS_PAGE_SIZE >=
      sortedCollections.value.length
    ) {
      currentPage.value = 1
    }

    const filteredByCurrentPage = sortedCollections.value.slice(
      (currentPage.value - 1) * COLLECTIONS_PAGE_SIZE,
      currentPage.value * COLLECTIONS_PAGE_SIZE,
    )

    return filteredByCurrentPage
  })

  function onSearch($event: Event) {
    textSearch.value = ($event.target as HTMLInputElement)?.value
  }

  return {
    view,
    currentPage,
    sortedCollections,
    filteredCollectionsByPage,
    textSearch,
    onSearch,
  }
}

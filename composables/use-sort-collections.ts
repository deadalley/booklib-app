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

  const sortedCollections = computed(() => {
    const filterByTextSearch = filterElementsBySearchParam(
      collections ?? [],
      textSearch.value,
      ['name'],
    )

    const sorted = sortCollections(filterByTextSearch)

    return sorted
  })

  function onSearch($event: Event) {
    textSearch.value = ($event.target as HTMLInputElement)?.value
  }

  return {
    view,
    sortedCollections,
    textSearch,
    onSearch,
  }
}

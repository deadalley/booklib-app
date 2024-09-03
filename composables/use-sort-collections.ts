import type { Collection } from '~/types/collection'
import type { View } from '~/types/ui'

export const useSortCollections = (collections: Collection[]) => {
  const route = useRoute()

  const textSearch = ref()
  const view = ref<View>((route.query.view as View) ?? 'expanded-cards')

  const sortedCollections = computed(() => {
    const filterByTextSearch = filterElementsBySearchParam(
      collections ?? [],
      textSearch.value,
      ['name'],
    )

    const sorted = filterByTextSearch?.sort((b1, b2) =>
      b1.name.localeCompare(b2.name),
    )

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

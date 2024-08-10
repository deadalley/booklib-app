import type { Collection } from '~/types/collection'

export const useSortCollections = (collections: Collection[]) => {
  const route = useRoute()

  const textSearch = ref()
  const view = ref(route.query.view ?? 'cards')

  const defaultTableColumns = {
    name: { label: 'Name', checked: true },
  }

  const selectedTableColumns = ref<{
    [key in keyof Collection]?: { label: string; checked: boolean }
  }>(defaultTableColumns)

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
    selectedTableColumns,
    textSearch,
    onSearch,
  }
}

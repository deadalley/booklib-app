import type { Collection } from '~/types/collection'
import type { View } from '~/types/ui'
import { DEFAULT_COLLECTIONS } from '~/utils'

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

    const sorted = filterByTextSearch?.sort((b1, b2) => {
      const isB1Favorite = DEFAULT_COLLECTIONS.includes(String(b1.id))
      const isB2Favorite = DEFAULT_COLLECTIONS.includes(String(b2.id))

      if (isB1Favorite && isB2Favorite) {
        return b1.name.localeCompare(b2.name)
      }

      if (isB1Favorite) {
        return -1
      }

      if (isB2Favorite) {
        return 1
      }

      return b1.name.localeCompare(b2.name)
    })

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

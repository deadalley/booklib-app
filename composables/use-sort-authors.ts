import type { Author } from '~/types/author'
import type { View } from '~/types/ui'

export const useSortAuthors = (authors: Author[]) => {
  const router = useRouter()
  const route = useRoute()

  const textSearch = ref()
  const view = ref<View>((route.query.view as View) ?? 'expanded-cards')

  watch(view, (v) => {
    router.push({ query: { view: v } })
  })

  const sortedAuthors = computed(() => {
    const filterByTextSearch = filterElementsBySearchParam(
      authors ?? [],
      textSearch.value,
      ['name'],
    )

    const sorted = filterByTextSearch?.sort((b1, b2) => {
      return b1.name.localeCompare(b2.name)
    })

    return sorted
  })

  function onSearch($event: Event) {
    textSearch.value = ($event.target as HTMLInputElement)?.value
  }

  return {
    view,
    sortedAuthors,
    textSearch,
    onSearch,
  }
}

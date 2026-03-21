import type { SearchAutocompleteGroup } from '~/components/search-bar-autocomplete.vue'

export function useSearchFilter(
  groups: Readonly<Ref<SearchAutocompleteGroup[]>>,
  searchTerm: Ref<string>,
) {
  const normalizedSearchTerm = computed(() =>
    searchTerm.value.trim().toLowerCase(),
  )

  const visibleGroups = computed<SearchAutocompleteGroup[]>(() => {
    if (!normalizedSearchTerm.value) {
      return []
    }

    return groups.value
      .map((group) => ({
        ...group,
        options: group.options.filter((option) =>
          [option.label, option.subtitle]
            .filter(Boolean)
            .some((field) =>
              field!.toLowerCase().includes(normalizedSearchTerm.value),
            ),
        ),
      }))
      .filter((group) => group.options.length > 0)
  })

  const visibleFlatOptions = computed(() =>
    visibleGroups.value.flatMap((group) => group.options),
  )

  const notFoundLabel = computed(() =>
    normalizedSearchTerm.value
      ? 'No matches'
      : 'Search books, collections, authors...',
  )

  return {
    normalizedSearchTerm,
    visibleGroups,
    visibleFlatOptions,
    notFoundLabel,
  }
}

import type {
  SearchAutocompleteGroup,
  SearchAutocompleteOption,
} from '~/components/search-bar-autocomplete.vue'
import { normalizeForMatch } from '~/utils/filters'

/**
 * Fields a search term is matched against. Book subtitles hold the author's
 * name, which is worth matching; collection/author subtitles are counts like
 * "3 books", which would make "book" or "3" match everything.
 */
function searchableFields(option: SearchAutocompleteOption): string[] {
  const fields = [option.label]
  if (option.group === 'books' && option.subtitle) fields.push(option.subtitle)
  return fields.filter(Boolean)
}

export function useSearchFilter(
  groups: Readonly<Ref<SearchAutocompleteGroup[]>>,
  searchTerm: Ref<string>,
) {
  const normalizedSearchTerm = computed(() =>
    normalizeForMatch(searchTerm.value),
  )

  const visibleGroups = computed<SearchAutocompleteGroup[]>(() => {
    if (!normalizedSearchTerm.value) {
      return []
    }

    return groups.value
      .map((group) => ({
        ...group,
        options: group.options.filter((option) =>
          searchableFields(option).some((field) =>
            normalizeForMatch(field).includes(normalizedSearchTerm.value),
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

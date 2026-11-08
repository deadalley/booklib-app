import type {
  SearchAutocompleteGroup,
  SearchAutocompleteOption,
} from '~/components/search-bar-autocomplete.vue'
import { normalizeForMatch } from '~/utils/filters'

export const SEARCH_PLACEHOLDER = 'Search books, authors, goals, notes…'

// Notes can match common words in many places; keep the list short
const GROUP_LIMITS: Partial<Record<string, number>> = { notes: 10 }

/**
 * Fields a search term is matched against first. Book subtitles hold the
 * author's name, which is worth matching; collection/author/goal subtitles
 * are counts and details like "3 books", which would make "book" or "3"
 * match everything.
 */
function primaryFields(option: SearchAutocompleteOption): string[] {
  const fields = [option.label]
  if (option.group === 'books' && option.subtitle) fields.push(option.subtitle)
  return fields.filter(Boolean)
}

const matches = (field: string, term: string) =>
  normalizeForMatch(field).includes(term)

/**
 * The option if it matches, with `matchedBy` set when only one of its extra
 * keywords (ISBN, publisher, original title) matched, so the result can say
 * why it is there.
 */
function matchOption(
  option: SearchAutocompleteOption,
  term: string,
): SearchAutocompleteOption | null {
  if (primaryFields(option).some((field) => matches(field, term))) {
    return { ...option, matchedBy: undefined }
  }
  const keyword = option.keywords?.find(({ value }) => matches(value, term))
  return keyword
    ? { ...option, matchedBy: `${keyword.label} ${keyword.value}` }
    : null
}

export function useSearchFilter(
  groups: Readonly<Ref<SearchAutocompleteGroup[]>>,
  searchTerm: Ref<string>,
) {
  const normalizedSearchTerm = computed(() =>
    normalizeForMatch(searchTerm.value),
  )

  const visibleGroups = computed<SearchAutocompleteGroup[]>(() => {
    const term = normalizedSearchTerm.value
    if (!term) return []

    return groups.value
      .map((group) => {
        const options = group.options
          .map((option) => matchOption(option, term))
          .filter((option): option is SearchAutocompleteOption => !!option)
        const limit = GROUP_LIMITS[group.options[0]?.group ?? '']
        return { ...group, options: limit ? options.slice(0, limit) : options }
      })
      .filter((group) => group.options.length > 0)
  })

  const visibleFlatOptions = computed(() =>
    visibleGroups.value.flatMap((group) => group.options),
  )

  const notFoundLabel = computed(() =>
    normalizedSearchTerm.value ? 'No matches' : SEARCH_PLACEHOLDER,
  )

  return {
    normalizedSearchTerm,
    visibleGroups,
    visibleFlatOptions,
    notFoundLabel,
  }
}

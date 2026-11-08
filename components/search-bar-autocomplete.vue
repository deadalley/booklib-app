<template>
  <bl-raw-autocomplete
    v-model="selectedValue"
    v-model:search-term="searchTerm"
    class="min-w-48 sm:max-w-sm sm:min-w-56 xl:min-w-80"
    :options="visibleFlatOptions"
    :groups="visibleGroups"
    :placeholder="placeholder"
    clearable
    :filter-options="false"
    :not-found-label="notFoundLabel"
    :side="side"
    align="end"
    :can-create-new="false"
  >
    <template #prepend>
      <IconSearch :size="ICON_SIZE_SMALL" class="text-ink-muted" />
    </template>

    <template #append>
      <kbd v-if="shortcut && !searchTerm" class="shortcut" aria-hidden="true">
        {{ shortcut }}
      </kbd>
    </template>

    <template #item="{ option }">
      <bl-search-result-item :option="option" />
    </template>
  </bl-raw-autocomplete>
</template>

<script setup lang="ts">
import { IconSearch } from '@tabler/icons-vue'
import type { SelectOption } from './raw-select.vue'

export type SearchGroupKind =
  | 'books'
  | 'collections'
  | 'authors'
  | 'goals'
  | 'notes'

export type SearchAutocompleteOption = SelectOption & {
  href?: string
  subtitle?: string
  imageSrc?: string | null
  group?: SearchGroupKind
  // Extra fields matched only when the label doesn't match, e.g. ISBN
  keywords?: { label: string; value: string }[]
  // Set by the search filter: the keyword that matched, shown on the result
  matchedBy?: string
}

export type SearchAutocompleteGroup = {
  label: string
  options: SearchAutocompleteOption[]
}

const props = withDefaults(
  defineProps<{
    groups: SearchAutocompleteGroup[]
    placeholder?: string
    side?: 'top' | 'right' | 'bottom' | 'left'
    // Keyboard shortcut hint, e.g. "⌘K"
    shortcut?: string
  }>(),
  {
    placeholder: SEARCH_PLACEHOLDER,
    side: 'bottom',
    shortcut: undefined,
  },
)

const emit = defineEmits<{ navigate: [] }>()

const route = useRoute()
const selectedValue = ref<string | undefined>(undefined)
const searchTerm = ref<string>('')

const allOptions = computed(() =>
  props.groups.flatMap((group) => group.options),
)

const { visibleGroups, visibleFlatOptions, notFoundLabel } = useSearchFilter(
  computed(() => props.groups),
  searchTerm,
)

watch(selectedValue, async (value) => {
  if (!value) {
    return
  }

  const selectedOption = allOptions.value.find(
    (option) => option.value === value,
  )
  const href = selectedOption?.href

  if (!href || href === route.path) {
    selectedValue.value = undefined
    return
  }

  await navigateTo(href)
  // Clear selection and search after navigation (don't keep value selected)
  await nextTick()
  selectedValue.value = undefined
  searchTerm.value = ''
  emit('navigate')
})

watch(searchTerm, (term) => {
  // Clear selection when user erases the input
  if (!term.trim()) {
    selectedValue.value = undefined
  }
})
</script>

<style scoped>
@reference '../assets/css/main.css';

/* Results stay on screen; long notes truncate instead of widening the list */
:deep(.menu-content) {
  width: min(32rem, calc(100vw - 2rem));
}
/* Overlaid so the hint doesn't widen the search bar */
.shortcut {
  @apply border-stroke text-ink-muted bg-surface-elevated pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded border px-1.5 font-sans text-[0.6875rem] font-semibold whitespace-nowrap;
}
</style>

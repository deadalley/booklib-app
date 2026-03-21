<template>
  <bl-raw-autocomplete
    v-model="selectedValue"
    v-model:search-term="searchTerm"
    class="min-w-48 sm:max-w-sm sm:min-w-80"
    :options="visibleFlatOptions"
    :groups="visibleGroups"
    :placeholder="placeholder"
    clearable
    :not-found-label="notFoundLabel"
    :side="side"
    :can-create-new="false"
  >
    <template #prepend>
      <IconSearch :size="ICON_SIZE_SMALL" class="text-ink-muted" />
    </template>

    <template #item="{ option }">
      <bl-search-result-item :option="option" />
    </template>
  </bl-raw-autocomplete>
</template>

<script setup lang="ts">
import { IconSearch } from '@tabler/icons-vue'
import type { SelectOption } from './raw-select.vue'

export type SearchAutocompleteOption = SelectOption & {
  href?: string
  subtitle?: string
  imageSrc?: string | null
  group?: 'books' | 'collections' | 'authors'
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
  }>(),
  {
    placeholder: 'Search books, collections, authors...',
    side: 'bottom',
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

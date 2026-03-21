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
      <div class="flex w-full items-center gap-3">
        <NuxtImg
          v-if="option.imageSrc"
          :src="option.imageSrc"
          :alt="option.label"
          class="border-stroke size-8 shrink-0 rounded-md border object-cover"
        />
        <div
          v-else
          class="border-stroke bg-surface-subtle text-ink-secondary flex size-8 shrink-0 items-center justify-center rounded-md border"
        >
          <component :is="getOptionIcon(option)" :size="16" stroke="1.75" />
        </div>

        <div class="flex min-w-0 flex-1 flex-col">
          <span class="truncate">{{ option.label }}</span>
          <span
            v-if="option.subtitle"
            class="text-ink-secondary truncate text-xs"
          >
            {{ option.subtitle }}
          </span>
        </div>
      </div>
    </template>
  </bl-raw-autocomplete>
</template>

<script setup lang="ts">
import { IconArchive, IconBooks, IconSearch, IconUser } from '@tabler/icons-vue'
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

const route = useRoute()
const selectedValue = ref<string | undefined>(undefined)
const searchTerm = ref<string>('')

const allOptions = computed(() =>
  props.groups.flatMap((group) => group.options),
)

const normalizedSearchTerm = computed(() =>
  searchTerm.value.trim().toLowerCase(),
)

const visibleGroups = computed<SearchAutocompleteGroup[]>(() => {
  if (!normalizedSearchTerm.value) {
    return []
  }

  return props.groups
    .map((group) => ({
      ...group,
      options: group.options.filter((option) => {
        return [option.label, option.subtitle]
          .filter(Boolean)
          .some((field) =>
            field!.toLowerCase().includes(normalizedSearchTerm.value),
          )
      }),
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
})

watch(searchTerm, (term) => {
  // Clear selection when user erases the input
  if (!term.trim()) {
    selectedValue.value = undefined
  }
})

function getOptionIcon(option: SearchAutocompleteOption) {
  switch (option.group) {
    case 'collections':
      return IconArchive
    case 'authors':
      return IconUser
    default:
      return IconBooks
  }
}
</script>

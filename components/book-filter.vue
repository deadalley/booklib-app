<template>
  <div class="filter-sidebar">
    <div class="filter-section">
      <div class="filter-section-header">
        <label class="filter-section-label">Author</label>
      </div>
      <bl-raw-autocomplete
        v-model="selectedAuthor"
        with-wrapper
        clearable
        placeholder="Filter by author..."
        :options="
          authors.map(({ id, name }) => ({ label: name, value: String(id) }))
        "
      />
    </div>

    <div class="filter-section">
      <div class="filter-section-header">
        <label class="filter-section-label">Ownership</label>
      </div>
      <bl-raw-select
        v-model="selectedPropertyStatus"
        with-wrapper
        placeholder="Any Ownership"
        :options="propertyStatusOptions"
      />
    </div>

    <div class="filter-section">
      <div class="filter-section-header">
        <label class="filter-section-label">Reading Status</label>
      </div>
      <bl-raw-select
        v-model="selectedStatus"
        with-wrapper
        placeholder="Any Status"
        :options="statusOptions"
      />
    </div>

    <bl-book-filter-section
      v-model="selectedCollections"
      title="Collections"
      :elements="collections.map(({ id, name }) => name)"
    />

    <bl-book-filter-section
      v-model="selectedPublishers"
      title="Publisher"
      :elements="publishers"
    />

    <bl-book-filter-section
      v-model="selectedLanguages"
      title="Language"
      :elements="languages"
    />

    <bl-book-filter-section
      v-model="selectedOriginalLanguages"
      title="Original Language"
      :elements="originalLanguages"
    />

    <bl-book-filter-section
      v-model="selectedGenres"
      title="Genre"
      :elements="genres"
    />

    <div class="filter-section">
      <div class="filter-section-header">
        <label class="filter-section-label">Year</label>
        <span class="filter-section-reset">{{ yearLabel }}</span>
      </div>
      <bl-slider
        v-if="selectedYearRange"
        v-model:values="selectedYearRange"
        :min="minMaxYearRange[0]"
        :max="minMaxYearRange[1]"
        :step="1"
      />
    </div>

    <div class="filter-section">
      <div class="filter-section-header">
        <label class="filter-section-label">Pages</label>
        <span class="filter-section-reset">{{ pageLabel }}</span>
      </div>
      <bl-slider
        v-if="selectedPageRange"
        v-model:values="selectedPageRange"
        :min="minMaxPageRange[0]"
        :max="minMaxPageRange[1]"
        :step="50"
      />
    </div>

    <div class="filter-section">
      <div class="filter-section-header">
        <label class="filter-section-label">Format</label>
      </div>
      <div class="format-grid">
        <button
          v-for="item in Object.values(BOOK_FORMAT_MAP)"
          :key="item.id"
          type="button"
          class="format-option"
          :class="{ selected: !!selectedFormats?.includes(item.id) }"
          @click="onSelectFormat(item.id)"
        >
          <component :is="icons[item.icon]" :size="14" stroke="1.8" />
          <span>{{ item.description }}</span>
        </button>
      </div>
    </div>

    <bl-button expand @click="$emit('apply')">Apply Filters</bl-button>
  </div>
</template>

<script setup lang="ts">
import { icons } from '@tabler/icons-vue'
import type { Author } from '~/types/author'
import type { Book, BookFormat, BookProgressStatus, BookPropertyStatus } from '~/types/book'
import type { Collection } from '~/types/collection'

defineProps<{
  authors: Author[]
  books: Book[]
  collections: Collection[]

  publishers: string[]
  languages: string[]
  originalLanguages: string[]
  genres: string[]
  minMaxYearRange: [number, number]
  minMaxPageRange: [number, number]

  selectedTableColumns: {
    [key in keyof Book]?: { label: string; checked: boolean }
  }
}>()

const selectedCollections = defineModel<string[]>('selectedCollections')
const selectedAuthor = defineModel<string | undefined>('selectedAuthor')
const selectedPublishers = defineModel<string[]>('selectedPublishers')
const selectedLanguages = defineModel<string[]>('selectedLanguages')
const selectedOriginalLanguages = defineModel<string[]>(
  'selectedOriginalLanguages',
)
const selectedGenres = defineModel<string[]>('selectedGenres')
const selectedStatuses = defineModel<BookProgressStatus[]>('selectedStatuses')
const selectedPropertyStatuses = defineModel<BookPropertyStatus[]>('selectedPropertyStatuses')
const selectedFormats = defineModel<BookFormat[]>('selectedFormats')
const selectedYearRange = defineModel<[number, number]>('selectedYearRange')
const selectedPageRange = defineModel<[number, number]>('selectedPageRange')

defineEmits(['reset', 'apply'])

const statusOptions = computed(() =>
  Object.values(PROGRESS_STATUS_MAP).map((status) => ({
    label: status.description,
    value: status.id,
  })),
)

const selectedStatus = computed<string | undefined>({
  get() {
    return selectedStatuses.value?.[0]
  },
  set(value) {
    selectedStatuses.value = value ? [value as BookProgressStatus] : []
  },
})

const propertyStatusOptions = computed(() =>
  Object.values(PROPERTY_STATUS_MAP).map((status) => ({
    label: status.description,
    value: status.id,
  })),
)

const selectedPropertyStatus = computed<string | undefined>({
  get() {
    return selectedPropertyStatuses.value?.[0]
  },
  set(value) {
    selectedPropertyStatuses.value = value ? [value as BookPropertyStatus] : []
  },
})

const yearLabel = computed(() => {
  if (!selectedYearRange.value) {
    return ''
  }

  return `${selectedYearRange.value[0]} - ${selectedYearRange.value[1]}`
})

const pageLabel = computed(() => {
  if (!selectedPageRange.value) {
    return ''
  }

  return `${selectedPageRange.value[0]} - ${selectedPageRange.value[1]}`
})

function onSelectFormat(value: BookFormat) {
  if (selectedFormats.value) {
    const newValues = selectedFormats.value.filter((status) => status !== value)

    if (newValues.length === selectedFormats.value.length) {
      selectedFormats.value = selectedFormats.value.concat(value)
    } else {
      selectedFormats.value = newValues
    }
  }
}
</script>

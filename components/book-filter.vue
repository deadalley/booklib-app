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
      <h6>Status</h6>
      <bl-raw-select
        v-model="selectedStatus"
        with-wrapper
        placeholder="Any Status"
        :options="statusOptions"
      />
    </div>

    <div class="filter-section">
      <h6>Collections</h6>
      <div class="chip-group">
        <button
          v-for="item in DEFAULT_COLLECTIONS"
          :key="item"
          type="button"
          class="chip"
          :class="{ selected: !!selectedCollections?.includes(item) }"
          @click="onSelectCollection(item)"
        >
          {{ collectionLabels[item] ?? item }}
        </button>
      </div>
    </div>

    <div class="filter-section">
      <h6>Format</h6>
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

    <bl-button expand class="filter-apply" @click="$emit('apply')">
      Apply Filters
    </bl-button>
  </div>
</template>

<script setup lang="ts">
import { icons } from '@tabler/icons-vue'
import type { Author } from '~/types/author'
import type { Book, BookFormat, BookProgressStatus } from '~/types/book'

defineProps<{
  authors: Author[]
  books: Book[]

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
const selectedFormats = defineModel<BookFormat[]>('selectedFormats')
const selectedYearRange = defineModel<[number, number]>('selectedYearRange')
const selectedPageRange = defineModel<[number, number]>('selectedPageRange')

defineEmits(['reset', 'apply'])

const collectionLabels: Record<string, string> = {
  favorite: 'Favorites',
  wishlist: 'Wishlist',
  tbr: 'To Be Read',
}

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

function onSelectPublisher(publisher: string, selected: boolean) {
  if (selectedPublishers.value) {
    const index = selectedPublishers.value.findIndex((v) => v === publisher)
    if (index === -1) {
      selectedPublishers.value.push(publisher)
    } else {
      selectedPublishers.value.splice(index, 1)
    }
  }
}

function resetSelectedPublishers() {
  selectedPublishers.value = []
}

function onSelectStatus(value: BookProgressStatus) {
  if (selectedStatuses.value) {
    const newValues = selectedStatuses.value.filter(
      (status) => status !== value,
    )

    if (newValues.length === selectedStatuses.value.length) {
      selectedStatuses.value = selectedStatuses.value.concat(value)
    } else {
      selectedStatuses.value = newValues
    }
  }
}

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

function onSelectCollection(value: string) {
  if (selectedCollections.value) {
    const index = selectedCollections.value.findIndex((v) => v === value)
    if (index === -1) {
      selectedCollections.value.push(value)
    } else {
      selectedCollections.value.splice(index, 1)
    }
  }
}

function onToggleGenre(value: string) {
  if (selectedGenres.value) {
    const index = selectedGenres.value.findIndex((genre) => genre === value)

    if (index === -1) {
      selectedGenres.value.push(value)
    } else {
      selectedGenres.value.splice(index, 1)
    }
  }
}
</script>

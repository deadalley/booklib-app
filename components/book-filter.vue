<template>
  <div class="flex flex-col gap-16">
    <bl-book-filter-section
      v-model="_selectedPublishers"
      title="Publisher"
      :elements="publishers"
    />
    <bl-book-filter-section
      v-model="_selectedLanguages"
      title="Language"
      :elements="languages"
    />
    <bl-book-filter-section
      v-model="_selectedOriginalLanguages"
      title="Original Language"
      :elements="originalLanguages"
    />
    <bl-book-filter-section
      v-model="_selectedGenres"
      title="Genres"
      :elements="genres"
      :genre="true"
    />
    <div>
      <h5 class="mb-4">Year</h5>
      <bl-slider
        v-model:values="_selectedYearRange"
        :min="minMaxYearRange[0]"
        :max="minMaxYearRange[1]"
        :step="1"
      />
    </div>
    <div>
      <h5 class="mb-4">Page</h5>
      <bl-slider
        v-model:values="_selectedPageRange"
        :min="minMaxPageRange[0]"
        :max="minMaxPageRange[1]"
        :step="50"
      />
    </div>
    <div v-if="isTableView">
      <h5 class="mb-4">Table columns</h5>
      <bl-list-checkbox>
        <bl-list-checkbox-option
          v-for="column in tableColumns"
          :key="column.value"
          :value="column.value"
          :checked="column.checked"
          @input="onColumnFilter"
        >
          {{ column.label }}
        </bl-list-checkbox-option>
      </bl-list-checkbox>
    </div>
    <div class="flex flex-col gap-2">
      <bl-button expand variant="secondary" @click="onReset">
        Reset filters
      </bl-button>
      <bl-button expand @click="onApply">Apply filters</bl-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVModels } from '@vueuse/core'
import type { Book } from '~/types/book'

const props = defineProps<{
  books: Book[]

  publishers: string[]
  languages: string[]
  originalLanguages: string[]
  genres: string[]
  minMaxYearRange: [number, number]
  minMaxPageRange: [number, number]

  selectedPublishers: string[]
  selectedLanguages: string[]
  selectedOriginalLanguages: string[]
  selectedGenres: string[]
  selectedYearRange: [number, number]
  selectedPageRange: [number, number]

  selectedTableColumns: {
    [key in keyof Book]?: { label: string; checked: boolean }
  }

  onReset: () => void
  onApply: () => void
}>()

const route = useRoute()

const isTableView = computed(() => route.query.view === 'table')

const emit = defineEmits([
  'update:selectedPublishers',
  'update:selectedLanguages',
  'update:selectedOriginalLanguages',
  'update:selectedGenres',
  'update:selectedYearRange',
  'update:selectedPageRange',
  'update:selectedTableColumns',
])

const {
  selectedPublishers: _selectedPublishers,
  selectedLanguages: _selectedLanguages,
  selectedOriginalLanguages: _selectedOriginalLanguages,
  selectedGenres: _selectedGenres,
  selectedYearRange: _selectedYearRange,
  selectedPageRange: _selectedPageRange,
} = useVModels(props, emit)

const tableColumns = computed(() =>
  Object.entries(props.selectedTableColumns).map(([value, rest]) => ({
    value,
    ...rest,
  })),
)

function onColumnFilter(v: Event) {
  const { value, checked } = v.target as HTMLInputElement

  const entry =
    props.selectedTableColumns[value as keyof typeof props.selectedTableColumns]

  emit('update:selectedTableColumns', {
    ...props.selectedTableColumns,
    [value]: { ...entry, checked },
  })
}
</script>

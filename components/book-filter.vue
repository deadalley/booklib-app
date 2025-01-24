<template>
  <div class="flex flex-col gap-10">
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
      <h6 class="mb-4">Progress Status</h6>
      <bl-multiselect class="w-full">
        <bl-multiselect-option
          v-for="item in Object.values(PROGRESS_STATUS_MAP)"
          :key="item.id"
          :value="item.id"
          :selected="_selectedStatuses?.includes(item.id)"
          @select="onSelectStatus"
        >
          <template #icon="iconProps">
            <component :is="icons[item.icon]" v-bind="iconProps" />
          </template>
          <template #tooltip>{{ item.description }}</template>
        </bl-multiselect-option>
      </bl-multiselect>
    </div>
    <div>
      <h6>Year</h6>
      <bl-slider
        v-model:values="_selectedYearRange"
        :min="minMaxYearRange[0]"
        :max="minMaxYearRange[1]"
        :step="1"
      />
    </div>
    <div>
      <h6>Page</h6>
      <bl-slider
        v-model:values="_selectedPageRange"
        :min="minMaxPageRange[0]"
        :max="minMaxPageRange[1]"
        :step="50"
      />
    </div>
    <div v-if="isTableView">
      <h6>Table columns</h6>
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
import { icons } from '@tabler/icons-vue'
import { useVModels } from '@vueuse/core'
import type { Book, BookProgressStatus } from '~/types/book'

const route = useRoute()

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
  selectedStatuses: BookProgressStatus[]
  selectedYearRange: [number, number]
  selectedPageRange: [number, number]

  selectedTableColumns: {
    [key in keyof Book]?: { label: string; checked: boolean }
  }

  onReset: () => void
  onApply: () => void
}>()

const isTableView = computed(() => route.query.view === 'table')

const emit = defineEmits([
  'update:selectedPublishers',
  'update:selectedLanguages',
  'update:selectedOriginalLanguages',
  'update:selectedGenres',
  'update:selectedStatuses',
  'update:selectedYearRange',
  'update:selectedPageRange',
  'update:selectedTableColumns',
])

const {
  selectedPublishers: _selectedPublishers,
  selectedLanguages: _selectedLanguages,
  selectedOriginalLanguages: _selectedOriginalLanguages,
  selectedGenres: _selectedGenres,
  selectedStatuses: _selectedStatuses,
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

function onSelectStatus(value: BookProgressStatus) {
  const newValues = _selectedStatuses.value.filter((status) => status !== value)

  if (newValues.length === _selectedStatuses.value.length) {
    _selectedStatuses.value = _selectedStatuses.value.concat(value)
  } else {
    _selectedStatuses.value = newValues
  }
}
</script>

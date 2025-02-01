<template>
  <div class="flex flex-col gap-10">
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
          :selected="!!selectedStatuses?.includes(item.id)"
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
        v-if="selectedYearRange"
        v-model:values="selectedYearRange"
        :min="minMaxYearRange[0]"
        :max="minMaxYearRange[1]"
        :step="1"
      />
    </div>
    <div>
      <h6>Page</h6>
      <bl-slider
        v-if="selectedPageRange"
        v-model:values="selectedPageRange"
        :min="minMaxPageRange[0]"
        :max="minMaxPageRange[1]"
        :step="50"
      />
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
// import { useVModels } from '@vueuse/core'
import type { Book, BookProgressStatus } from '~/types/book'

defineProps<{
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

  // onReset: () => void
  // onApply: () => void
}>()

const selectedPublishers = defineModel<string[]>('selectedPublishers')
const selectedLanguages = defineModel<string[]>('selectedLanguages')
const selectedOriginalLanguages = defineModel<string[]>(
  'selectedOriginalLanguages',
)
const selectedGenres = defineModel<string[]>('selectedGenres')
const selectedStatuses = defineModel<BookProgressStatus[]>('selectedStatuses')
const selectedYearRange = defineModel<[number, number]>('selectedYearRange')
const selectedPageRange = defineModel<[number, number]>('selectedPageRange')

defineEmits(['reset', 'apply'])

// const emit = defineEmits([
//   'update:selectedPublishers',
//   'update:selectedLanguages',
//   'update:selectedOriginalLanguages',
//   'update:selectedGenres',
//   'update:selectedStatuses',
//   'update:selectedYearRange',
//   'update:selectedPageRange',
//   'update:selectedTableColumns',
// ])

// const {
//   selectedPublishers: _selectedPublishers,
//   selectedLanguages: _selectedLanguages,
//   selectedOriginalLanguages: _selectedOriginalLanguages,
//   selectedGenres: _selectedGenres,
//   selectedStatuses: _selectedStatuses,
//   selectedYearRange: _selectedYearRange,
//   selectedPageRange: _selectedPageRange,
// } = useVModels(props, emit)

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
</script>

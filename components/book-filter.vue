<template>
  <div class="flex flex-col gap-10">
    <div>
      <h6 class="mb-4">Author</h6>
      <bl-raw-autocomplete
        v-model="selectedAuthor"
        with-wrapper
        clearable
        placeholder="Select author"
        :options="
          authors.map(({ id, name }) => ({ label: name, value: String(id) }))
        "
      />
    </div>
    <div>
      <h6 class="mb-4">Collections</h6>
      <bl-multiselect class="w-full">
        <bl-multiselect-option
          v-for="item in DEFAULT_COLLECTIONS"
          :key="item"
          :value="item"
          :selected="!!selectedCollections?.includes(item)"
          @select="onSelectCollection"
        >
          <template #icon="iconProps">
            <component
              :is="
                icons[
                  (selectedCollections?.includes(item)
                    ? DEFAULT_COLLECTION_ICONS_FILLED
                    : DEFAULT_COLLECTION_ICONS)[item]
                ]
              "
              v-bind="iconProps"
            />
          </template>
        </bl-multiselect-option>
      </bl-multiselect>
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
      <h6 class="mb-4">Book Format</h6>
      <bl-multiselect class="w-full">
        <bl-multiselect-option
          v-for="item in Object.values(BOOK_FORMAT_MAP)"
          :key="item.id"
          :value="item.id"
          :selected="!!selectedFormats?.includes(item.id)"
          @select="onSelectFormat"
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
      <bl-button expand variant="secondary" @click="$emit('reset')">
        Reset filters
      </bl-button>
      <bl-button expand @click="$emit('apply')">Apply filters</bl-button>
    </div>
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
</script>

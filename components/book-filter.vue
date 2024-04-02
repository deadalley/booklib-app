<template>
  <div class="flex flex-col gap-16">
    <bl-book-filter-section
      v-model="_selectedPublishers"
      title="Publisher"
      :elements="publishers"
    ></bl-book-filter-section>
    <bl-book-filter-section
      v-model="_selectedLanguages"
      title="Language"
      :elements="languages"
    ></bl-book-filter-section>
    <bl-book-filter-section
      v-model="_selectedOriginalLanguages"
      title="Original Language"
      :elements="originalLanguages"
    ></bl-book-filter-section>
    <div>
      <h5 class="mb-4">Year</h5>
      <bl-slider
        v-model="_selectedYearRange"
        :min="minMaxYearRange[0]"
        :max="minMaxYearRange[1]"
        :step="1"
      ></bl-slider>
    </div>
    <div>
      <h5 class="mb-4">Page</h5>
      <bl-slider
        v-model="_selectedPageRange"
        :min="minMaxPageRange[0]"
        :max="minMaxPageRange[1]"
        :step="50"
      ></bl-slider>
    </div>
    <bl-button expand variant="secondary" @click="onReset"
      >Reset Filters</bl-button
    >
  </div>
</template>

<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import type { Book } from '~/types/book'

const props = defineProps<{
  books: Book[]

  publishers: string[]
  languages: string[]
  originalLanguages: string[]
  minMaxYearRange: [number, number]
  minMaxPageRange: [number, number]

  selectedPublishers: string[]
  selectedLanguages: string[]
  selectedOriginalLanguages: string[]
  selectedYearRange: [number, number]
  selectedPageRange: [number, number]

  onReset: () => void
}>()

const emit = defineEmits([
  'update:selectedPublishers',
  'update:selectedLanguages',
  'update:selectedOriginalLanguages',
  'update:selectedYearRange',
  'update:selectedPageRange',
])

const _selectedPublishers = useVModel(props, 'selectedPublishers', emit)
const _selectedLanguages = useVModel(props, 'selectedLanguages', emit)
const _selectedOriginalLanguages = useVModel(
  props,
  'selectedOriginalLanguages',
  emit,
)
const _selectedYearRange = useVModel(props, 'selectedYearRange', emit)
const _selectedPageRange = useVModel(props, 'selectedPageRange', emit)
</script>

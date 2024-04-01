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
        :min="minYear"
        :max="maxYear"
        :step="1"
      ></bl-slider>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import type { Book } from '~/types/book'

const props = defineProps<{
  books: Book[]
  selectedPublishers: string[]
  selectedLanguages: string[]
  selectedOriginalLanguages: string[]
  selectedYearRange: [number, number]
}>()

const years = computed(() => getUniqueElements(props.books, 'year'))
const publishers = computed(() => getUniqueElements(props.books, 'publisher'))
const languages = computed(() => getUniqueElements(props.books, 'language'))
const originalLanguages = computed(() =>
  getUniqueElements(props.books, 'originalLanguage'),
)

const minYear = computed(() => Math.min(...years.value))
const maxYear = computed(() => new Date().getFullYear())

const emit = defineEmits([
  'update:selectedPublishers',
  'update:selectedLanguages',
  'update:selectedOriginalLanguages',
  'update:selectedYearRange',
])

const _selectedPublishers = useVModel(props, 'selectedPublishers', emit)
const _selectedLanguages = useVModel(props, 'selectedLanguages', emit)
const _selectedOriginalLanguages = useVModel(
  props,
  'selectedOriginalLanguages',
  emit,
)
const _selectedYearRange = useVModel(props, 'selectedYearRange', emit)
</script>

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
}>()

const publishers = computed(() => getUniqueElements(props.books, 'publisher'))
const languages = computed(() => getUniqueElements(props.books, 'language'))
const originalLanguages = computed(() =>
  getUniqueElements(props.books, 'originalLanguage'),
)

const emit = defineEmits([
  'update:selectedPublishers',
  'update:selectedLanguages',
  'update:selectedOriginalLanguages',
])

const _selectedPublishers = useVModel(props, 'selectedPublishers', emit)
const _selectedLanguages = useVModel(props, 'selectedLanguages', emit)
const _selectedOriginalLanguages = useVModel(
  props,
  'selectedOriginalLanguages',
  emit,
)
</script>

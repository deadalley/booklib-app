<template>
  <div class="flex flex-col gap-16">
    <bl-book-filter-section
      title="Publisher"
      :elements="publishers"
      :selected-elements="selectedPublishers"
    ></bl-book-filter-section>
    <bl-book-filter-section
      title="Language"
      :elements="languages"
      :selected-elements="selectedLanguages"
    ></bl-book-filter-section>
    <bl-book-filter-section
      title="Original Language"
      :elements="originalLanguages"
      :selected-elements="selectedOriginalLanguages"
    ></bl-book-filter-section>
  </div>
</template>

<script setup lang="ts">
import type { Book } from '~/types/book'

const props = defineProps<{ books: Book[] }>()

const publishers = computed(() => getUniqueElements(props.books, 'publisher'))
const languages = computed(() => getUniqueElements(props.books, 'language'))
const originalLanguages = computed(() =>
  getUniqueElements(props.books, 'originalLanguage'),
)

const selectedPublishers = reactive<string[]>([])
const selectedLanguages = reactive<string[]>([])
const selectedOriginalLanguages = reactive<string[]>([])
</script>

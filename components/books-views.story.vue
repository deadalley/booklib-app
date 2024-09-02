<script setup>
import { buildBook } from '../utils'

const state = reactive({
  books: [
    buildBook(),
    buildBook(),
    buildBook(),
    buildBook(),
    buildBook(),
    buildBook(),
  ],
  selectedTableColumns: {
    coverSrc: { label: 'Cover', checked: false },
    publisher: { label: 'Publisher', checked: true },
    language: { label: 'Language', checked: true },
    year: { label: 'Year', checked: true },
    pages: { label: 'Pages', checked: true },
    rating: { label: 'Rating', checked: true },
    originalTitle: { label: 'Original Title', checked: true },
    originalLanguage: { label: 'Original Language', checked: true },
    isbn: { label: 'ISBN', checked: true },
  },
})

const view = ref('cards')
</script>

<template>
  <Story title="Organisms/Books Views">
    <bl-view-switch v-model:view="view" />
    <bl-books-views
      :view="view"
      :books="state.books"
      :selected-table-columns="state.selectedTableColumns"
    />
  </Story>
</template>

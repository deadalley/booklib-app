<template>
  <div
    v-if="view === 'cards'"
    class="grid h-min w-full grid-cols-1 gap-x-6 gap-y-8 overflow-auto md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-12"
  >
    <bl-book-card v-for="book in books" :key="book.title" :book="book" />
  </div>
  <div v-if="view === 'table'" class="overflow-x-auto">
    <bl-books-table
      :books="books"
      :selected-table-columns="selectedTableColumns"
    />
  </div>
</template>

<script setup lang="ts">
import type { Book } from '~/types/book'

defineProps<{
  view: 'cards' | 'table'
  books: Book[]
  selectedTableColumns: {
    [key in keyof Book]?: { label: string; checked: boolean }
  }
}>()
</script>

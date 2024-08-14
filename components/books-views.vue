<template>
  <div
    v-if="view === 'cards'"
    class="grid h-min w-full grid-cols-1 gap-x-6 gap-y-8 overflow-auto pt-1"
    :class="{
      'md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-12': !small,
      'md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8': small,
    }"
  >
    <bl-book-card
      v-for="book in books"
      :key="book.title"
      :book="book"
      :selectable="selectable"
    />
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
import type { View } from '~/types/ui'

defineProps<{
  view: View
  books: Book[]
  small?: boolean
  selectable?: boolean
  selectedTableColumns: {
    [key in keyof Book]?: { label: string; checked: boolean }
  }
}>()
</script>

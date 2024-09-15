<template>
  <div
    v-if="view === 'cards'"
    class="grid h-min w-full grid-cols-1 flex-wrap gap-x-6 gap-y-8 overflow-visible overflow-y-auto p-1 md:grid-cols-[repeat(auto-fill,minmax(9rem,1fr))]"
  >
    <bl-book-card
      v-for="book in books"
      :key="book.title"
      :book="book"
      :selectable="selectable"
      :selected="book.selected"
      class="md:!w-36"
      @selected="(selected: boolean) => onSelectBook(book.id, selected)"
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
  books: (Book & { selected?: boolean })[]
  small?: boolean
  selectable?: boolean
  selectedTableColumns: {
    [key in keyof Book]?: { label: string; checked: boolean }
  }
}>()

const emit = defineEmits<{
  (e: 'book-select', val: { bookId: Book['id']; selected: boolean }): void
}>()

function onSelectBook(bookId: Book['id'], selected: boolean) {
  emit('book-select', { bookId, selected })
}
</script>

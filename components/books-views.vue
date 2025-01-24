<template>
  <bl-books-grid
    v-if="view === 'cards'"
    :books="selectedBooks"
    :selectable="selectable"
    @select="(args) => $emit('book-select', args)"
  />
  <hr v-if="selectable" class="my-8 text-main" />
  <bl-books-grid
    v-if="view === 'cards' && selectable"
    :books="notSelectedBooks"
    :selectable="selectable"
    @select="(args) => $emit('book-select', args)"
  />
  <div v-if="view === 'table'" class="overflow-x-auto">
    <bl-books-table
      :books="books"
      :selected-table-columns="selectedTableColumns"
      interactive
    />
  </div>
</template>

<script setup lang="ts">
import type { Book } from '~/types/book'
import type { View } from '~/types/ui'

const props = defineProps<{
  view: View
  books: (Book & { selected?: boolean })[]
  small?: boolean
  selectable?: boolean
  selectedTableColumns: {
    [key in keyof Book]?: { label: string; checked: boolean }
  }
}>()

defineEmits<{
  (e: 'book-select', val: { bookId: Book['id']; selected: boolean }): void
}>()

const selectedBooks = computed(() =>
  props.books.concat().filter((book) => book.selected),
)

const notSelectedBooks = computed(() =>
  props.books.concat().filter((book) => !book.selected),
)
</script>

<template>
  <template v-if="interactive">
    <bl-books-grid
      v-if="view === 'cards'"
      v-model="selectedBooks"
      :selectable="editing"
      :draggable="editing"
      @drag="(args) => $emit('book-drag', args)"
      @select="(args) => $emit('book-select', args)"
    />
    <hr v-if="editing" class="my-8 text-main" />
    <bl-books-grid
      v-if="view === 'cards' && editing"
      v-model="notSelectedBooks"
      :selectable="editing"
      @select="(args) => $emit('book-select', args)"
    />
  </template>

  <bl-books-grid v-if="!interactive && view === 'cards'" v-model="books" />

  <div v-if="view === 'table'" class="overflow-x-auto">
    <bl-books-table
      :books="books"
      :selected-table-columns="selectedTableColumns"
      interactive
    />
  </div>

  <div v-if="totalBookCount" class="flex justify-center py-2">
    <bl-pagination
      v-model="currentPage"
      :total-item-count="totalBookCount"
      :items-per-page="BOOKS_PAGE_SIZE"
      @update:page="(args) => $emit('update:page', args)"
    />
  </div>
</template>

<script setup lang="ts">
import type { Book, ViewBook } from '~/types/book'
import type { View } from '~/types/ui'

defineProps<{
  view: View
  interactive?: boolean
  editing?: boolean
  totalBookCount?: number
  selectedTableColumns: {
    [key in keyof Book]?: { label: string; checked: boolean }
  }
}>()

const selectedBooks = defineModel<ViewBook[]>('selectedBooks', {
  default: [],
})

const notSelectedBooks = defineModel<ViewBook[]>('notSelectedBooks', {
  default: [],
})

const books = defineModel<ViewBook[]>('books', {
  default: [],
})

const currentPage = defineModel<number>('currentPage')

defineEmits<{
  (e: 'book-select', val: { bookId: Book['id']; selected: boolean }): void
  (
    e: 'book-drag',
    val: { bookId: Book['id']; newOrder: number; oldOrder: number },
  ): void
  (e: 'update:page', val: number): void
}>()
</script>

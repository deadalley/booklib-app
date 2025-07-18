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
    <div v-if="editing" class="flex items-center justify-between">
      <h4>All books</h4>
      <bl-search-bar
        @input="
          (v: Event) => {
            onSearch(v)
            onSearchTable(v)
          }
        "
      />
    </div>
    <bl-books-grid
      v-if="view === 'cards' && editing"
      v-model="sortedBooks"
      :selectable="editing"
      @select="(args) => $emit('book-select', args)"
    />
  </template>

  <bl-books-grid
    v-if="!interactive && view === 'cards'"
    v-model="books"
    :selectable="editing"
    @select="(args) => $emit('book-select', args)"
  />

  <div v-if="view === 'table'" class="overflow-x-auto">
    <bl-books-table
      :books="!interactive || editing ? sortedBooksForTable : selectedBooks"
      :selected-table-columns="selectedTableColumns"
      :with-check="editing"
      :row-clickable="!editing"
      interactive
      @select:row="
        (args) =>
          $emit('book-select', { bookId: args.id, selected: args.selected })
      "
    />
  </div>

  <div
    v-if="totalBookCount && totalBookCount > BOOKS_PAGE_SIZE"
    class="flex justify-center py-2"
  >
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

const { sortedBooks, onSearch } = useSortBooks(notSelectedBooks)
const { sortedBooks: sortedBooksForTable, onSearch: onSearchTable } =
  useSortBooks(books)

defineEmits<{
  (e: 'book-select', val: { bookId: Book['id']; selected: boolean }): void
  (
    e: 'book-drag',
    val: { bookId: Book['id']; newOrder: number; oldOrder: number },
  ): void
  (e: 'update:page', val: number): void
}>()
</script>

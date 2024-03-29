<template>
  <bl-table :data="data" :columns="columns"></bl-table>
</template>

<script setup lang="ts">
import { createColumnHelper, type CellContext } from '@tanstack/vue-table'
import type { Book } from '~/types/book'
import BlBookImageSmall from './book-image-small.vue'

const props = defineProps<{ books: Book[] }>()

const cell = <U,>(info: CellContext<Book, U | null>) => info.getValue()

const columnHelper = createColumnHelper<Book>()

const columns = [
  columnHelper.accessor('coverSrc', {
    header: '',
    cell: (info) => {
      const book = info.row.original
      return h(BlBookImageSmall, {
        book,
      })
    },
  }),
  columnHelper.accessor('title', {
    header: 'Title',
    cell,
  }),
  columnHelper.accessor('publisher', {
    header: 'Publisher',
    cell,
  }),
  columnHelper.accessor('language', {
    header: 'Language',
    cell,
  }),
  columnHelper.accessor('year', {
    header: 'Year',
    cell,
  }),
  columnHelper.accessor('pages', {
    header: 'Pages',
    cell,
  }),
  columnHelper.accessor('rating', {
    header: 'Rating',
    cell,
  }),
  columnHelper.accessor('originalTitle', {
    header: 'Original Title',
    cell,
  }),
  columnHelper.accessor('originalLanguage', {
    header: 'Original Language',
    cell,
  }),
  columnHelper.accessor('isbn', {
    header: 'ISBN',
    cell,
  }),
]

const data = props.books
</script>

<style scoped>
/deep/ th:first-child,
/deep/ td:first-child {
  width: 10%;
  /* min-width: max-content;
  max-width: max-content;
  width: max-content; */
}
</style>

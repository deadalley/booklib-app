<template>
  <bl-table :data="data" :columns="columns"></bl-table>
</template>

<script setup lang="ts">
import { createColumnHelper, type CellContext } from '@tanstack/vue-table'
import type { Book } from '~/types/book'
import BlBookImageSmall from './book-image-small.vue'
import BlRating from './rating.vue'

const props = defineProps<{
  books: Book[]
  selectedTableColumns: {
    [key in keyof Book]?: { label: string; checked: boolean }
  }
}>()

const cell = <U,>(info: CellContext<Book, U | null>) => info.getValue()

const columnHelper = createColumnHelper<Book>()

const columns = computed(() =>
  [
    columnHelper.accessor('coverSrc', {
      header: '',
      cell: (info) => {
        const book = info.row.original
        return h(BlBookImageSmall, {
          book,
        })
      },
      enableSorting: false,
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
      cell: (info) => {
        const rating = info.getValue()

        if (rating) {
          return h(BlRating, {
            rating: info.getValue() ?? 0,
            editing: false,
            iconSize: 16,
          })
        } else {
          return null
        }
      },
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
  ].filter((column) => {
    const key = (column as any)
      .accessorKey as keyof typeof props.selectedTableColumns

    return (
      !props.selectedTableColumns[key] ||
      props.selectedTableColumns[key]?.checked
    )
  }),
)

const data = computed(() => props.books)
</script>

<style scoped>
:deep(th:first-child),
:deep(td:first-child) {
  width: 10%;
}
</style>

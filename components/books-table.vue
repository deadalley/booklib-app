<template>
  <bl-table :data="books" :columns="columns" :on-row-click="onRowClick" />
</template>

<script setup lang="ts">
import {
  createColumnHelper,
  type CellContext,
  type ColumnDef,
} from '@tanstack/vue-table'
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

const columns = computed(
  () =>
    [
      columnHelper.accessor('coverSrc', {
        header: '',
        cell: (info) => {
          const book = info.row.original
          return h(BlBookImageSmall, {
            href: `/library/books/${book.id}`,
            alt: book.title,
            coverSrc: book.coverSrc,
          })
        },
        enableSorting: false,
        size: 12,
      }),
      columnHelper.accessor('title', {
        header: 'Title',
        cell: (info) => h('b', info.getValue()),
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
        size: 8,
      }),
      columnHelper.accessor('pages', {
        header: 'Pages',
        cell,
        size: 8,
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
        size: 16,
      }),
      columnHelper.accessor('isbn', {
        header: 'ISBN',
        cell,
      }),
    ].filter((column) => {
      const key = column.accessorKey as keyof typeof props.selectedTableColumns

      return (
        !props.selectedTableColumns[key] ||
        props.selectedTableColumns[key]?.checked
      )
    }) as ColumnDef<Book, unknown>[],
)

function onRowClick(row: Book) {
  navigateTo(`/library/books/${row.id}`)
}
</script>

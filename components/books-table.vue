<template>
  <bl-table
    v-bind="$attrs"
    :data="books"
    :columns="columns"
    :on-row-click="interactive ? onRowClick : undefined"
    :with-check="withCheck"
  />
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
import languageOptions from '~/public/languages-2.json'
import { BlProgressStatusIcon } from '#components'

type DataType = Book & { checked?: boolean }

const props = defineProps<{
  books: DataType[]
  selectedTableColumns: {
    [key in keyof Book]?: { label: string; checked: boolean }
  }
  interactive?: boolean
  withCheck?: boolean
}>()

const cell = <U,>(info: CellContext<DataType, U | null>) => info.getValue()

const columnHelper = createColumnHelper<DataType>()

const columns = computed<ColumnDef<DataType, unknown>[]>(
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
        cell: (info) =>
          languageOptions[info.getValue() as keyof typeof languageOptions] ??
          info.getValue(),
      }),
      columnHelper.accessor('year', {
        header: 'Year',
        cell,
        size: 8,
      }),
      columnHelper.accessor('pages', {
        header: 'Pages',
        cell,
        size: 10,
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
      }),
      columnHelper.accessor('originalLanguage', {
        header: 'Original Language',
        cell: (info) =>
          languageOptions[info.getValue() as keyof typeof languageOptions] ??
          info.getValue(),
        size: 16,
      }),
      columnHelper.accessor('isbn', {
        header: 'ISBN',
        cell,
      }),
      columnHelper.accessor('progressStatus', {
        header: 'Status',
        cell: (info) => {
          const status = info.getValue()

          if (status) {
            return h(BlProgressStatusIcon, {
              status,
            })
          } else {
            return null
          }
        },
      }),
    ].filter((column) => {
      if (!column) {
        return false
      }

      const key = column.accessorKey as keyof typeof props.selectedTableColumns

      return (
        !props.selectedTableColumns[key] ||
        props.selectedTableColumns[key]?.checked
      )
    }) as ColumnDef<DataType, unknown>[],
)

function onRowClick(row: DataType) {
  navigateTo(`/library/books/${row.id}`)
}
</script>

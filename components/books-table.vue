<template>
  <bl-table
    v-bind="$props"
    :data="books"
    :columns="columns"
    @click:row="interactive ? onRowClick : undefined"
    @select:row="(args) => $emit('select:row', args)"
    @select:rows="(args) => $emit('select:rows', args)"
  />
</template>

<script setup lang="ts">
import { createColumnHelper } from '@tanstack/vue-table'
import type {
  CellContext,
  ColumnDef,
  RowSelectionState,
} from '@tanstack/vue-table'
import type { Book, ViewBook } from '~/types/book'
import BlBookImageSmall from './book-image-small.vue'
import BlRating from './rating.vue'
import languageOptions from '~/public/languages-2.json'
import { BlProgressStatusIcon } from '#components'

type DataType = ViewBook

const props = defineProps<{
  books: DataType[]
  selectedTableColumns: {
    [key in keyof Book]?: { label: string; checked: boolean }
  }
  interactive?: boolean
  withCheck?: boolean
  defaultSelected?: boolean
  rowClickable?: boolean
}>()

defineEmits<{
  (e: 'select:row', val: { id: ViewBook['id']; selected: boolean }): void
  (e: 'select:rows', val: RowSelectionState): void
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
      columnHelper.accessor('authorName', {
        header: 'Author',
        cell,
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

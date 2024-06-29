<template>
  <bl-table
    :data="data"
    :columns="columns"
    :on-row-click="onRowClick"
  ></bl-table>
</template>

<script setup lang="ts">
import { createColumnHelper, type CellContext } from '@tanstack/vue-table'
import type { Collection } from '~/types/collection'

const props = defineProps<{
  collections: Collection[]
  selectedTableColumns: {
    [key in keyof Collection]?: { label: string; checked: boolean }
  }
}>()

const columnHelper = createColumnHelper<Collection>()

const columns = computed(() =>
  [
    columnHelper.accessor('title', {
      header: 'Title',
      cell: (info) => h('h6', info.getValue()),
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

const data = computed(() => props.collections)

function onRowClick(row: Collection) {
  navigateTo(`/library/collections/${row.id}`)
}
</script>

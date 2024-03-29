<template>
  <table>
    <thead>
      <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
        <th
          v-for="header in headerGroup.headers"
          :key="header.id"
          :colSpan="header.colSpan"
        >
          <FlexRender
            v-if="!header.isPlaceholder"
            :render="header.column.columnDef.header"
            :props="header.getContext()"
          />
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in table.getRowModel().rows" :key="row.id">
        <td v-for="cell in row.getVisibleCells()" :key="cell.id">
          <FlexRender
            :render="cell.column.columnDef.cell"
            :props="cell.getContext()"
          />
        </td>
      </tr>
    </tbody>
    <tfoot>
      <tr v-for="footerGroup in table.getFooterGroups()" :key="footerGroup.id">
        <th
          v-for="header in footerGroup.headers"
          :key="header.id"
          :colSpan="header.colSpan"
        >
          <FlexRender
            v-if="!header.isPlaceholder"
            :render="header.column.columnDef.footer"
            :props="header.getContext()"
          />
        </th>
      </tr>
    </tfoot>
  </table>
</template>

<script setup lang="ts" generic="T">
import {
  useVueTable,
  type ColumnDef,
  type ColumnOrderState,
  getCoreRowModel,
  FlexRender,
} from '@tanstack/vue-table'

const props = defineProps<{ data: T[]; columns: ColumnDef<T, any>[] }>()

const columnVisibility = ref({})
const columnOrder = ref<ColumnOrderState>([])

const table = useVueTable({
  get data(): T[] {
    return props.data
  },
  get columns() {
    return props.columns
  },
  state: {
    get columnVisibility() {
      return columnVisibility.value
    },
    get columnOrder() {
      return columnOrder.value
    },
  },

  onColumnOrderChange: (order) => {
    columnOrder.value = order as string[]
  },
  getCoreRowModel: getCoreRowModel(),

  defaultColumn: {
    size: 0,
    minSize: 0,
  },
})
</script>

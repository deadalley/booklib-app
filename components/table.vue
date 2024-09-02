<template>
  <table class="bl-table">
    <thead>
      <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
        <th
          v-for="header in headerGroup.headers"
          :key="header.id"
          :colSpan="header.colSpan"
          :class="
            header.column.getCanSort() ? 'cursor-pointer select-none' : ''
          "
          :style="{
            width:
              header.column.getSize() === 0
                ? 'auto'
                : `${header.column.getSize()}%`,
          }"
          @click="header.column.getToggleSortingHandler()?.($event)"
        >
          <span v-if="!header.isPlaceholder">
            <FlexRender
              :render="header.column.columnDef.header"
              :props="header.getContext()"
            />
            <IconSelector
              v-if="header.column.getCanSort() && !header.column.getIsSorted()"
              :size="16"
              stroke="2"
            />
            <IconChevronUp
              v-if="
                header.column.getCanSort() &&
                header.column.getIsSorted() === 'asc'
              "
              :size="16"
              stroke="2"
            />
            <IconChevronDown
              v-if="
                header.column.getCanSort() &&
                header.column.getIsSorted() === 'desc'
              "
              :size="16"
              stroke="2"
            />
          </span>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="row in table.getRowModel().rows"
        :key="row.id"
        :class="{
          'cursor-pointer hover:bg-accent-light/40': !!onRowClick,
        }"
        @click="onRowClick(row.original)"
      >
        <td
          v-for="cell in row.getVisibleCells()"
          :key="cell.id"
          :style="{
            width:
              cell.column.getSize() === 0
                ? 'auto'
                : `${cell.column.getSize()}%`,
          }"
        >
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
  getSortedRowModel,
  FlexRender,
} from '@tanstack/vue-table'
import { IconSelector, IconChevronUp, IconChevronDown } from '@tabler/icons-vue'

const props = defineProps<{
  data: T[]
  columns: ColumnDef<T, unknown>[]
  onRowClick: (row: T) => void
}>()

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
  getSortedRowModel: getSortedRowModel(),

  defaultColumn: {
    size: 0,
    minSize: 0,
  },
})
</script>

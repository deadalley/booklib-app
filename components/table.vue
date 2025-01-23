<template>
  <table class="bl-table">
    <thead>
      <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
        <th
          v-for="header in headerGroup.headers"
          :key="header.id"
          :colSpan="header.colSpan"
          :class="{
            'cursor-pointer select-none': header.column.getCanSort(),
            '!p-0 text-center align-middle': header.column.id === 'checked',
          }"
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
        @click="onRowClick?.(row.original)"
      >
        <td
          v-for="cell in row.getVisibleCells()"
          :key="cell.id"
          :class="{
            '!p-0 text-center align-middle': cell.column.id === 'checked',
          }"
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

<script setup lang="ts" generic="T extends { id: string | number }">
import {
  useVueTable,
  type ColumnDef,
  type ColumnOrderState,
  getCoreRowModel,
  getSortedRowModel,
  FlexRender,
  type RowSelectionState,
  type CellContext,
  type HeaderContext,
} from '@tanstack/vue-table'
import { IconSelector, IconChevronUp, IconChevronDown } from '@tabler/icons-vue'
import { BlCheckbox } from '#components'

const props = defineProps<{
  data: T[]
  columns: ColumnDef<T, unknown>[]
  withCheck?: boolean
  onRowClick?: (row: T) => void
}>()

const columnVisibility = ref({})
const columnOrder = ref<ColumnOrderState>([])
const rowSelection = ref<RowSelectionState>(
  props.data.reduce((acc, { id }) => ({ ...acc, [id]: true }), {}),
)

const emit = defineEmits<{
  (e: 'select', val: { id: T['id']; selected: boolean }): void
  (e: 'selected-rows', val: typeof rowSelection.value): void
}>()

const table = useVueTable({
  get data(): T[] {
    return props.data
  },
  get columns() {
    if (props.withCheck) {
      return [
        {
          id: 'checked',
          header: (info: HeaderContext<T, string | undefined>) => {
            return h(BlCheckbox, {
              id: 'all-checked',
              checked: info.table.getIsAllRowsSelected(),
              onChange: info.table.getToggleAllRowsSelectedHandler(),
            })
          },
          cell: (info: CellContext<T, string | undefined>) => {
            if (!info.row.getCanSelect()) {
              return null
            }

            return h(BlCheckbox, {
              id: `${info.row.original.id}-checked`,
              checked: info.row.getIsSelected(),
              onChange: (event: Event) => {
                emit('select', {
                  id: info.row.original.id,
                  selected: (event.target as HTMLInputElement).checked,
                })
                return info.row.getToggleSelectedHandler()(event)
              },
            })
          },
          enableSorting: false,
          size: 4,
        },

        ...props.columns,
      ]
    }
    return props.columns
  },
  state: {
    get columnVisibility() {
      return columnVisibility.value
    },
    get columnOrder() {
      return columnOrder.value
    },
    get rowSelection() {
      return rowSelection.value
    },
  },
  enableRowSelection: props.withCheck,

  getRowId: (row) => String(row.id),

  onRowSelectionChange: (updateOrValue) => {
    const newValue =
      typeof updateOrValue === 'function'
        ? updateOrValue(rowSelection.value)
        : updateOrValue

    emit('selected-rows', newValue)
    rowSelection.value = newValue
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

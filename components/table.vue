<template>
  <div class="bl-table-wrapper">
    <table class="bl-table">
      <thead>
        <tr
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id"
        >
          <th
            v-for="header in headerGroup.headers"
            :key="header.id"
            :colSpan="header.colSpan"
            :class="{
              'cursor-pointer select-none': header.column.getCanSort(),
              'text-center align-middle': header.column.id === 'checked',
            }"
            :style="{
              padding: header.column.id === 'checked' ? '0' : undefined,
              width: columnWidth(header.column),
            }"
            @click="header.column.getToggleSortingHandler()?.($event)"
          >
            <span
              v-if="!header.isPlaceholder"
              :class="{ 'justify-center': header.column.id === 'checked' }"
            >
              <FlexRender
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
              <IconSelector
                v-if="
                  header.column.getCanSort() && !header.column.getIsSorted()
                "
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
            'hover:bg-surface-subtle/40 cursor-pointer': !!rowClickable,
            'bg-primary-50': withCheck && row.getIsSelected(),
          }"
          @click="rowClickable ? $emit('click:row', row.original) : undefined"
        >
          <td
            v-for="cell in row.getVisibleCells()"
            :key="cell.id"
            :class="{
              'text-center align-middle': cell.column.id === 'checked',
            }"
            :style="{
              padding: cell.column.id === 'checked' ? '0' : undefined,
              width: columnWidth(cell.column),
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
        <tr
          v-for="footerGroup in table.getFooterGroups()"
          :key="footerGroup.id"
        >
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
  </div>
</template>

<script
  setup
  lang="ts"
  generic="T extends { id: string | number; selected?: boolean }"
>
import {
  useVueTable,
  getCoreRowModel,
  getSortedRowModel,
  FlexRender,
} from '@tanstack/vue-table'
import type {
  Column,
  ColumnDef,
  ColumnOrderState,
  RowSelectionState,
  CellContext,
  HeaderContext,
} from '@tanstack/vue-table'
import { IconSelector, IconChevronUp, IconChevronDown } from '@tabler/icons-vue'

const props = defineProps<{
  data: T[]
  columns: ColumnDef<T, unknown>[]
  withCheck?: boolean
  defaultSelected?: boolean
  rowClickable?: boolean
}>()

const columnVisibility = ref({})
const columnOrder = ref<ColumnOrderState>([])
const rowSelection = ref<RowSelectionState>(
  props.data.reduce(
    (acc, { id, selected }) => ({
      ...acc,
      [id]: selected === undefined ? props.defaultSelected : selected,
    }),
    {},
  ),
)

watch(
  () => props.data.map(({ id, selected }) => [id, selected] as const),
  (rows) => {
    const next = { ...rowSelection.value }
    let changed = false

    rows.forEach(([id, selected]) => {
      if (selected !== undefined && !!next[id] !== selected) {
        next[id] = selected
        changed = true
      }
    })

    if (changed) rowSelection.value = next
  },
)

function columnWidth(column: Column<T, unknown>) {
  if (column.id === 'checked') return '52px'

  return column.getSize() === 0 ? 'auto' : `${column.getSize()}%`
}

const emit = defineEmits<{
  (e: 'click:row', val: T): void
  (e: 'select:row', val: { id: T['id']; selected: boolean }): void
  (e: 'select:rows', val: typeof rowSelection.value): void
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
            return h('input', {
              type: 'checkbox',
              class: 'table-check',
              'aria-label': 'Select all rows',
              checked: info.table.getIsAllRowsSelected(),
              indeterminate: info.table.getIsSomeRowsSelected(),
              onChange: info.table.getToggleAllRowsSelectedHandler(),
            })
          },
          cell: (info: CellContext<T, string | undefined>) => {
            if (!info.row.getCanSelect()) {
              return null
            }

            return h('input', {
              type: 'checkbox',
              class: 'table-check',
              'aria-label': 'Select row',
              checked: info.row.getIsSelected(),
              onClick: (event: MouseEvent) => event.stopPropagation(),
              onChange: info.row.getToggleSelectedHandler(),
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
  enableRowSelection: true,

  getRowId: (row) => String(row.id),

  onRowSelectionChange: (updateOrValue) => {
    const newValue =
      typeof updateOrValue === 'function'
        ? updateOrValue(rowSelection.value)
        : updateOrValue

    emit('select:rows', newValue)
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

<style scoped>
@reference '../assets/css/main.css';

.table-check {
  @apply accent-primary m-0 size-4 cursor-pointer align-middle;
}
</style>

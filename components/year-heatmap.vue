<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <h5 class="stats-title">{{ title }}</h5>
      <div class="legend" aria-hidden="true">
        <span>Less</span>
        <span v-for="level in 4" :key="level" :class="`cell l${level - 1}`" />
        <span>More</span>
      </div>
    </div>
    <div class="overflow-x-auto pb-1.5" role="img" :aria-label="label">
      <div class="flex w-max gap-2" :style="{ '--cell': `${cellSize}px` }">
        <div class="weekdays" aria-hidden="true">
          <span v-for="(weekday, index) in WEEKDAYS" :key="index">
            {{ weekday }}
          </span>
        </div>
        <div aria-hidden="true">
          <div class="months" :style="{ width: `${width}px` }">
            <span
              v-for="month in months"
              :key="month.label"
              :style="{ left: `${month.left}px` }"
            >
              {{ month.label }}
            </span>
          </div>
          <div class="grid-cells" :style="{ width: `${width}px` }">
            <span v-for="cell in cells" :key="cell.key" :class="cell.class" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

const props = withDefaults(
  defineProps<{
    year: number
    // Reading days of the year with the pages logged that day
    days: Map<string, number>
    title: string
    label: string
    today?: string
    cellSize?: number
  }>(),
  { today: () => todaySimpleDate(), cellSize: 12 },
)

const GAP = 3
const WEEKDAYS = ['Mon', '', 'Wed', '', 'Fri', '', '']

const start = computed(() => dayjs.utc(`${props.year}-01-01`))
const length = computed(() =>
  start.value.add(1, 'year').diff(start.value, 'day'),
)
// Monday-first offset of January 1st
const offset = computed(() => (start.value.day() + 6) % 7)
const weeks = computed(() => Math.ceil((offset.value + length.value) / 7))
const width = computed(() => weeks.value * (props.cellSize + GAP) - GAP)

const maxPages = computed(() => Math.max(0, ...props.days.values()))

const cells = computed(() => {
  const blanks = Array.from({ length: offset.value }, (_, index) => ({
    key: `blank-${index}`,
    class: 'cell blank',
  }))
  const days = Array.from({ length: length.value }, (_, index) => {
    const day = start.value.add(index, 'day').format('YYYY-MM-DD')
    const pages = props.days.get(day)
    const level = pages === undefined ? 0 : getDayLevel(pages, maxPages.value)
    return {
      key: day,
      class: day > props.today ? 'cell future' : `cell l${level}`,
    }
  })
  return [...blanks, ...days]
})

const months = computed(() =>
  MONTH_NAMES.map((name, month) => {
    const first = start.value.month(month).date(1)
    const week = Math.floor((offset.value + first.diff(start.value, 'day')) / 7)
    return { label: name.slice(0, 3), left: week * (props.cellSize + GAP) }
  }),
)
</script>

<style scoped>
@reference '../assets/css/main.css';

.legend {
  @apply text-ink-muted flex items-center gap-1.5 text-xs font-semibold;
}
.legend .cell {
  @apply size-3;
}
.weekdays {
  @apply text-ink-muted flex w-[30px] flex-col gap-[3px] pt-5 text-xs font-semibold;
}
.weekdays span {
  height: var(--cell);
  line-height: var(--cell);
}
.months {
  @apply text-ink-muted relative h-5 text-xs font-semibold;
}
.months span {
  @apply absolute top-0;
}
.grid-cells {
  @apply grid grid-flow-col gap-[3px];
  grid-template-rows: repeat(7, var(--cell));
  grid-auto-columns: var(--cell);
}
.grid-cells .cell {
  width: var(--cell);
  height: var(--cell);
}
.cell {
  @apply block rounded-[4px];
}
.cell.blank {
  @apply bg-transparent;
}
.cell.future {
  @apply border-stroke-subtle border border-dashed;
}
.l0 {
  @apply bg-surface-container;
}
.l1 {
  @apply bg-primary-200;
}
.l2 {
  background: color-mix(in srgb, var(--primary) 55%, var(--surface-elevated));
}
.l3 {
  @apply bg-primary;
}
</style>

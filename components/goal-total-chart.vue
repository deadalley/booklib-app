<template>
  <div class="flex flex-col gap-4">
    <svg
      class="chart"
      :viewBox="`0 0 ${W} ${H}`"
      role="img"
      aria-label="Cumulative progress against target"
    >
      <line
        v-for="fraction in [0, 0.25, 0.5, 0.75, 1]"
        :key="fraction"
        :x1="PAD.l"
        :x2="W - PAD.r"
        :y1="y(goal.amount * fraction)"
        :y2="y(goal.amount * fraction)"
        :class="fraction === 1 ? 'line-target' : 'line-grid'"
      />
      <text
        v-for="fraction in [0, 0.5, 1]"
        :key="`label-${fraction}`"
        :x="PAD.l - 8"
        :y="y(goal.amount * fraction) + 4"
        text-anchor="end"
        class="axis"
      >
        {{ Math.round(goal.amount * fraction) }}
      </text>
      <text
        v-for="tick in ticks"
        :key="tick.x"
        :x="tick.x"
        :y="H - 8"
        text-anchor="middle"
        class="axis"
      >
        {{ tick.label }}
      </text>

      <line
        :x1="x(start)"
        :y1="y(0)"
        :x2="x(end)"
        :y2="y(goal.amount)"
        class="line-pace"
      />
      <line
        v-if="projection !== null"
        :x1="x(today)"
        :y1="y(progress)"
        :x2="x(end)"
        :y2="y(projection)"
        class="line-projection"
      />
      <path :d="area" class="area" />
      <path :d="line" class="line-actual" />

      <template v-if="today >= start && today <= end">
        <line
          :x1="x(today)"
          :x2="x(today)"
          :y1="PAD.t"
          :y2="H - PAD.b"
          class="line-today"
        />
        <text
          :x="x(today)"
          :y="PAD.t - 4"
          text-anchor="middle"
          class="axis axis-today"
        >
          Today
        </text>
      </template>
      <circle
        :cx="x(Math.min(today, end))"
        :cy="y(progress)"
        r="4.5"
        class="dot"
      />
    </svg>

    <ul class="goal-legend">
      <li>
        <i class="key key-actual" />
        Logged
      </li>
      <li>
        <i class="key key-pace" />
        Even pace
      </li>
      <li v-if="info.status === 'tracking'">
        <i class="key key-projection" />
        Projected
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import type { Goal } from '~/types/goal'
import type { GoalInfo } from '~/utils/goal'

const props = defineProps<{ goal: Goal; info: GoalInfo }>()

const W = 640
const H = 220
const PAD = { l: 36, r: 12, t: 16, b: 28 }
const DAY = 86_400_000

const toTime = (date: string) => dayjs.utc(toSimpleDate(date)).valueOf()

const start = computed(() => toTime(props.goal.startAt))
const end = computed(() => toTime(props.goal.finishAt) + DAY - 1)
const today = Date.now()
const span = computed(() => Math.max(1, end.value - start.value))

const maxY = computed(
  () => Math.max(props.goal.amount, props.info.progress) * 1.1 || 1,
)

function x(time: number) {
  const fraction = Math.max(0, Math.min(1, (time - start.value) / span.value))
  return PAD.l + fraction * (W - PAD.l - PAD.r)
}

function y(value: number) {
  return H - PAD.b - (value / maxY.value) * (H - PAD.t - PAD.b)
}

const progress = computed(() => props.info.progress)

const points = computed(() => {
  let accumulated = 0
  const result: [number, number][] = [[x(start.value), y(0)]]

  ;[...props.goal.entries]
    .sort((a, b) => toTime(a.createdAt) - toTime(b.createdAt))
    .forEach((entry) => {
      const entryX = x(toTime(entry.createdAt))
      result.push([entryX, y(accumulated)])
      accumulated += getGoalEntryValue(props.goal, entry)
      result.push([entryX, y(accumulated)])
    })

  result.push([x(Math.min(today, end.value)), y(accumulated)])
  return result
})

const line = computed(() =>
  points.value
    .map(
      ([px, py], index) =>
        `${index ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`,
    )
    .join(' '),
)

const area = computed(
  () =>
    `${line.value} L${x(Math.min(today, end.value)).toFixed(1)} ${y(0)} L${x(start.value)} ${y(0)}Z`,
)

const projection = computed(() =>
  props.info.timeFrac > 0 && today < end.value
    ? Math.min(maxY.value, progress.value / props.info.timeFrac)
    : null,
)

const ticks = computed(() => {
  const result: { x: number; label: string }[] = []
  const step = span.value > 200 * DAY ? 2 : 1
  let tick = dayjs.utc(start.value).startOf('month')

  while (tick.valueOf() <= end.value) {
    if (tick.valueOf() >= start.value) {
      result.push({ x: x(tick.valueOf()), label: tick.format('MMM') })
    }
    tick = tick.add(step, 'month')
  }
  return result
})
</script>

<style scoped>
@reference '../assets/css/main.css';

.chart {
  @apply h-auto max-h-64 w-full overflow-visible;
}
.line-grid {
  @apply stroke-stroke-subtle;
}
.line-target {
  @apply stroke-stroke-strong;
  stroke-dasharray: 2 3;
}
.line-pace {
  @apply stroke-ink-subtle;
  stroke-width: 1.5;
  stroke-dasharray: 5 4;
}
.line-projection {
  @apply stroke-primary-300;
  stroke-width: 2;
  stroke-dasharray: 3 4;
}
.line-actual {
  @apply stroke-primary fill-none;
  stroke-width: 2.5;
  stroke-linejoin: round;
}
.area {
  @apply fill-primary/10;
}
.line-today {
  @apply stroke-ink-muted;
}
.dot {
  @apply fill-surface-elevated stroke-primary;
  stroke-width: 2.5;
}
.axis {
  @apply fill-ink-muted text-[11px] font-semibold;
}
.axis-today {
  @apply fill-ink-secondary;
}
.key {
  @apply border-primary inline-block h-0 w-5 border-t-[2.5px];
}
.key-pace {
  @apply border-ink-subtle border-t-2 border-dashed;
}
.key-projection {
  @apply border-primary-300 border-t-2 border-dotted;
}
</style>

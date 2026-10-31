<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1.5" :style="{ '--n': periods.length }">
      <div class="plot">
        <span
          class="target"
          :style="{ bottom: `${(goal.amount / max) * 100}%` }"
        >
          <em>{{ goal.amount }} {{ getGoalUnit(goal, goal.amount) }}</em>
        </span>
        <span
          v-for="period in periods"
          :key="period.start"
          class="bar"
          :class="{
            future: period.start > today,
            met: period.start <= today && period.value >= goal.amount,
            current: period === info.current,
          }"
          :style="{
            height:
              period.start > today
                ? '3px'
                : `${Math.max(3, (period.value / max) * 100)}%`,
          }"
          :title="`${periodLabel(period)}: ${formatGoalNumber(period.value)} ${getGoalUnit(goal, period.value)}`"
          role="img"
          :aria-label="`${periodLabel(period)}: ${formatGoalNumber(period.value)} ${getGoalUnit(goal, period.value)}`"
        />
      </div>
      <div class="axis">
        <span v-for="(period, index) in periods" :key="period.start">
          {{ index % every === 0 ? tickLabel(period) : '' }}
        </span>
      </div>
    </div>
    <ul class="goal-legend">
      <li>
        <i class="key bg-primary" />
        On target
      </li>
      <li>
        <i class="key bg-primary-200" />
        Under target
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import type { Goal, GoalPeriod } from '~/types/goal'
import type { GoalInfo } from '~/utils/goal'

const props = defineProps<{ goal: Goal; info: GoalInfo }>()

const today = todaySimpleDate()

const periods = computed(() => props.info.periods)
const unit = computed(() => getGoalPeriodUnit(props.goal))

const max = computed(() =>
  Math.max(
    props.goal.amount * 1.25,
    ...periods.value.map(({ value }) => value),
    1,
  ),
)

const every = computed(() =>
  periods.value.length > 16 ? Math.ceil(periods.value.length / 10) : 1,
)

function tickLabel(period: GoalPeriod) {
  const start = dayjs.utc(period.start)
  switch (unit.value) {
    case 'week':
      return start.format('MMM D')
    case 'month':
      return start.format('MMM')
    case 'year':
      return start.format('YYYY')
    default:
      return start.format('D')
  }
}

function periodLabel(period: GoalPeriod) {
  return period.start === period.end
    ? formatGoalDate(period.start)
    : `${formatGoalDate(period.start, false)} – ${formatGoalDate(period.end)}`
}
</script>

<style scoped>
@reference '../assets/css/main.css';

.plot {
  @apply border-stroke relative grid h-48 items-end gap-[3px] border-b;
  grid-template-columns: repeat(var(--n), minmax(0, 1fr));
}
.bar {
  @apply bg-primary-200 block rounded-t-[3px];
}
.bar.met {
  @apply bg-primary;
}
.bar.future {
  @apply bg-surface-container;
}
.bar.current {
  @apply outline-ink-primary outline-2 outline-offset-1;
}
.target {
  @apply border-ink-secondary pointer-events-none absolute inset-x-0 z-10 border-t-[1.5px] border-dashed;
}
.target em {
  @apply text-ink-secondary bg-surface-elevated absolute right-0 bottom-0.5 px-1 text-[11px] font-bold not-italic;
}
.axis {
  @apply grid gap-[3px];
  grid-template-columns: repeat(var(--n), minmax(0, 1fr));
}
.axis span {
  @apply text-ink-muted overflow-visible text-center text-[11px] font-semibold whitespace-nowrap;
}
.key {
  @apply inline-block size-3 rounded-[3px];
}
</style>

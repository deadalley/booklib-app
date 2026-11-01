<template>
  <div class="strip" :class="{ dense: !wide }">
    <div
      v-for="(week, index) in weeks"
      :key="index"
      class="week"
      :style="{ flexGrow: week.days.length }"
    >
      <div class="week-days">
        <button
          v-for="period in week.days"
          :key="period.start"
          type="button"
          class="day"
          :class="[tone(period), { current: period === info.current }]"
          :disabled="period.start > today"
          :title="`${formatGoalDate(period.start)}: ${formatGoalNumber(period.value)} ${unit(period.value)}`"
          :aria-label="`${formatGoalDate(period.start)}, ${formatGoalNumber(period.value)} ${unit(period.value)}. Edit entries`"
          @click="$emit('day', period.start)"
        >
          <template v-if="wide">
            <em>{{ weekday(period.start) }}</em>
            <b>{{ Number(period.start.slice(8)) }}</b>
          </template>
        </button>
      </div>
      <p v-if="wide" class="week-summary">
        <span>{{ week.label }}</span>
        <span>
          {{ formatGoalNumber(week.total) }} {{ unit(week.total) }} ·
          {{ week.met }}/{{ week.days.length }}
        </span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import type { Goal, GoalPeriod } from '~/types/goal'
import type { GoalInfo } from '~/utils/goal'

const props = defineProps<{ goal: Goal; info: GoalInfo }>()

defineEmits<{ (e: 'day', day: string): void }>()

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const today = todaySimpleDate()

const wide = computed(() => props.info.periods.length <= 62)

function unit(value: number) {
  return getGoalUnit(props.goal, value)
}

function weekday(key: string) {
  return WEEKDAYS[dayjs.utc(key).day()]
}

function tone(period: GoalPeriod) {
  if (period.start > today) return 'future'
  const ratio = period.value / props.goal.amount
  if (ratio >= 1) return 'level-4'
  if (ratio >= 2 / 3) return 'level-3'
  if (ratio >= 1 / 3) return 'level-2'
  if (ratio > 0) return 'level-1'
  return 'level-0'
}

const weeks = computed(() => {
  const result: {
    days: GoalPeriod[]
    label: string
    total: number
    met: number
  }[] = []

  props.info.periods.forEach((period) => {
    const isMonday = dayjs.utc(period.start).day() === 1
    if (!result.length || isMonday) {
      result.push({ days: [], label: '', total: 0, met: 0 })
    }
    result[result.length - 1]!.days.push(period)
  })

  result.forEach((week) => {
    const first = week.days[0]!
    const last = week.days[week.days.length - 1]!
    week.label =
      week.days.length > 1
        ? `${formatGoalDate(first.start, false)} – ${Number(last.start.slice(8))}`
        : formatGoalDate(first.start, false)
    const past = week.days.filter((period) => period.start <= today)
    week.total = past.reduce((total, period) => total + period.value, 0)
    week.met = past.filter((period) => period.value >= props.goal.amount).length
  })

  return result
})
</script>

<style scoped>
@reference '../assets/css/main.css';

.strip {
  @apply flex w-full gap-2.5;
  container-type: inline-size;
}
.strip.dense {
  @apply flex-wrap gap-2;
}
.week {
  @apply flex min-w-0 basis-0 flex-col gap-2;
}
.week-days {
  @apply flex gap-1;
}
.day {
  @apply text-ink-secondary flex h-14 min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 overflow-hidden rounded-md p-0 transition;
}
.day:not(:disabled):hover {
  @apply ring-primary-300 -translate-y-0.5 ring-2;
}
.day:disabled {
  @apply cursor-default;
}
.strip.dense .day {
  @apply h-5 flex-none basis-5;
}
.day em {
  @apply text-[10px] font-bold tracking-[0.06em] not-italic opacity-75;
}
.day b {
  @apply text-sm font-bold;
}
.day.future {
  @apply border-stroke text-ink-subtle border border-dashed;
}
.day.level-0 {
  @apply bg-surface-container text-ink-muted;
}
.day.level-1 {
  @apply bg-primary-100;
}
.day.level-2 {
  @apply bg-primary-200;
}
.day.level-3 {
  @apply bg-primary-300 text-ink-primary;
}
.day.level-4 {
  @apply bg-primary text-ink-inverse;
}
.day.current {
  @apply outline-ink-primary outline-2 outline-offset-1;
}
.week-summary {
  @apply text-ink-muted flex justify-between gap-2 overflow-hidden px-0.5 text-xs font-semibold whitespace-nowrap;
}
.week-summary span {
  @apply truncate;
}
.week-summary span:last-child {
  @apply text-ink-secondary;
}

@container (max-width: 760px) {
  .day em {
    display: none;
  }
  .day {
    @apply h-11;
  }
  .week-days {
    gap: 3px;
  }
  .strip {
    @apply gap-1.5;
  }
  .week-summary {
    @apply flex-col gap-0;
  }
}

@container (max-width: 520px) {
  .day b {
    @apply text-[0.6875rem];
  }
  .day {
    @apply h-9 rounded;
  }
  .week-summary span:first-child {
    display: none;
  }
}
</style>

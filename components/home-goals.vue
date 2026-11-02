<template>
  <bl-home-card
    title="Goals"
    :count="goals.length || null"
    to="/tracking"
    link-label="Tracking"
  >
    <ul v-if="rows.length" class="flex flex-col">
      <li v-for="row in rows" :key="row.goal.id" class="row">
        <NuxtLink :to="`/tracking#goal-${row.goal.id}`" class="row-link">
          <span class="flex justify-between gap-3">
            <span class="title">{{ row.goal.title }}</span>
            <b class="text-primary flex-none font-bold">{{ row.info.pct }}%</b>
          </span>
          <span class="bar">
            <span class="bar-fill" :style="{ width: `${row.info.pct}%` }" />
            <span
              v-if="row.showPace"
              class="bar-pace"
              :style="{ left: `${row.info.timeFrac * 100}%` }"
            />
          </span>
          <span class="sub" :class="{ 'text-secondary-600!': row.behind }">
            {{ row.sub }}
          </span>
        </NuxtLink>
      </li>
    </ul>
    <div v-else class="flex flex-col items-start gap-3 py-2">
      <p class="sub">No active goals.</p>
      <bl-button to="/tracking/new" variant="secondary" size="sm">
        <template #prependIcon="iconProps">
          <IconPlus v-bind="iconProps" />
        </template>
        Set a goal
      </bl-button>
    </div>
  </bl-home-card>
</template>

<script setup lang="ts">
import { IconPlus } from '@tabler/icons-vue'
import type { Goal } from '~/types/goal'
import {
  formatGoalNumber,
  getGoalInfo,
  getGoalPeriodUnit,
  getGoalUnit,
  type GoalInfo,
} from '~/utils/goal'

/** Active goals, already resolved and sorted by finish date. */
const props = defineProps<{ goals: Goal[] }>()

function paceText(offset: number) {
  if (offset > 0) return `${offset} ahead of pace`
  if (offset < 0) return `${Math.abs(offset)} behind pace`
  return 'On pace'
}

const PERIOD_COPY = {
  day: { now: 'today', streak: 'day' },
  week: { now: 'this week', streak: 'week' },
  month: { now: 'this month', streak: 'month' },
  year: { now: 'this year', streak: 'year' },
} as const

function periodicText(goal: Goal, info: GoalInfo) {
  const copy = PERIOD_COPY[getGoalPeriodUnit(goal) ?? 'day']
  const parts: string[] = []
  if (info.current) {
    const left = goal.amount - info.current.value
    parts.push(
      left <= 0
        ? `Done for ${copy.now}`
        : `${formatGoalNumber(left)} ${getGoalUnit(goal, left)} to go ${copy.now}`,
    )
  }
  if (info.streak > 1) parts.push(`${info.streak}-${copy.streak} streak`)
  return parts.join(' · ')
}

const rows = computed(() =>
  props.goals.slice(0, 3).map((goal) => {
    const info = getGoalInfo(goal)
    const total = goal.interval === 'total'
    return {
      goal,
      info,
      showPace: total && info.timeFrac < 1,
      behind: total && info.paceOffset < 0,
      sub: total
        ? `${paceText(info.paceOffset)} · ${info.daysLeft} days left`
        : periodicText(goal, info),
    }
  }),
)
</script>

<style scoped>
@reference '../assets/css/main.css';

.row + .row {
  @apply border-stroke-subtle border-t;
}
.row-link {
  @apply flex w-full flex-col gap-2 py-3;
}
.title {
  @apply text-ink-primary min-w-0 flex-1 truncate font-semibold;
}
.row-link:hover .title {
  @apply text-primary;
}
.bar {
  @apply bg-surface-container relative h-2.5 rounded-full;
}
.bar-fill {
  @apply bg-primary absolute inset-y-0 left-0 rounded-[inherit];
}
.bar-pace {
  @apply bg-ink-primary absolute -top-1 -bottom-1 -ml-px w-0.5 rounded-[1px];
}
.sub {
  @apply text-ink-muted text-[0.8125rem] font-medium;
}
</style>

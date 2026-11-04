<template>
  <section
    class="overview"
    aria-label="Goals overview"
    data-testid="goals-overview"
  >
    <div class="section">
      <p class="label">Overall progress</p>
      <template v-if="overview.active.length">
        <div
          class="flex flex-wrap items-center justify-between gap-x-3 gap-y-2"
        >
          <p class="big">
            <b>{{ overview.average }}</b>
            <span>%</span>
          </p>
          <span class="pill" :class="overview.behind ? 'warn' : 'ok'">
            <component
              :is="overview.behind ? IconAlertTriangle : IconCheck"
              :size="14"
              stroke="2.2"
            />
            {{
              overview.behind
                ? `${overview.behind} of ${overview.active.length} behind`
                : 'All on track'
            }}
          </span>
        </div>
        <div class="bar" aria-hidden="true">
          <span :style="{ width: `${overview.average}%` }" />
        </div>
        <p class="note">
          Average across {{ overview.active.length }} active
          {{ overview.active.length === 1 ? 'goal' : 'goals' }}
        </p>
      </template>
      <template v-else>
        <p class="big muted"><b>—</b></p>
        <p class="note">No active goals right now.</p>
      </template>
    </div>

    <div class="section">
      <p class="label">Goals</p>
      <ul class="counts">
        <li v-for="count in counts" :key="count.label" :class="count.key">
          <span class="count">{{ count.value }}</span>
          <span class="count-label">
            <component :is="count.icon" :size="14" stroke="2" />
            {{ count.label }}
          </span>
        </li>
      </ul>
      <p v-if="overview.paused" class="note">+ {{ overview.paused }} paused</p>
    </div>

    <div class="section">
      <p class="label">Next deadline</p>
      <template v-if="next">
        <button type="button" class="next" @click="$emit('jump', next.goal.id)">
          <span class="time">
            <b>{{ timeLeft!.value }}</b>
            <small>{{ timeLeft!.unit }}</small>
          </span>
          <span class="next-title">{{ next.goal.title }}</span>
          <span class="next-detail">
            Ends {{ formatGoalDate(next.goal.finishAt) }} · {{ nextProgress }}
          </span>
          <span class="mini-bar" aria-hidden="true">
            <span :style="{ width: `${next.info.pct}%` }" />
          </span>
        </button>
        <span class="pill" :class="next.onTrack ? 'ok' : 'warn'">
          <component
            :is="next.onTrack ? IconCheck : IconAlertTriangle"
            :size="14"
            stroke="2.2"
          />
          {{ next.onTrack ? 'On track' : 'Behind pace' }}
        </span>
      </template>
      <p v-else class="note flex flex-1 items-center gap-2 leading-snug">
        <IconCalendar :size="18" stroke="1.6" class="flex-none" />
        Nothing due. Start a goal to see your next deadline here.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  IconAlertTriangle,
  IconCalendar,
  IconCheck,
  IconHourglass,
  IconTarget,
  IconTrophy,
} from '@tabler/icons-vue'
import type { Goal } from '~/types/goal'

const props = defineProps<{ goals: Goal[] }>()
defineEmits<{ (e: 'jump', id: string): void }>()

const overview = computed(() => getGoalsOverview(props.goals))
const next = computed(() => overview.value.next)
const timeLeft = computed(() => next.value && getGoalTimeLeft(next.value.info))

const counts = computed(() => [
  {
    key: 'active',
    label: 'Active',
    value: overview.value.active.length,
    icon: IconTarget,
  },
  {
    key: 'completed',
    label: 'Completed',
    value: overview.value.completed,
    icon: IconTrophy,
  },
  {
    key: 'expired',
    label: 'Expired',
    value: overview.value.expired,
    icon: IconHourglass,
  },
])

const nextProgress = computed(() => {
  if (!next.value) return ''
  const { goal, info } = next.value
  if (goal.interval === 'total') {
    return `${formatGoalNumber(info.progress)} / ${goal.amount} ${getGoalUnit(goal, goal.amount)}`
  }
  const unit = getGoalPeriodUnit(goal)
  const current = unit === 'day' ? 'today' : `this ${unit}`
  return `${formatGoalNumber(info.current?.value ?? 0)} / ${goal.amount} ${current}`
})
</script>

<style scoped>
@reference '../assets/css/main.css';

.overview {
  @apply bg-surface-elevated border-stroke-subtle grid grid-cols-1 rounded-xl border shadow-sm;
}
.section {
  @apply flex min-w-0 flex-col gap-2.5 px-6 py-5;
}
.section + .section {
  @apply border-stroke-subtle border-t;
}
@container (min-width: 900px) {
  .overview {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.3fr);
  }
  .section + .section {
    @apply border-t-0 border-l;
  }
}
.label {
  @apply text-primary text-[0.8125rem] font-bold tracking-[0.12em] uppercase;
}
.big {
  @apply font-display text-ink-primary flex items-baseline gap-0.5 leading-none;
}
.big b {
  @apply text-[2.75rem] font-semibold;
}
.big span {
  @apply text-ink-secondary text-xl font-semibold;
}
.big.muted b {
  @apply text-ink-subtle;
}
.note {
  @apply text-ink-muted text-[0.8125rem] font-semibold;
}
.pill {
  @apply inline-flex w-fit items-center gap-1.5 rounded-full border border-transparent px-2.5 py-0.75 text-xs font-bold whitespace-nowrap;
}
.pill.ok {
  @apply bg-surface-container text-ink-secondary;
}
.pill.ok svg {
  @apply text-primary;
}
.pill.warn {
  @apply bg-secondary-50 text-secondary-800 border-secondary-200;
}
.bar {
  @apply bg-surface-container h-2.5 overflow-hidden rounded-full;
}
.bar span,
.mini-bar span {
  @apply bg-primary block h-full rounded-[inherit] transition-[width] duration-300;
}
.counts {
  @apply m-0 grid list-none grid-cols-3 gap-2 p-0;
}
.counts li {
  @apply flex min-w-0 flex-col gap-1;
}
.count {
  @apply font-display text-ink-primary text-[2.25rem] leading-none font-semibold;
}
.count-label {
  @apply text-ink-secondary inline-flex items-center gap-1 text-[0.8125rem] font-semibold whitespace-nowrap;
}
.counts .active svg {
  @apply text-primary;
}
.counts .completed svg {
  @apply text-secondary-700;
}
.counts .expired svg,
.counts .expired .count {
  @apply text-ink-muted;
}
.next {
  @apply grid cursor-pointer grid-cols-[auto_minmax(0,1fr)] grid-rows-[auto_auto_auto] items-center gap-x-4 gap-y-1 p-0 text-left;
}
.time {
  @apply bg-primary-50 text-primary row-span-3 flex size-18 flex-col items-center justify-center rounded-xl text-center;
}
.time b {
  @apply font-display text-[1.75rem] leading-none font-semibold;
}
.time small {
  @apply mt-0.5 text-[0.5625rem] font-bold tracking-[0.08em] uppercase;
}
.next-title {
  @apply text-ink-primary truncate font-bold;
}
.next:hover .next-title {
  @apply text-primary;
}
.next-detail {
  @apply text-ink-muted truncate text-[0.8125rem] font-semibold;
}
.mini-bar {
  @apply bg-surface-container mt-1 block h-1.5 overflow-hidden rounded-full;
}
</style>

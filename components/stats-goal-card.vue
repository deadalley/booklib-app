<template>
  <section v-if="!goal" class="card goal">
    <span class="icon-well">
      <IconTarget :size="22" stroke="1.6" />
    </span>
    <div class="flex min-w-0 flex-1 flex-col items-start gap-1.5">
      <h5 class="stats-title">No active reading goal</h5>
      <p class="stats-sub">Set a target and track your pace here.</p>
      <bl-button to="/tracking/new" size="sm">
        <template #prependIcon="iconProps">
          <IconPlus v-bind="iconProps" />
        </template>
        Set a goal
      </bl-button>
    </div>
  </section>

  <section v-else class="card goal">
    <svg viewBox="0 0 120 120" class="w-34 flex-none" aria-hidden="true">
      <circle cx="60" cy="60" :r="R" class="ring-track" />
      <circle
        cx="60"
        cy="60"
        :r="R"
        class="ring-value"
        :stroke-dasharray="`${(CIRCUMFERENCE * info!.pct) / 100} ${CIRCUMFERENCE}`"
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="58" text-anchor="middle" class="ring-number">
        {{ formatGoalNumber(info!.progress) }}
      </text>
      <text x="60" y="76" text-anchor="middle" class="ring-of">
        of {{ goal.amount }}
      </text>
    </svg>
    <div class="flex min-w-0 flex-1 flex-col gap-1.5">
      <h5 class="stats-title">{{ goal.title }}</h5>
      <p class="text-ink-secondary text-[1.0625rem]">
        <b class="font-display text-primary text-2xl font-semibold">
          {{ info!.pct }}%
        </b>
        · {{ pace }}
      </p>
      <p class="stats-sub">{{ summary }}</p>
      <bl-button
        :to="`/tracking#goal-${goal.id}`"
        class="mt-1 self-end"
        variant="tertiary"
      >
        <template #prependIcon="iconProps">
          <IconCircleArrowRight v-bind="iconProps" />
        </template>
        Open in Tracking
      </bl-button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { IconCircleArrowRight, IconPlus, IconTarget } from '@tabler/icons-vue'
import type { Goal } from '~/types/goal'

const props = defineProps<{ goal: Goal | null }>()

const R = 52
const CIRCUMFERENCE = 2 * Math.PI * R

const info = computed(() => (props.goal ? getGoalInfo(props.goal) : null))

const pace = computed(() => {
  if (!info.value) return ''
  if (info.value.status === 'completed') return 'Goal reached'
  const offset = info.value.paceOffset
  if (offset > 0) return `${offset} ahead of pace`
  if (offset < 0) return `${Math.abs(offset)} behind pace`
  return 'Right on pace'
})

const summary = computed(() => {
  if (!props.goal || !info.value) return ''
  const left = Math.max(0, props.goal.amount - info.value.progress)
  if (!left) return `Ends ${formatGoalDate(props.goal.finishAt)}`
  const monthsLeft = Math.max(1, Math.ceil(info.value.daysLeft / 30.4))
  return `${formatGoalNumber(left)} to go · about ${Math.ceil(left / monthsLeft)} a month · ${info.value.daysLeft} days left`
})
</script>

<style scoped>
@reference '../assets/css/main.css';

.goal {
  @apply flex-row items-center gap-6;
}
.icon-well {
  @apply bg-primary-50 text-primary rounded-scholarly grid size-9 flex-none place-items-center;
}
.ring-track {
  @apply stroke-surface-container fill-none;
  stroke-width: 12;
}
.ring-value {
  @apply stroke-primary fill-none;
  stroke-width: 12;
  stroke-linecap: round;
  transition: stroke-dasharray 0.4s;
}
.ring-number {
  @apply font-display fill-ink-primary text-[30px] font-semibold;
}
.ring-of {
  @apply fill-ink-muted text-[11px] font-semibold;
}
</style>

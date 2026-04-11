<template>
  <NuxtLink :to="href" class="goal-link-tile">
    <div class="goal-link-tile-accent" :class="accentClass">
      <component
        :is="icons[GOAL_TYPE_MAP[goal.type].icon]"
        :size="ICON_SIZE_LARGE"
        stroke="1.5"
      />
      <div class="goal-link-tile-accent-copy">
        <p class="goal-link-tile-accent-label">Target</p>
        <p class="goal-link-tile-accent-value">
          <span :class="amountClass">{{ props.goal.amount }}</span>
          {{ getGoalUnit(props.goal, props.goal.amount) }}
          {{ GOAL_INTERVAL_MAP[props.goal.interval].description }}
        </p>
      </div>
    </div>

    <div class="goal-link-tile-content">
      <div class="goal-link-tile-header">
        <div class="flex min-w-0 flex-col gap-1">
          <h6 class="goal-link-tile-title" :class="titleClass">
            {{ goal.title }}
          </h6>
          <p class="goal-link-tile-kicker">{{ windowSummary }}</p>
        </div>

        <span class="goal-link-tile-status" :class="statusClass">
          {{ statusLabel }}
        </span>
      </div>

      <div class="goal-link-tile-progress-row">
        <p class="goal-link-tile-progress-copy">{{ progressSummary }}</p>
        <p class="goal-link-tile-progress-value" :class="percentageClass">
          {{ progressPercentage }}%
        </p>
      </div>

      <bl-progress-bar
        :progress-value="progressPercentage"
        size="sm"
        :color="progressBarColor"
      />

      <div class="goal-link-tile-meta-grid">
        <div class="goal-link-tile-meta-item">
          <p class="goal-link-tile-meta-label">Author</p>
          <p class="goal-link-tile-meta-value">{{ authorSummary }}</p>
        </div>
        <div class="goal-link-tile-meta-item">
          <p class="goal-link-tile-meta-label">Genres</p>
          <p class="goal-link-tile-meta-value">{{ genresSummary }}</p>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { icons } from '@tabler/icons-vue'
import {
  GOAL_INTERVAL_MAP,
  GOAL_TYPE_MAP,
  ICON_SIZE_LARGE,
} from '~/utils/constants'
import { toMonthYearCompact } from '~/utils/date'
import {
  getGoalProgress,
  getGoalProgressColor,
  getGoalProgressPercentage,
  getGoalStatus,
  getGoalStatusLabel,
  getGoalUnit,
} from '~/utils/goal'
import type { Goal } from '~/types/goal'
import type { Author } from '~/types/author'
import { indexBy } from 'ramda'

const props = defineProps<{
  goal: Goal
  authors: Author[]
}>()

const href = computed(() => `/tracking#goal-${props.goal.id}`)

const authorsById = computed(() =>
  props.authors ? indexBy(({ id }) => String(id), props.authors) : {},
)

const progress = computed(() => getGoalProgress(props.goal))

const progressPercentage = computed(() => {
  if (!props.goal.amount) return 0

  return Math.max(0, Math.min(100, getGoalProgressPercentage(props.goal)))
})

const progressSummary = computed(() => {
  const currentProgress = progress.value
  return `${currentProgress} logged of ${props.goal.amount} ${getGoalUnit(props.goal, props.goal.amount)}`
})

const windowSummary = computed(
  () =>
    `${toMonthYearCompact(props.goal.startAt)} - ${toMonthYearCompact(props.goal.finishAt)}`,
)

const authorSummary = computed(() => {
  if (!props.goal.author) return 'Any author'
  const author = authorsById.value[props.goal.author]
  return author ? author.name : 'Any author'
})

const genresSummary = computed(() => {
  if (!props.goal.genres.length) return 'All genres'

  return props.goal.genres.join(', ')
})

const status = computed(() => getGoalStatus(props.goal))
const statusLabel = computed(() => getGoalStatusLabel(props.goal))

const statusClass = computed(() => {
  if (!props.goal.status) return 'goal-link-tile-status-expired'

  switch (status.value) {
    case 'tracking':
      return 'goal-link-tile-status-tracking'
    case 'not-tracking':
      return 'goal-link-tile-status-not-tracking'
    case 'completed':
      return 'goal-link-tile-status-completed'
    case 'expired':
      return 'goal-link-tile-status-expired'
    default:
      return 'goal-link-tile-status-expired'
  }
})

const accentClass = computed(() => {
  if (['completed', 'expired', 'not-tracking'].includes(status.value)) {
    return 'goal-link-tile-accent-muted'
  } else if (status.value === 'tracking') {
    return 'goal-link-tile-accent-tracking'
  }
  return 'goal-link-tile-accent-muted'
})

const amountClass = computed(() => {
  if (status.value === 'completed') {
    return 'text-ink-primary'
  } else if (status.value === 'expired') {
    return 'text-ink-primary'
  } else if (status.value === 'not-tracking') {
    return 'text-ink-primary'
  }
  return 'text-primary'
})

const titleClass = computed(() => {
  if (status.value === 'completed') {
    return 'text-ink-secondary'
  } else if (status.value === 'expired') {
    return 'text-ink-muted'
  } else if (status.value === 'not-tracking') {
    return 'text-ink-muted'
  }
  return 'text-ink-primary'
})

const percentageClass = computed(() => {
  if (status.value === 'completed') {
    return 'text-ink-secondary'
  } else if (status.value === 'expired') {
    return 'text-ink-muted'
  } else if (status.value === 'not-tracking') {
    return 'text-ink-muted'
  }
  return 'text-primary'
})

const progressBarColor = computed(() => getGoalProgressColor(props.goal, 'bg'))
</script>

<style scoped>
@reference '../assets/css/main.css';

.goal-link-tile {
  @apply bg-surface-elevated border-stroke-subtle rounded-scholarly flex min-h-40 flex-col overflow-hidden border shadow-sm transition-shadow duration-200 md:min-h-0 md:flex-row;
  @apply hover:border-primary hover:shadow-primary/50;
}

.goal-link-tile-accent {
  @apply flex min-w-0 items-center gap-4 px-5 py-4 md:w-52 md:flex-col md:items-start md:justify-between;
}

.goal-link-tile-accent-tracking {
  @apply bg-surface text-primary;
}

.goal-link-tile-accent-muted {
  @apply bg-surface text-ink-muted;
}

.goal-link-tile-accent-copy {
  @apply flex min-w-0 flex-col gap-1;
}

.goal-link-tile-accent-label {
  @apply text-ink-muted text-sm font-semibold tracking-widest uppercase;
}

.goal-link-tile-accent-value {
  @apply text-sm font-semibold;
}

.goal-link-tile-content {
  @apply flex min-w-0 flex-1 flex-col gap-4 p-5;
}

.goal-link-tile-header {
  @apply flex flex-col gap-3 md:flex-row md:items-start md:justify-between;
}

.goal-link-tile-kicker {
  @apply text-ink-muted text-sm font-semibold tracking-wider uppercase;
}

.goal-link-tile-title {
  @apply hover:text-primary cursor-pointer overflow-hidden pt-1 pb-0! text-xl leading-tight font-semibold;
  line-clamp: 2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.goal-link-tile-status {
  @apply inline-flex w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase;
}

.goal-link-tile-status-tracking {
  @apply bg-primary text-ink-inverse;
}

.goal-link-tile-status-not-tracking {
  @apply bg-ink-secondary/30 text-ink-inverse;
}

.goal-link-tile-status-completed {
  @apply bg-surface text-ink-secondary;
}

.goal-link-tile-status-expired {
  @apply bg-surface text-ink-secondary;
}

.goal-link-tile-progress-row {
  @apply flex items-end justify-between gap-3;
}

.goal-link-tile-progress-copy {
  @apply text-ink-secondary truncate text-sm font-medium;
}

.goal-link-tile-progress-value {
  @apply shrink-0 text-2xl leading-none font-semibold;
}

.goal-link-tile-meta-grid {
  @apply grid gap-4 border-t border-current/10 pt-4 md:grid-cols-2;
}

.goal-link-tile-meta-item {
  @apply min-w-0;
}

.goal-link-tile-meta-label {
  @apply text-ink-muted text-sm font-semibold tracking-widest uppercase;
}

.goal-link-tile-meta-value {
  @apply text-ink-primary truncate pt-1 text-sm font-semibold;
}
</style>

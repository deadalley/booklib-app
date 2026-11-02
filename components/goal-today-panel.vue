<template>
  <section class="card gap-3">
    <div>
      <p class="book-page-section-title">Today</p>
      <p
        class="text-ink-muted mt-1 text-[0.8125rem] font-medium whitespace-nowrap"
      >
        {{ todayLabel }}
      </p>
    </div>
    <ul class="flex flex-col">
      <li v-for="row in rows" :key="row.goal.id" class="row" :class="row.state">
        <span class="status-icon">
          <component
            :is="
              icons[
                row.state === 'done'
                  ? 'IconCheck'
                  : GOAL_TYPE_MAP[row.goal.type].icon
              ]
            "
            :size="16"
            stroke="2"
          />
        </span>
        <button type="button" class="title" @click="$emit('jump', row.goal.id)">
          {{ row.goal.title }}
          <span class="message">{{ row.message }}</span>
        </button>
        <span class="mini-bar" aria-hidden="true">
          <span :style="{ width: `${row.info.pct}%` }" />
        </span>
        <bl-button size="sm" class="log" @click="$emit('log', row.goal)">
          <template #prependIcon="iconProps">
            <IconPlus v-bind="iconProps" />
          </template>
          {{ row.goal.type === 'books' ? 'Log book' : `Log ${row.goal.type}` }}
        </bl-button>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { IconPlus, icons } from '@tabler/icons-vue'
import dayjs from 'dayjs'
import type { Goal } from '~/types/goal'

const props = defineProps<{ goals: Goal[] }>()

defineEmits<{
  (e: 'jump', goalId: string): void
  (e: 'log', goal: Goal): void
}>()

const DONE_LABEL = {
  day: 'today',
  week: 'this week',
  month: 'this month',
  year: 'this year',
}

const todayLabel = dayjs().format('dddd, MMMM D')

const rows = computed(() =>
  props.goals.map((goal) => {
    const info = getGoalInfo(goal)

    if (goal.interval === 'total') {
      const rate = getGoalRequiredRate(goal, info)
      const offset = info.paceOffset
      const pace =
        offset > 0
          ? `${offset} ahead`
          : offset < 0
            ? `${Math.abs(offset)} behind`
            : 'On pace'
      return {
        goal,
        info,
        state: offset < 0 ? 'behind' : 'todo',
        message: rate ? `${pace} · need ${rate.value} a ${rate.unit}` : pace,
      }
    }

    const unit = getGoalPeriodUnit(goal) ?? 'day'
    const value = info.current?.value ?? 0
    if (value >= goal.amount) {
      return {
        goal,
        info,
        state: 'done',
        message: `Done for ${DONE_LABEL[unit]}`,
      }
    }
    const left = goal.amount - value
    return {
      goal,
      info,
      state: 'todo',
      message: `${formatGoalNumber(left)} ${getGoalUnit(goal, left)} to go${
        info.streak > 1 ? ` · ${info.streak}-${unit} streak` : ''
      }`,
    }
  }),
)
</script>

<style scoped>
@reference '../assets/css/main.css';

.row {
  @apply grid grid-cols-[auto_minmax(0,1fr)_6rem_auto] items-center gap-3.5 py-2.5;
}
.row + .row {
  @apply border-stroke-subtle border-t;
}
.status-icon {
  @apply bg-primary-50 text-primary grid size-8 place-items-center rounded-full;
}
.row.done .status-icon {
  @apply bg-primary text-ink-inverse;
}
.row.behind .status-icon {
  @apply bg-secondary-50 text-secondary-600;
}
.title {
  @apply text-ink-primary hover:text-primary flex w-full min-w-0 cursor-pointer flex-col items-start gap-0.5 p-0 text-left font-semibold;
}
.message {
  @apply text-ink-muted max-w-full truncate text-[0.8125rem] font-semibold;
}
.row.behind .message {
  @apply text-secondary-600;
}
.mini-bar {
  @apply bg-surface-container h-1.5 overflow-hidden rounded-full;
}
.mini-bar span {
  @apply bg-primary block h-full rounded-[inherit];
}

@container (max-width: 640px) {
  .row {
    @apply grid-cols-[auto_minmax(0,1fr)];
  }
  .mini-bar {
    display: none;
  }
  .log {
    grid-column: 2;
  }
}
</style>

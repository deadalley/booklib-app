<template>
  <article
    :id="`goal-${goal.id}`"
    class="goal-card tile"
    :class="{ open, muted: info.status !== 'tracking' }"
  >
    <header class="flex flex-wrap items-start justify-between gap-4">
      <button
        type="button"
        class="toggle"
        :aria-expanded="open"
        @click="$emit('toggle')"
      >
        <span class="icon-well">
          <component :is="icons[typeIcon]" :size="22" stroke="1.6" />
        </span>
        <span class="flex min-w-0 flex-col gap-1.5">
          <span class="flex flex-wrap items-center gap-2.5">
            <h5 class="title">{{ goal.title }}</h5>
            <span class="goal-tag" :class="`goal-tag-${info.status}`">
              {{ GOAL_STATUS_LABELS[info.status] }}
            </span>
          </span>
          <span class="meta">
            <span v-for="item in meta" :key="item">{{ item }}</span>
          </span>
        </span>
      </button>

      <div class="flex flex-wrap items-center gap-1.5">
        <bl-button
          v-if="info.status !== 'expired'"
          size="sm"
          @click="$emit('log')"
        >
          <template #prependIcon="iconProps">
            <IconPlus v-bind="iconProps" />
          </template>
          {{ logLabel }}
        </bl-button>
        <bl-button
          v-if="!isDone"
          variant="secondary"
          size="sm"
          @click="togglePause"
        >
          <template #prependIcon="iconProps">
            <component
              :is="
                goal.status === 'tracking' ? IconPlayerPause : IconPlayerPlay
              "
              v-bind="iconProps"
            />
          </template>
          {{ goal.status === 'tracking' ? 'Pause' : 'Resume' }}
        </bl-button>
        <bl-button
          v-if="isDone"
          variant="secondary"
          size="sm"
          @click="$emit('repeat')"
        >
          <template #prependIcon="iconProps">
            <IconRepeat v-bind="iconProps" />
          </template>
          Repeat
        </bl-button>
        <bl-icon-button
          variant="secondary"
          aria-label="Edit goal"
          title="Edit goal"
          @click="$emit('edit')"
        >
          <template #default="iconProps">
            <IconEdit v-bind="iconProps" />
          </template>
        </bl-icon-button>
        <bl-icon-button
          variant="secondary"
          aria-label="Delete goal"
          title="Delete goal"
          @click="$emit('delete')"
        >
          <template #default="iconProps">
            <IconTrash v-bind="iconProps" />
          </template>
        </bl-icon-button>
        <button
          type="button"
          class="chevron"
          :aria-label="open ? 'Collapse goal' : 'Expand goal'"
          @click="$emit('toggle')"
        >
          <IconChevronDown :size="18" stroke="2" />
        </button>
      </div>
    </header>

    <div class="flex flex-col gap-2.5">
      <div class="flex items-baseline justify-between gap-4">
        <p class="headline">
          <b>{{ headline.value }}</b>
          <span>{{ headline.text }}</span>
        </p>
        <p class="percentage">{{ info.pct }}%</p>
      </div>
      <div class="bar">
        <span class="bar-fill" :style="{ width: `${info.pct}%` }" />
        <span
          v-if="showPace"
          class="bar-pace"
          :style="{ left: `${info.timeFrac * 100}%` }"
          title="Where you’d be on an even pace"
        />
      </div>
      <p class="text-ink-secondary text-sm font-medium">{{ note }}</p>
    </div>

    <div v-if="open" class="flex flex-col">
      <div class="tabs" role="tablist">
        <button
          v-for="item in TABS"
          :id="`goal-${goal.id}-tab-${item.value}`"
          :key="item.value"
          type="button"
          role="tab"
          class="tab"
          :class="{ selected: tab === item.value }"
          :aria-selected="tab === item.value"
          :aria-controls="`goal-${goal.id}-panel`"
          @click="tab = item.value"
        >
          <component :is="icons[item.icon]" :size="16" stroke="1.8" />
          {{ item.label }}
          <span v-if="item.value === 'entries'" class="badge">
            {{ goal.entries.length }}
          </span>
        </button>
      </div>
      <div
        :id="`goal-${goal.id}-panel`"
        class="flex flex-col gap-4 pt-5"
        role="tabpanel"
        :aria-labelledby="`goal-${goal.id}-tab-${tab}`"
      >
        <template v-if="tab === 'progress'">
          <bl-goal-total-chart
            v-if="goal.interval === 'total'"
            :goal="goal"
            :info="info"
          />
          <bl-goal-week-strip
            v-else-if="goal.interval === 'daily'"
            :goal="goal"
            :info="info"
            @day="(day) => $emit('day', day)"
          />
          <bl-goal-period-chart v-else :goal="goal" :info="info" />
        </template>
        <bl-goal-entries
          v-else
          :goal="goal"
          :books="books"
          @update="(updated) => $emit('update', updated)"
        />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import {
  IconChevronDown,
  IconEdit,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlus,
  IconRepeat,
  IconTrash,
  icons,
} from '@tabler/icons-vue'
import type { Author } from '~/types/author'
import type { ViewBook } from '~/types/book'
import type { Goal } from '~/types/goal'

const props = defineProps<{
  goal: Goal
  books: ViewBook[]
  authors: Author[]
  open?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle' | 'edit' | 'delete' | 'repeat' | 'log'): void
  (e: 'update', goal: Goal): void
  (e: 'day', day: string): void
}>()

const TABS = [
  { value: 'progress', label: 'Progress', icon: 'IconChartAreaLine' },
  { value: 'entries', label: 'Entries', icon: 'IconNotebook' },
] as const

const tab = ref<'progress' | 'entries'>(
  props.goal.entries.length ? 'progress' : 'entries',
)

const info = computed(() => getGoalInfo(props.goal))

const isDone = computed(
  () => info.value.status === 'completed' || info.value.status === 'expired',
)

const typeIcon = computed(() =>
  info.value.status === 'completed'
    ? 'IconTrophy'
    : GOAL_TYPE_MAP[props.goal.type].icon,
)

const logLabel = computed(() =>
  props.goal.type === 'books' ? 'Log book' : `Log ${props.goal.type}`,
)

const unitWord = computed(() => getGoalUnit(props.goal, props.goal.amount))

const meta = computed(() => {
  const author = props.authors.find(({ id }) => id === props.goal.author)
  return [
    formatGoalRange(props.goal.startAt, props.goal.finishAt),
    ...(props.goal.type === 'books' && props.goal.auto ? ['Auto-counted'] : []),
    `${props.goal.amount} ${unitWord.value} ${GOAL_INTERVAL_MAP[props.goal.interval].description}`,
    author?.name ?? 'Any author',
    props.goal.genres?.length ? props.goal.genres.join(', ') : 'All genres',
  ]
})

const CURRENT_LABEL = {
  day: 'today',
  week: 'this week',
  month: 'this month',
  year: 'this year',
}

const headline = computed(() => {
  if (props.goal.interval === 'total') {
    return {
      value: formatGoalNumber(info.value.progress),
      text: ` / ${props.goal.amount} ${unitWord.value}`,
    }
  }
  const unit = getGoalPeriodUnit(props.goal) ?? 'day'
  if (info.value.current) {
    return {
      value: formatGoalNumber(info.value.current.value),
      text: ` / ${props.goal.amount} ${unitWord.value} ${CURRENT_LABEL[unit]}`,
    }
  }
  return {
    value: String(info.value.hit),
    text: ` / ${info.value.counted || info.value.periods.length} ${unit}s on target`,
  }
})

function paceText(offset: number) {
  if (offset > 0) return `${offset} ahead of pace`
  if (offset < 0) return `${Math.abs(offset)} behind pace`
  return 'On pace'
}

const note = computed(() => {
  const value = info.value
  if (props.goal.interval === 'total') {
    if (value.status === 'completed') return 'Goal reached'
    if (value.status === 'expired') {
      const short = Math.max(0, props.goal.amount - value.progress)
      return `Ended ${formatGoalDate(props.goal.finishAt)} · ${formatGoalNumber(short)} short`
    }
    if (!value.started) return `Starts ${formatGoalDate(props.goal.startAt)}`
    return `${paceText(value.paceOffset)} · ${value.daysLeft} days left`
  }

  if (!value.started) return `Starts ${formatGoalDate(props.goal.startAt)}`

  const unit = getGoalPeriodUnit(props.goal) ?? 'day'
  return [
    value.current ? `${value.hit} of ${value.counted} ${unit}s on target` : '',
    value.streak > 1 ? `${value.streak}-${unit} streak` : '',
    value.current ? `${value.daysLeft} days left` : '',
  ]
    .filter(Boolean)
    .join(' · ')
})

const showPace = computed(
  () =>
    props.goal.interval === 'total' &&
    info.value.status === 'tracking' &&
    info.value.started &&
    info.value.timeFrac < 1,
)

function togglePause() {
  emit('update', {
    ...props.goal,
    status: props.goal.status === 'tracking' ? 'not-tracking' : 'tracking',
  })
}
</script>

<style scoped>
@reference '../assets/css/main.css';

.tile {
  @apply scroll-mt-[120px] gap-5;
}
.toggle {
  @apply flex min-w-0 flex-[1_1_18rem] cursor-pointer items-start gap-4 p-0 text-left;
}
.icon-well {
  @apply bg-primary-50 text-primary rounded-scholarly grid size-11 flex-none place-items-center;
}
.tile.muted .icon-well {
  @apply bg-surface-container text-ink-muted;
}
.title {
  @apply font-display text-ink-primary text-[1.375rem] leading-[1.2] font-semibold;
}
.toggle:hover .title {
  @apply text-primary;
}
.meta {
  @apply text-ink-muted flex flex-wrap gap-x-2 gap-y-1 text-[0.8125rem] font-semibold;
}
.meta span {
  @apply whitespace-nowrap;
}
.meta span + span::before {
  @apply mr-2;
  content: '·';
}
.chevron {
  @apply text-ink-muted hover:bg-surface-subtle hover:text-primary rounded-scholarly grid size-8 cursor-pointer place-items-center transition-transform duration-200;
}
.tile.open .chevron {
  @apply rotate-180;
}
.headline {
  @apply text-ink-secondary min-w-0 flex-1 text-[0.9375rem] leading-tight font-semibold;
}
.headline b {
  @apply font-display text-ink-primary mr-0.5 text-[1.75rem] font-semibold;
}
.percentage {
  @apply font-display text-primary text-2xl font-semibold;
}
.tile.muted .percentage {
  @apply text-ink-muted;
}
.bar {
  @apply bg-surface-container relative h-2.5 rounded-full;
}
.bar-fill {
  @apply bg-primary absolute inset-y-0 left-0 rounded-[inherit] transition-[width] duration-300;
}
.tile.muted .bar-fill {
  @apply bg-ink-subtle;
}
.bar-pace {
  @apply bg-ink-primary absolute -top-1 -bottom-1 -ml-px w-0.5 rounded-[1px];
}
.tabs {
  @apply border-stroke flex gap-6 border-b;
}
.tab {
  @apply text-ink-muted hover:text-ink-primary -mb-px inline-flex cursor-pointer items-center gap-2 border-b-2 border-transparent px-0.5 py-2.5 text-[0.9375rem] font-semibold;
}
.tab.selected {
  @apply text-primary border-primary;
}
.badge {
  @apply bg-surface-container text-ink-secondary min-w-[1.375rem] rounded-full px-1.5 text-center text-xs leading-[1.375rem] font-bold;
}
.tab.selected .badge {
  @apply bg-primary-50 text-primary;
}
</style>

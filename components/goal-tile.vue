<template>
  <bl-tile
    v-if="goal"
    v-bind="$attrs"
    :default-open="defaultOpen"
    align-header-vertical-on-small-screens
  >
    <template #title>
      <div class="flex max-w-80 flex-1 items-center gap-2 sm:max-w-[unset]">
        <component
          :is="icons[GOAL_TYPE_MAP[goal.type].icon]"
          :class="getGoalProgressColor(goal.status, 'text')"
          :size="ICON_SIZE_LARGE"
          stroke="1.5"
        />
        <h5 class="truncate">{{ goal.title }}</h5>
        <span class="mb-1 ml-2">
          <bl-total-tag
            :variant="goal.status === 'tracking' ? 'primary' : 'secondary'"
          >
            <IconConfetti
              v-if="goal.status === 'finished'"
              class="text-main"
              :size="16"
            />
            {{ GOAL_STATUS_MAP[goal.status].description }}
          </bl-total-tag>
        </span>
      </div>
    </template>
    <template #actions>
      <div class="flex w-full items-center gap-1 sm:justify-end">
        <bl-modal size="sm" @confirm="deleteGoal">
          <template #trigger="triggerProps">
            <bl-button variant="secondary" v-bind="triggerProps">
              <template #prependIcon="iconProps">
                <IconTrash v-bind="iconProps" />
              </template>
            </bl-button>
          </template>
          <template #title>
            <div>
              Are you sure you want to delete
              <strong>{{ goal.title }}</strong>
              ?
            </div>
          </template>
          This action cannot be undone.
          <template #cancel-label> Cancel </template>
          <template #action-label> Delete </template>
        </bl-modal>
        <bl-goal-modal
          v-if="authors && books"
          v-model="goal"
          :authors="authors"
          :books="books"
          :reload-goals="reloadGoals"
        >
          <template #trigger="triggerProps">
            <bl-button v-bind="triggerProps" variant="secondary">
              <template #prependIcon="iconProps">
                <IconPencil v-bind="iconProps" />
              </template>
            </bl-button>
          </template>
        </bl-goal-modal>
        <bl-button
          v-if="goal.status === 'tracking' || goal.status === 'not-tracking'"
          variant="secondary"
          class="h-full"
          @click="onTrack"
        >
          <template #prependIcon="iconProps">
            <IconPlayerPause
              v-if="goal.status === 'tracking'"
              v-bind="iconProps"
            />
            <IconPlayerPlay
              v-if="goal.status === 'not-tracking'"
              v-bind="iconProps"
            />
          </template>
          {{ goal.status === 'tracking' ? 'Pause' : 'Track' }}
        </bl-button>
      </div>
    </template>
    <div class="pt-8">
      <bl-goal-progress-bar :goal="goal" />
    </div>
    <template #collapsible>
      <bl-tabs
        :default-value="sortedEntries.length ? 'progress' : 'tracked'"
        class="mt-4"
        full
      >
        <template #options="options">
          <bl-tab-option
            v-if="sortedEntries.length"
            v-bind="options"
            value="progress"
          >
            Progress
          </bl-tab-option>
          <bl-tab-option v-bind="options" value="tracked">
            Entries
          </bl-tab-option>
        </template>

        <bl-tab v-if="sortedEntries.length" value="progress">
          <template v-if="goal.interval === 'total'">
            <div class="mt-5">
              <bl-line-chart
                :height="320"
                :items="chartItems"
                :x-axis-label-formatter="xAxisLabelFormatter"
                :tooltip-formatter="tooltipFormatter"
              />
            </div>
          </template>
        </bl-tab>
        <bl-tab value="tracked">
          <div class="mt-5 flex max-h-[502px] flex-col gap-2 overflow-y-auto">
            <bl-empty
              v-if="sortedEntries.length === 0 && !addingNew"
              icon="IconNotebook"
              class="py-4"
            >
              <template #label>This goal has no entries</template>
              <template #action>
                <bl-button @click="onCreateNew"> Create first entry </bl-button>
              </template>
            </bl-empty>
            <bl-goal-entry
              v-for="(_entry, index) in sortedEntries"
              :key="_entry.id"
              v-model:goal="goal"
              v-model:entry="sortedEntries[index]"
              :books="books"
              :reload-goals="reloadGoals"
            />
            <bl-goal-entry
              v-if="addingNew"
              v-model:goal="goal"
              v-model:entry="entry"
              v-model:editing="addingNew"
              :books="books"
              :reload-goals="reloadGoals"
            />
            <bl-button
              v-if="sortedEntries.length && !addingNew"
              class="w-full"
              variant="tertiary"
              @click="onCreateNew"
            >
              <template #prependIcon="iconProps">
                <IconPlus v-bind="iconProps" class="!text-main" />
              </template>
              Add new entry
            </bl-button>
          </div>
        </bl-tab>
      </bl-tabs>
    </template>
  </bl-tile>
</template>

<script setup lang="ts">
import {
  icons,
  IconConfetti,
  IconPlus,
  IconPencil,
  IconTrash,
  IconPlayerPause,
  IconPlayerPlay,
} from '@tabler/icons-vue'
import type { ViewBook } from '~/types/book'
import type {
  BookGoalEntry,
  HourGoalEntry,
  PageGoalEntry,
  Goal,
} from '~/types/goal'
import type { LineChartItem } from './line-chart.client.vue'
import type { Author } from '~/types/author'
import type { ManipulateType } from 'dayjs'
import { indexBy, sum } from 'ramda'

const props = defineProps<{
  defaultOpen?: boolean
  authors: Author[]
  books: ViewBook[]
  reloadGoals: () => Promise<void>
}>()

const goal = defineModel<Goal>('goal')
const entry = ref<
  Partial<BookGoalEntry | PageGoalEntry | HourGoalEntry> | undefined
>()
const addingNew = ref<boolean>(false)

const booksById = computed(() =>
  props.books ? indexBy(({ id }) => String(id), props.books) : {},
)

const sortedEntries = computed(() => {
  return (goal.value?.entries ?? []).concat().sort((a, b) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })
})

const interval = computed<ManipulateType>(() => {
  if (goal.value) {
    return getProgressInterval()
  }
  return 'month'
})

const xAxisLabelFormatter = computed(() => {
  if (interval.value === 'month') {
    return toMonthYearCompact
  }

  return toFullDateCompact
})

const dates = computed(() => {
  if (goal.value && interval.value) {
    return getDatesInInterval(
      { start: goal.value.startAt, end: goal.value.finishAt },
      interval.value,
    ).map((date) => {
      const entriesForDate = sortedEntries.value.filter((entry) =>
        isSameDateInUnit(entry.createdAt, date, interval.value),
      )
      const x = toStartOfDay(date)
      let y = 0

      switch (goal.value!.type) {
        case 'books':
          y = entriesForDate.length
          break
        case 'pages':
          y = sum(entriesForDate.map((entry) => (entry as PageGoalEntry).pages))
          break
        case 'hours':
          y = sum(entriesForDate.map((entry) => (entry as HourGoalEntry).hours))
          break
      }

      return { x, y, entries: entriesForDate }
    })
  }

  return []
})

const chartItems = computed<LineChartItem[]>(() => {
  const [actualDates, projectedDates] = getChartDates()
  return [
    {
      label: 'actual',
      color: tailwind.theme.colors.main,
      values: actualDates,
      markPoint: 'max',
    },
    {
      label: 'projected',
      color: tailwind.theme.colors.accent,
      values: projectedDates,
      markPoint: 'max',
    },
  ]
})

function getChartDates(): [LineChartItem['values'], LineChartItem['values']] {
  if (goal.value) {
    const lastEntryDate = sortedEntries.value.at(-1)?.createdAt

    const isCurrentGoalReached = goal.value.entries.length >= goal.value.amount

    return dates.value.reduce<
      [LineChartItem['values'], LineChartItem['values']]
    >(
      ([actualDates, projectedDates], { x, y }, index) => {
        const accumulatedYActual = (actualDates[index - 1]?.y ?? 0) + y
        const accumulatedYProjected = (projectedDates[index - 1]?.y ?? 0) + y

        // connect the actual and projected lines
        if (isSameDateInUnit(x, lastEntryDate, interval.value)) {
          actualDates.push({ y: accumulatedYActual, x })
          if (!isCurrentGoalReached) {
            projectedDates.push({ y: accumulatedYActual, x })
          }
          // push actual values
        } else if (isBeforeDay(x, lastEntryDate)) {
          actualDates.push({
            y: accumulatedYActual,
            x,
          })
          projectedDates.push({ x, y: undefined })
          // push projected values
        } else {
          projectedDates.push({
            y: getProjectedValue(
              dates.value.length - actualDates.length,
              projectedDates.length - actualDates.length + 1,
              accumulatedYProjected,
              goal.value!.amount,
            ),
            x,
          })
        }

        return [actualDates, projectedDates]
      },
      [[], []],
    )
  }
  return [[], []]
}

function getProgressInterval(): ManipulateType {
  if (goal.value) {
    if (goal.value.interval === 'total') {
      return getIntervalUnit({
        start: goal.value.startAt,
        end: goal.value.finishAt,
      })
    }
  }

  return 'month'
}

function getProjectedValue(
  totalSteps: number,
  currentStep: number,
  accumulatedValue: number,
  finalValue: number,
): number {
  if (totalSteps <= 0) return finalValue

  const increments = finalValue - accumulatedValue
  if (increments <= 0) return accumulatedValue

  const stepsPerIncrement = totalSteps / increments
  const value = accumulatedValue + Math.floor(currentStep / stepsPerIncrement)

  return Math.min(value, finalValue)
}

function tooltipFormatter({ x, y }: { x: string; y?: number }): string {
  if (!goal.value) {
    return ''
  }

  const entriesForDate = dates.value.find((date) => date.x === x)?.entries

  const accumulatedValue = `<b>${y} ${getGoalUnit(goal.value, +(y ?? 0))} read in total</b>`

  if (entriesForDate?.length) {
    const listItems = entriesForDate
      .map((entry) => {
        if ((entry as BookGoalEntry).book) {
          return booksById.value[(entry as BookGoalEntry).book]?.title
        }

        return ''
      })
      .map((v) => `‣ ${v}`)
      .join('<br />')

    return `${accumulatedValue}<br /><div class='text-start'>Books read on ${toFullDateCompact(x)}:</div><div class='text-start'>${listItems}</div>`
  }

  return `${accumulatedValue}<br />No ${getGoalUnit(goal.value, 10)} read on ${toFullDateCompact(x)}`
}

function onCreateNew() {
  entry.value = {
    createdAt: toSimpleDate(now()),
  }
  addingNew.value = true
}

async function deleteGoal() {
  if (goal.value) {
    await $fetch(`/api/goals/${goal.value.id}`, {
      method: 'delete',
    })
  }
  props.reloadGoals()
}

async function onTrack() {
  if (goal.value) {
    const updatedGoal = await $fetch('/api/goals', {
      method: 'POST',
      body: {
        ...goal.value,
        status: goal.value.status === 'tracking' ? 'not-tracking' : 'tracking',
      } as Goal,
    })

    goal.value = { ...goal.value, ...updatedGoal }
    props.reloadGoals()
  }
}
</script>

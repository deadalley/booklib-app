<template>
  <bl-modal :open="open" size="sm" icon="IconChartAreaLine" @cancel="onCancel">
    <template #trigger>
      <slot name="trigger" @click="open = true" />
    </template>

    <template #title>
      {{ isNew ? 'New goal' : goal?.title }}
    </template>

    <ClientOnly>
      <div class="flex flex-1 flex-col gap-16 overflow-visible overflow-y-auto">
        <FormKit
          id="goal"
          v-model="goalForm"
          type="form"
          :actions="false"
          @submit="onSubmit"
        >
          <section class="book-section">
            <div class="form-section">
              <div class="form-row">
                <bl-input
                  id="title"
                  name="title"
                  label="Goal title"
                  placeholder="Title"
                />
              </div>
            </div>
          </section>
          <section class="book-section">
            <h6 class="flex flex-1 items-center gap-2">
              <IconLicense
                class="text-main"
                :size="ICON_SIZE_SMALL"
                stroke="1.5"
              />
              Goal
            </h6>
            <div class="form-section">
              <div class="form-row">
                <bl-checkbox
                  id="isActive"
                  v-model="trackingGoal"
                  name="isActive"
                  align="left"
                >
                  Create goal as active
                </bl-checkbox>
              </div>
              <div class="form-row sm:items-end">
                <bl-input
                  id="amount"
                  type="number"
                  name="amount"
                  placeholder="Amount"
                />
                <bl-select
                  id="type"
                  data-testid="tracking-goal-type"
                  type="select"
                  name="type"
                  placeholder="Type"
                  :options="
                    Object.values(GOAL_TYPE_MAP).map(
                      ({ id, description, icon }) => ({
                        label: description,
                        value: id,
                        icon,
                      }),
                    )
                  "
                />
                <bl-select
                  id="interval"
                  type="select"
                  name="interval"
                  placeholder="Interval"
                  :options="
                    Object.values(GOAL_INTERVAL_MAP).map(
                      ({ id, description }) => ({
                        label: description,
                        value: id,
                      }),
                    )
                  "
                />
              </div>
              <div class="form-row">
                <bl-input-autocomplete
                  v-if="authorSelectOptions.length"
                  id="author"
                  name="author"
                  label="From author"
                  placeholder="Author"
                  :options="authorSelectOptions"
                  clearable
                />
                <bl-input-autocomplete
                  v-if="genreSelectOptions.length"
                  id="genres"
                  name="genres"
                  label="From genres"
                  placeholder="Genres"
                  :options="genreSelectOptions"
                  clearable
                  multiple
                />
              </div>
            </div>
          </section>
          <section class="book-section">
            <h6 class="flex flex-1 items-center gap-2">
              <IconTimeDuration30
                class="text-main"
                :size="ICON_SIZE_SMALL"
                stroke="1.5"
              />
              Duration
            </h6>
            <div class="form-section">
              <div class="form-row">
                <bl-raw-select
                  v-model="dateRange"
                  align="end"
                  side="top"
                  :options="dateRangeOptions"
                  placeholder="Select date range"
                />
              </div>
              <div class="form-row">
                <bl-input
                  id="startAt"
                  type="date"
                  name="startAt"
                  label="Start on"
                  placeholder="Start date"
                  :formatter="dateFormatter"
                />
                <bl-input
                  id="finishAt"
                  type="date"
                  name="finishAt"
                  label="Finish on"
                  placeholder="End date"
                  :formatter="dateFormatter"
                />
              </div>
            </div>
          </section>
          <div class="flex items-baseline justify-end gap-2">
            <bl-button variant="secondary" @click="onCancel">
              {{ isNew ? 'Cancel' : 'Discard changes' }}
            </bl-button>
            <bl-button @click="onSubmit">{{
              isNew ? 'Create goal' : 'Save changes'
            }}</bl-button>
          </div>
        </FormKit>
      </div>
    </ClientOnly>
  </bl-modal>
</template>

<script setup lang="ts">
import type { Goal } from '~/types/goal'
import { reset } from '@formkit/core'
import { IconLicense, IconTimeDuration30 } from '@tabler/icons-vue'
import { uniq } from 'ramda'
import type { Book } from '~/types/book'
import type { Author } from '~/types/author'
import type { SelectOption } from './raw-select.vue'
import { getDateRange, getSixMonthsRange } from '~/utils/date'
import dayjs from 'dayjs'

const dateRangeOptions: SelectOption[] = [
  { label: 'This year', value: 'currentYear' },
  { label: 'Next year', value: 'nextYear' },
  { label: 'The next six months', value: 'halfYear' },
  { label: 'This month', value: 'month' },
  { label: 'Next month', value: 'nextMonth' },
  { label: 'This week', value: 'week' },
]

const props = defineProps<{
  isNew?: boolean
  authors: Author[]
  books: Book[]
  reloadGoals: () => Promise<void>
}>()

const goal = defineModel<Goal | undefined>()
const goalForm = ref<Goal | undefined>(
  goal.value
    ? {
        ...goal.value,
        startAt: toSimpleDate(goal.value.startAt),
        finishAt: toSimpleDate(goal.value.finishAt),
      }
    : undefined,
)

const open = ref<boolean>(false)
const trackingGoal = ref<boolean>(goal.value?.status === 'tracking')
const dateRange = ref<
  | 'currentYear'
  | 'nextYear'
  | 'month'
  | 'nextMonth'
  | 'week'
  | 'halfYear'
  | undefined
>()

const authorSelectOptions = computed(() =>
  props.authors
    .map((author) => ({
      label: author.name,
      value: String(author.id),
    }))
    .sort(({ label: l1 }, { label: l2 }) => l1.localeCompare(l2)),
)

const genreSelectOptions = computed(() => {
  const allGenres = uniq(
    props.books
      .flatMap((book) => book.genres)
      .filter((genre): genre is string => !!genre),
  )
  return allGenres
    .map((genre) => ({
      label: genre,
      value: genre,
    }))
    .sort(({ label: l1 }, { label: l2 }) => l1.localeCompare(l2))
})

watch(goal, (newGoal) => {
  goalForm.value = newGoal
    ? {
        ...newGoal,
        startAt: toSimpleDate(newGoal.startAt),
        finishAt: toSimpleDate(newGoal.finishAt),
      }
    : undefined

  trackingGoal.value = newGoal?.status === 'tracking'
})

watch(dateRange, () => {
  if (goalForm.value) {
    const dateInterval = getIntervalFromDateRange()

    goalForm.value.startAt = toSimpleDate(dateInterval.startAt)
    goalForm.value.finishAt = toSimpleDate(dateInterval.finishAt)
  }
})

async function onSubmit() {
  if (goalForm.value) {
    try {
      const updatedGoal = await $fetch<Goal>('/api/goals', {
        method: 'POST',
        body: {
          ...goal.value,
          ...goalForm.value,
          startAt: toStartOfDay(fromSimpleDate(goalForm.value.startAt)),
          finishAt: toEndOfDay(fromSimpleDate(goalForm.value.finishAt)),
          status: trackingGoal.value ? 'tracking' : 'not-tracking',
        } as Goal,
      })

      reset('goal')
      open.value = false
      dateRange.value = undefined
      await props.reloadGoals()
      goal.value = updatedGoal
      goalForm.value = undefined
      return updatedGoal
    } catch (error) {
      console.error(error)
    }
  }
}

function onCancel() {
  reset('goal')
  open.value = false
  dateRange.value = undefined
}

function dateFormatter(date: Date | undefined): string | undefined {
  return date && toDefaultDate(date)
}

function getIntervalFromDateRange(): Pick<Goal, 'startAt' | 'finishAt'> {
  const renameGoalKeys = renameKeys({
    start: 'startAt',
    end: 'finishAt',
  })

  switch (dateRange.value) {
    case 'currentYear':
      return renameGoalKeys(getDateRange(now(), 'year'))
    case 'nextYear':
      return renameGoalKeys(getDateRange(dayjs(now()).add(1, 'year'), 'year'))
    case 'halfYear':
      return renameGoalKeys(getSixMonthsRange(now()))
    case 'month':
      return renameGoalKeys(getDateRange(now(), 'month'))
    case 'nextMonth':
      return renameGoalKeys(getDateRange(dayjs(now()).add(1, 'month'), 'month'))
    case 'week':
      return renameGoalKeys(getDateRange(now(), 'week'))
    default:
      return {
        startAt: '',
        finishAt: '',
      }
  }
}
</script>

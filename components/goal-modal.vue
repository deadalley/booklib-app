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
          v-model="goal"
          type="form"
          :actions="false"
          @submit="onSaveChanges"
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
              <div class="form-row">
                <bl-checkbox
                  id="isActive"
                  v-model="trackingGoal"
                  name="isActive"
                  align="left"
                >
                  Active
                </bl-checkbox>
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
            <div class="form-row items-end">
              <bl-input
                id="amount"
                type="number"
                name="amount"
                placeholder="Amount"
              />
              <bl-select
                id="type"
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
              />
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
            <div class="form-row">
              <bl-raw-select
                v-model="dateRange"
                align="end"
                side="top"
                :options="dateRangeOptions"
                placeholder="Select date range"
              />
            </div>
            <div v-if="dateRange === 'custom' || !isNew" class="form-row">
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
          </section>
          <div class="flex items-baseline justify-end gap-2">
            <bl-button variant="secondary" @click="onCancel">
              {{ isNew ? 'Cancel' : 'Discard changes' }}
            </bl-button>
            <bl-button @click="onSaveChanges">{{
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
import { assoc, curry, reduce, uniq } from 'ramda'
import type { Book } from '~/types/book'
import type { Author } from '~/types/author'
import type { SelectOption } from './raw-select.vue'
import { getDateRange, getSixMonthsRange } from '~/utils/date'
import dayjs from 'dayjs'

const props = defineProps<{
  isNew?: boolean
  authors: Author[]
  books: Book[]
  reloadGoals: () => Promise<void>
}>()

const goal = defineModel<Goal | undefined>()

const open = ref<boolean>(false)
const trackingGoal = ref<boolean>(goal.value?.status === 'tracking')
const dateRange = ref<
  | 'currentYear'
  | 'nextYear'
  | 'month'
  | 'week'
  | 'halfYear'
  | 'custom'
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

const dateRangeOptions: SelectOption[] = [
  { label: 'This year', value: 'currentYear' },
  { label: 'Next year', value: 'nextYear' },
  { label: 'The next six months', value: 'halfYear' },
  { label: 'This month', value: 'month' },
  { label: 'This week', value: 'week' },
  { label: 'Set custom duration', value: 'custom' },
]

async function onSaveChanges() {
  if (goal.value) {
    await onSubmit(goal.value)
  }
}

async function onSubmit(goalValues: Goal) {
  try {
    const dateInterval = getIntervalFromDateRange()
    const goal = await $fetch<Goal>('/api/goals', {
      method: 'POST',
      body: {
        ...goalValues,
        status: trackingGoal.value ? 'tracking' : 'not-tracking',
        ...dateInterval,
      } as Goal,
    })

    reset('goal')
    open.value = false
    dateRange.value = undefined
    props.reloadGoals()
    return goal
  } catch (error) {
    console.error(error)
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
  const renameKeys = curry(
    <T extends { start: string; end: string }>(
      obj: T,
    ): Pick<Goal, 'startAt' | 'finishAt'> =>
      reduce(
        (acc, key) =>
          assoc(
            { start: 'startAt', end: 'finishAt' }[key] || key,
            obj[key as keyof T],
            acc,
          ),
        { startAt: '', finishAt: '' },
        Object.keys(obj),
      ),
  )

  switch (dateRange.value) {
    case 'currentYear':
      return renameKeys(getDateRange(now(), 'year'))
    case 'nextYear':
      return renameKeys(getDateRange(dayjs(now()).add(1, 'year'), 'year'))
    case 'halfYear':
      return renameKeys(getSixMonthsRange(now()))
    case 'month':
      return renameKeys(getDateRange(now(), 'month'))
    case 'week':
      return renameKeys(getDateRange(now(), 'week'))
    case 'custom':
      return {
        startAt: goal.value?.startAt || '',
        finishAt: goal.value?.finishAt || '',
      }
    default:
      return {
        startAt: '',
        finishAt: '',
      }
  }
}
</script>

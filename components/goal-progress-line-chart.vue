<template>
  <div class="mt-5">
    <bl-line-chart
      v-if="goal.interval === 'total'"
      :height="320"
      :items="lineChartItems"
      :x-axis-label-formatter="xAxisLabelFormatter"
      :tooltip-formatter="tooltipFormatter"
    />
    <bl-bar-chart
      v-else
      :height="320"
      :items="barChartItems"
      :unit="getGoalUnit(goal, 10)"
    />
  </div>
</template>

<script
  setup
  lang="ts"
  generic="T extends BookGoalEntry | HourGoalEntry | PageGoalEntry"
>
import { indexBy, sum } from 'ramda'
import type { ViewBook } from '~/types/book'
import type {
  BookGoalEntry,
  Goal,
  HourGoalEntry,
  PageGoalEntry,
} from '~/types/goal'
import type { LineChartItem } from './line-chart.client.vue'
import type { ManipulateType } from 'dayjs'
import type { BarChartItem } from './bar-chart.client.vue'

const props = defineProps<{
  goal: Goal
  books: ViewBook[]
  sortedEntries: T[]
  reloadGoals: () => Promise<void>
}>()

const booksById = computed(() =>
  props.books ? indexBy(({ id }) => String(id), props.books) : {},
)

const xAxisLabelFormatter = computed(() => {
  if (interval.value === 'month') {
    return toMonthYearCompact
  }

  return toFullDateCompact
})

const interval = computed<ManipulateType>(() => {
  if (props.goal) {
    return getProgressInterval()
  }
  return 'month'
})

const lineChartItems = computed<LineChartItem[]>(() => {
  const [actualDates, projectedDates] = getChartDatesForTotalGoalType()
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

const barChartItems = computed<BarChartItem[]>(() => {
  return getChartDatesForPeriodicGoalType()
})

const dates = computed(() => {
  if (props.goal && interval.value) {
    return getDatesInInterval(
      { start: props.goal.startAt, end: props.goal.finishAt },
      interval.value,
    ).map((date) => {
      const entriesForDate = props.sortedEntries.filter((entry) =>
        isSameDateInUnit(entry.createdAt, date, interval.value),
      )
      const x = toStartOfDay(date)
      let y = 0

      switch (props.goal!.type) {
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

function getProgressInterval(): ManipulateType {
  if (props.goal) {
    if (props.goal.interval === 'total') {
      return getIntervalUnit({
        start: props.goal.startAt,
        end: props.goal.finishAt,
      })
    }
  }

  return 'month'
}

function getChartDatesForTotalGoalType(): [
  LineChartItem['values'],
  LineChartItem['values'],
] {
  if (props.goal) {
    const lastEntryDate = props.sortedEntries.at(-1)?.createdAt

    const isCurrentGoalReached = props.goal.entries.length >= props.goal.amount

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
            y: isCurrentGoalReached
              ? props.goal.entries.length
              : getProjectedValue(
                  dates.value.length - actualDates.length,
                  projectedDates.length - actualDates.length + 1,
                  accumulatedYProjected,
                  props.goal!.amount,
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

function getChartDatesForPeriodicGoalType(): BarChartItem[] {
  if (props.goal) {
    const lastEntryDate = props.sortedEntries.at(-1)?.createdAt

    return dates.value.reduce<BarChartItem[]>((actualDates, { x, y }) => {
      if (isSameDateInUnit(x, lastEntryDate, interval.value)) {
        actualDates.push({
          value: y,
          label: toFullDateCompact(x),
        })

        // push actual values
      } else if (isBeforeDay(x, lastEntryDate)) {
        actualDates.push({
          value: y,
          label: toFullDateCompact(x),
        })
      } else {
        actualDates.push({
          value: 0,
          label: toFullDateCompact(x),
        })
      }

      return actualDates
    }, [])
  }
  return []
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
  if (!props.goal) {
    return ''
  }

  const entriesForDate = dates.value.find((date) => date.x === x)?.entries

  const accumulatedValue = `<b>${y} ${getGoalUnit(props.goal, +(y ?? 0))} read in total</b>`

  if (entriesForDate?.length) {
    const listItems = entriesForDate
      .map((entry) => {
        if ((entry as BookGoalEntry).book) {
          return booksById.value[(entry as BookGoalEntry).book]?.title
        }

        if ((entry as PageGoalEntry).pages) {
          return `${(entry as PageGoalEntry).pages} pages`
        }

        return ''
      })
      .map((v) => `‣ ${v}`)
      .join('<br />')

    if (props.goal.type === 'books') {
      return `${accumulatedValue}<br /><div class='text-start'>${capitalize(getGoalUnit(props.goal, 10))} read on ${toFullDateCompact(x)}:</div><div class='text-start'>${listItems}</div>`
    } else {
      const accumulatedValueForDate = sum(
        (entriesForDate || []).map((entry) => {
          if (props.goal!.type === 'pages') {
            return (entry as PageGoalEntry).pages
          } else if (props.goal!.type === 'hours') {
            return (entry as HourGoalEntry).hours
          }
          return 0
        }),
      )

      return `${accumulatedValue}<br /><div class='text-start'>${accumulatedValueForDate} ${getGoalUnit(props.goal, accumulatedValueForDate)} read on ${toFullDateCompact(x)}</div>`
    }
  }

  return `${accumulatedValue}<br />No ${getGoalUnit(props.goal, 10)} read on ${toFullDateCompact(x)}`
}
</script>

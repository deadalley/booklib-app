<template>
  <bl-pie-chart :height="height" :unit="unit" :items="series" />
</template>

<script
  setup
  lang="ts"
  generic="
    T extends keyof Pick<
      Book,
      'progressStatus' | 'language' | 'originalLanguage' | 'rating'
    >
  "
>
import type { Book, BookProgressStatus } from '~/types/book'
import { groupBy } from 'lodash'
import languageOptions from '~/public/languages-2.json'
import type { PieChartItem } from './pie-chart.client.vue'

const props = withDefaults(
  defineProps<{
    books: Book[]
    bookProperty: T
    height?: number
    unit?: string
  }>(),
  { height: 340 },
)

const series = computed(() => {
  const groupedBooks = groupBy(
    props.books.filter((book) => !!book[props.bookProperty]),
    props.bookProperty,
  )
  return sortByBookProperty(
    Object.entries(groupedBooks).map(([label, items]) => ({
      label: getChartLabel(label as NonNullable<T>),
      value: items.length,
      originalLabel: label,
    })),
  )
})

function getChartLabel(label: NonNullable<T>): string {
  if (label === undefined) {
    return label
  }

  if (
    props.bookProperty === 'language' ||
    props.bookProperty === 'originalLanguage'
  ) {
    return languageOptions[label as keyof typeof languageOptions]
  }

  if (props.bookProperty === 'progressStatus') {
    return PROGRESS_STATUS_MAP[label as keyof typeof PROGRESS_STATUS_MAP]
      .description
  }

  return label
}

function sortByBookProperty(
  items: (PieChartItem<number> & { originalLabel: string })[],
): PieChartItem<number>[] {
  return items.sort(
    (
      { label: label1, originalLabel: originalLabel1 },
      { label: label2, originalLabel: originalLabel2 },
    ) => {
      if (props.bookProperty === 'progressStatus') {
        return (
          PROGRESS_STATUS_MAP[originalLabel1 as BookProgressStatus].step -
          PROGRESS_STATUS_MAP[originalLabel2 as BookProgressStatus].step
        )
      }

      return label2.localeCompare(label1)
    },
  )
}
</script>

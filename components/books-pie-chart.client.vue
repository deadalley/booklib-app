<template>
  <bl-pie-chart
    :height="height"
    :items="series"
    :show-percentages="showPercentages"
  />
</template>

<script
  setup
  lang="ts"
  generic="
    T extends keyof Pick<
      Book,
      'progressStatus' | 'language' | 'originalLanguage'
    >
  "
>
import type { Book } from '~/types/book'
import { groupBy } from 'lodash'
import languageOptions from '~/public/languages-2.json'

const props = withDefaults(
  defineProps<{
    books: Book[]
    bookProperty: T
    height?: number
    showPercentages?: boolean
  }>(),
  { height: 340, showPercentages: true },
)

const series = computed(() => {
  const groupedBooks = groupBy(
    props.books.filter((book) => !!book[props.bookProperty]),
    props.bookProperty,
  )
  return Object.entries(groupedBooks).map(([label, items]) => ({
    label: getChartLabel(label as NonNullable<T>),
    value: items.length,
  }))
})

function getChartLabel(label: NonNullable<T>) {
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
</script>

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
import type { Book } from '~/types/book'
import { groupBy } from 'lodash'
import languageOptions from '~/public/languages-2.json'

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
  return Object.entries(groupedBooks)
    .map(([label, items]) => ({
      label: getChartLabel(label as NonNullable<T>),
      value: items.length,
    }))
    .sort(({ label: label1 }, { label: label2 }) =>
      label2.localeCompare(label1),
    )
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

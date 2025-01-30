<template>
  <bl-bar-chart :height="height" :items="series" />
</template>

<script setup lang="ts" generic="T extends keyof Pick<Book, 'pages'>">
import type { Book } from '~/types/book'
import type { BarChartItem } from './bar-chart.client.vue'

const props = withDefaults(
  defineProps<{
    books: Book[]
    bookProperty: T
    height?: number
  }>(),
  { height: 340 },
)

const series = computed(() => {
  return sortBooksBy(props.books, props.bookProperty, 'desc')
    .map((book) => ({
      label: book.title,
      value: book[props.bookProperty],
    }))
    .filter((item): item is BarChartItem => item.value !== undefined)
})
</script>

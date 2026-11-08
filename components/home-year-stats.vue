<template>
  <bl-home-card
    :title="`Your ${year} so far`"
    to="/stats"
    link-label="Statistics"
  >
    <div class="stats">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="flex min-w-0 items-center gap-3"
      >
        <span class="home-icon-well">
          <component :is="stat.icon" :size="18" stroke="1.6" />
        </span>
        <span class="flex min-w-0 flex-col">
          <b class="value">{{ stat.value }}</b>
          <span class="label">{{ stat.label }}</span>
        </span>
      </div>
    </div>
  </bl-home-card>
</template>

<script setup lang="ts">
import {
  IconBook,
  IconBooks,
  IconFeather,
  IconStarFilled,
} from '@tabler/icons-vue'
import dayjs from 'dayjs'
import type { Book } from '~/types/book'
import { toSimpleDate } from '~/utils/date'

const props = defineProps<{ books: Book[] }>()

const year = dayjs().year()

const stats = computed(() => {
  const finished = props.books.filter((book) => {
    const finishedAt = getBookFinishedAt(book)
    return !!finishedAt && toSimpleDate(finishedAt).startsWith(`${year}-`)
  })
  const rated = finished.filter(({ rating }) => rating != null)
  const pages = finished.reduce((total, { pages }) => total + (pages ?? 0), 0)
  const average = rated.length
    ? (
        rated.reduce((total, { rating }) => total + rating!, 0) / rated.length
      ).toFixed(1)
    : '–'
  const authors = new Set(finished.map(({ author }) => author).filter(Boolean))

  return [
    { icon: IconBooks, value: finished.length, label: 'books finished' },
    {
      icon: IconBook,
      value: pages.toLocaleString('en-US'),
      label: 'pages read',
    },
    { icon: IconStarFilled, value: average, label: 'average rating' },
    { icon: IconFeather, value: authors.size, label: 'authors read' },
  ]
})
</script>

<style scoped>
@reference '../assets/css/main.css';

.stats {
  @apply grid grid-cols-2 gap-4;
}
@container (min-width: 700px) {
  .stats {
    @apply grid-cols-4;
  }
}
.value {
  @apply font-display text-ink-primary text-[1.75rem] leading-[1.1] font-semibold;
}
.label {
  @apply text-ink-secondary text-xs font-bold tracking-[0.1em] whitespace-nowrap uppercase;
}
</style>

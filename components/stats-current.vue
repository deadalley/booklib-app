<template>
  <bl-stats-empty v-if="!books.length" label="Nothing in progress" />
  <ul v-else class="flex flex-col">
    <li v-for="book in rows" :key="book.id" class="row">
      <NuxtLink :to="`/library/books/${book.id}`" class="link">
        <span class="flex justify-between gap-3">
          <span class="title">{{ book.title }}</span>
          <span class="text-primary text-sm font-bold">
            {{ book.percentage }}%
          </span>
        </span>
        <bl-progress-bar
          :progress-value="book.percentage"
          size="xs"
          color="bg-primary"
        />
        <span class="stats-sub">
          {{ book.progress.status === 'paused' ? 'Paused · ' : '' }}
          {{
            book.pages
              ? `${Math.max(0, book.pages - book.pagesRead)} pages left`
              : 'No page count'
          }}
        </span>
      </NuxtLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { Book } from '~/types/book'

const props = defineProps<{ books: Book[] }>()

// The current page isn't stored, so fall back to the furthest logged page
function pagesRead(book: Book) {
  const logged = (book.progress.notes ?? [])
    .map(({ page }) => page ?? 0)
    .reduce((max, page) => Math.max(max, page), 0)
  return Math.min(book.pages ?? Infinity, book.progress.currentPage ?? logged)
}

const rows = computed(() =>
  props.books
    .map((book) => {
      const read = pagesRead(book)
      return {
        ...book,
        pagesRead: read,
        percentage: book.pages
          ? Math.min(100, Math.round((read / book.pages) * 100))
          : 0,
      }
    })
    .sort(
      (a, b) =>
        Number(a.progress.status === 'paused') -
          Number(b.progress.status === 'paused') || b.percentage - a.percentage,
    ),
)
</script>

<style scoped>
@reference '../assets/css/main.css';

.row + .row {
  @apply border-stroke-subtle border-t;
}
.link {
  @apply flex w-full flex-col gap-1.5 py-3;
}
.title {
  @apply text-ink-primary truncate font-semibold;
}
.link:hover .title {
  @apply text-primary;
}
</style>

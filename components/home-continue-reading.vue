<template>
  <bl-home-card
    title="Continue reading"
    :count="books.length || null"
    to="/library/books"
  >
    <ul v-if="rows.length" class="flex flex-col">
      <li v-for="row in rows" :key="row.book.id" class="row">
        <NuxtLink :to="`/library/books/${row.book.id}`" class="row-link">
          <bl-home-book-cover
            :book="row.book"
            :icon-size="16"
            :show-title="false"
            class="h-[4.75rem]! w-[3.25rem]! flex-none rounded-lg p-1!"
          />
          <span class="flex min-w-0 flex-1 flex-col gap-1">
            <span class="title">{{ row.book.title }}</span>
            <span class="sub">{{ row.author ?? 'Unknown author' }}</span>
            <bl-progress-bar :progress-value="row.percentage" size="xs" />
          </span>
          <span class="flex flex-col items-end gap-0.5 whitespace-nowrap">
            <span class="font-display text-primary text-xl">
              {{ row.percentage }}%
            </span>
            <span v-if="row.left !== null" class="sub">
              {{ row.left }} left
            </span>
          </span>
        </NuxtLink>
      </li>
    </ul>
    <p v-else class="sub py-2">
      Nothing in progress. Pick something from the suggestions above.
    </p>
  </bl-home-card>
</template>

<script setup lang="ts">
import type { Author } from '~/types/author'
import type { Book } from '~/types/book'
import { getBookPagesRead, getBookPercentage } from '~/utils/suggestions'

/** Books being read, sorted by progress. */
const props = defineProps<{ books: Book[]; authors: Author[] }>()

const rows = computed(() =>
  props.books.slice(0, 3).map((book) => ({
    book,
    author: props.authors.find(({ id }) => id === book.author)?.name,
    percentage: getBookPercentage(book),
    left: book.pages ? Math.max(0, book.pages - getBookPagesRead(book)) : null,
  })),
)
</script>

<style scoped>
@reference '../assets/css/main.css';

.row + .row {
  @apply border-stroke-subtle border-t;
}
.row-link {
  @apply flex w-full items-center gap-4 py-3;
}
.title {
  @apply text-ink-primary truncate font-semibold;
}
.row-link:hover .title {
  @apply text-primary;
}
.sub {
  @apply text-ink-muted text-[0.8125rem] font-medium;
}
</style>

<template>
  <bl-home-card title="Recently added" to="/library/books">
    <div class="@container">
      <div class="recent-books">
        <bl-book-tile
          v-for="tile in tiles"
          :key="tile.book.id"
          :book="tile.book"
          :caption="`Added ${tile.added}`"
        />
      </div>
    </div>
  </bl-home-card>
</template>

<script setup lang="ts">
import type { Author } from '~/types/author'
import type { Book, ViewBook } from '~/types/book'
import { formatRelativeDay, toLocalDay } from '~/utils/suggestions'

/** The newest books first. */
const props = defineProps<{
  books: Book[]
  authors: Author[]
  today: string
}>()

const tiles = computed(() =>
  props.books.slice(0, 6).map((book) => ({
    book: {
      ...book,
      authorName: props.authors.find(({ id }) => id === book.author)?.name,
    } as ViewBook,
    added: formatRelativeDay(toLocalDay(book.createdAt), props.today),
  })),
)
</script>

<style scoped>
@reference '../assets/css/main.css';

.recent-books {
  @apply grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-4;
}
/* Narrow: one scrolling row instead of a tall grid */
@container (max-width: 560px) {
  .recent-books {
    @apply flex snap-x gap-3 overflow-x-auto pb-1;
  }
  .recent-books > * {
    @apply w-38 min-w-0 flex-none snap-start;
  }
}
</style>

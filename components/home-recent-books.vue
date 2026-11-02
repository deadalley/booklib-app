<template>
  <bl-home-card title="Recently added" to="/library/books">
    <div class="grid">
      <NuxtLink
        v-for="tile in tiles"
        :key="tile.book.id"
        :to="`/library/books/${tile.book.id}`"
        class="tile"
      >
        <bl-home-book-cover :book="tile.book" class="cover p-3!" />
        <span class="title">{{ tile.book.title }}</span>
        <span class="text-ink-muted text-[0.8125rem] font-medium">
          {{ tile.author ?? 'Unknown author' }}
        </span>
        <span class="text-ink-subtle text-xs font-semibold">
          Added {{ tile.added }}
        </span>
      </NuxtLink>
    </div>
  </bl-home-card>
</template>

<script setup lang="ts">
import type { Author } from '~/types/author'
import type { Book } from '~/types/book'
import { formatRelativeDay, toLocalDay } from '~/utils/suggestions'

/** The newest books first. */
const props = defineProps<{
  books: Book[]
  authors: Author[]
  today: string
}>()

const tiles = computed(() =>
  props.books.slice(0, 6).map((book) => ({
    book,
    author: props.authors.find(({ id }) => id === book.author)?.name,
    added: formatRelativeDay(toLocalDay(book.createdAt), props.today),
  })),
)
</script>

<style scoped>
@reference '../assets/css/main.css';

.grid {
  @apply grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-4;
}
.tile {
  @apply flex min-w-0 flex-col gap-1;
}
.cover {
  @apply mb-1.5 aspect-[2/3] h-auto! w-full rounded-lg;
  transition:
    transform 0.15s,
    box-shadow 0.15s;
}
.tile:hover .cover {
  @apply -translate-y-0.5 shadow-[0_6px_14px_rgba(0,0,0,0.1)];
}
.title {
  @apply text-ink-primary line-clamp-2 text-[0.9375rem] leading-[1.25] font-semibold;
}
.tile:hover .title {
  @apply text-primary;
}
</style>

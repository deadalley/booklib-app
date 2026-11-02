<template>
  <div class="entity-mosaic">
    <template v-if="topBooks.length">
      <div
        v-for="(book, index) in topBooks"
        :key="book.id"
        class="bg-surface-subtle min-h-0 min-w-0 overflow-hidden"
        :class="{
          'col-span-2': topBooks.length === 1,
          'row-span-2':
            topBooks.length <= 2 || (topBooks.length === 3 && index === 0),
        }"
      >
        <NuxtImg
          v-if="book.coverSrc"
          :src="book.coverSrc"
          :alt="book.title"
          class="size-full object-cover object-center"
        />
        <bl-empty-book-image
          v-else
          :icon-size="18"
          class="collection-tile-empty-cover"
        >
          {{ book.title }}
        </bl-empty-book-image>
      </div>
    </template>
    <bl-empty-book-image
      v-else
      :icon="emptyIcon"
      class="collection-tile-empty-state col-span-2 row-span-2"
    >
      <template #emptyLabel>No books</template>
    </bl-empty-book-image>
  </div>
</template>

<script setup lang="ts">
import type { icons } from '@tabler/icons-vue'
import type { Book } from '~/types/book'

const props = withDefaults(
  defineProps<{
    books: Pick<Book, 'id' | 'title' | 'coverSrc'>[]
    emptyIcon?: keyof typeof icons
  }>(),
  { emptyIcon: 'IconArchive' },
)

const topBooks = computed(() => props.books.slice(0, 4))
</script>

<style scoped>
@reference '../assets/css/main.css';

.entity-mosaic {
  @apply bg-stroke-subtle grid size-full grid-cols-2 grid-rows-2 gap-px;
}
</style>

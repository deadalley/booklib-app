<template>
  <div
    class="grid h-min w-full grid-cols-1 flex-wrap gap-x-6 gap-y-8 overflow-y-auto overflow-x-visible p-3 md:grid-cols-[repeat(auto-fill,minmax(9rem,1fr))]"
    v-bind="$attrs"
  >
    <bl-book-card
      v-for="book in sortedBooks"
      :key="book.title"
      :book="book"
      :selectable="selectable"
      :selected="book.selected"
      class="md:!w-36"
      @selected="
        (selected: boolean) => $emit('select', { bookId: book.id, selected })
      "
    />
  </div>
</template>

<script setup lang="ts">
import type { Book } from '~/types/book'

const props = defineProps<{
  books: (Book & { selected?: boolean })[]
  small?: boolean
  selectable?: boolean
}>()

defineEmits<{
  (e: 'select', val: { bookId: Book['id']; selected: boolean }): void
}>()

const sortedBooks = computed(() =>
  props.books
    .concat()
    .sort((book1, book2) => book1.title.localeCompare(book2.title)),
)
</script>

<template>
  <draggable
    :list="books"
    item-key="book-grid"
    class="grid h-min w-full grid-cols-1 flex-wrap gap-x-6 gap-y-8 overflow-y-auto overflow-x-visible p-3 md:grid-cols-[repeat(auto-fill,minmax(9rem,1fr))]"
    :animation="200"
    :disabled="!props.draggable"
    @change="
      ({
        moved: {
          element: { id },
          newIndex,
          oldIndex,
        },
      }) => emit('drag', { bookId: id, newOrder: newIndex, oldOrder: oldIndex })
    "
  >
    <template #item="{ element: book }">
      <bl-book-card
        :key="book.title"
        :book="book"
        class="md:!w-36"
        :selectable="selectable"
        :draggable="props.draggable"
        @selected="
          (selected: boolean) => $emit('select', { bookId: book.id, selected })
        "
      />
    </template>
  </draggable>
</template>

<script setup lang="ts">
// eslint-disable-next-line vue/no-dupe-keys
import draggable from 'vuedraggable'
import type { Book, ViewBook } from '~/types/book'

const props = defineProps<{
  small?: boolean
  selectable?: boolean
  draggable?: boolean
}>()

const books = defineModel<ViewBook[]>({
  default: [],
})

const emit = defineEmits<{
  (e: 'select', val: { bookId: Book['id']; selected: boolean }): void
  (
    e: 'drag',
    val: { bookId: Book['id']; newOrder: number; oldOrder: number },
  ): void
}>()
</script>

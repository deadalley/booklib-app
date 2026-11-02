<template>
  <draggable
    :list="books"
    :item-key="(book: ViewBook) => book.id"
    class="books-grid grid size-full grid-cols-2 gap-x-4 gap-y-6 overflow-x-visible overflow-y-auto sm:h-min sm:grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] sm:gap-x-6 sm:gap-y-8"
    :animation="200"
    :disabled="!props.draggable"
    @change="
      ({
        moved: {
          element: { id },
          newIndex,
          oldIndex,
        },
      }: {
        moved: { element: { id: string }; newIndex: number; oldIndex: number }
      }) => emit('drag', { bookId: id, newOrder: newIndex, oldOrder: oldIndex })
    "
  >
    <template #item="{ element: book }">
      <bl-book-tile
        :key="book.id"
        :book="book"
        :selectable="selectable"
        :draggable="props.draggable"
        :floating-icon="getIcon(book)"
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
import type { ViewBook } from '~/types/book'
import type { icons } from '@tabler/icons-vue'
import {
  DEFAULT_COLLECTION_ICONS,
  FAVORITE_COLLECTION_ID,
} from '~/utils/constants'

const props = defineProps<{
  small?: boolean
  selectable?: boolean
  draggable?: boolean
}>()

const books = defineModel<ViewBook[]>({
  default: [],
})

const emit = defineEmits<{
  (e: 'select', val: { bookId: ViewBook['id']; selected: boolean }): void
  (
    e: 'drag',
    val: { bookId: ViewBook['id']; newOrder: number; oldOrder: number },
  ): void
}>()

function getIcon(book: ViewBook): keyof typeof icons | undefined {
  if (book.isFavorite) {
    return DEFAULT_COLLECTION_ICONS[FAVORITE_COLLECTION_ID]
  }
}
</script>

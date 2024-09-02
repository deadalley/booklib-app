<template>
  <div class="flex flex-col items-start gap-3">
    <bl-book-image-small
      :alt="book.title"
      :href="href"
      :cover-src="book.coverSrc"
      :selectable="selectable"
      :selected="book.selected"
      @click="onSelect"
    />
    <div class="w-full flex-col">
      <NuxtLink :to="href">
        <h5 class="truncate">
          {{ book.title }}
        </h5>
      </NuxtLink>
      <p v-if="authorName" class="text-gray-600 truncate text-sm">
        {{ authorName }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Book } from '~/types/book'

const props = defineProps<{
  book: Pick<Book, 'id' | 'title' | 'coverSrc'> & { selected?: boolean }
  authorName?: string
  selectable?: boolean
}>()

const href = `/library/books/${props.book.id}`

const emit = defineEmits(['selected'])

function onSelect() {
  if (props.selectable) {
    emit('selected', !props.book.selected)
  }
}
</script>

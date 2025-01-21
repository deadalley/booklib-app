<template>
  <div class="flex flex-col items-start gap-3">
    <bl-book-image-small
      :alt="book.title"
      :href="href"
      :cover-src="book.coverSrc"
      :title="book.title"
      :selectable="selectable"
      :selected="book.selected"
      class="transition duration-300 ease-in-out hover:scale-110"
      @click="onSelect"
    />
    <div class="w-full flex-col">
      <NuxtLink :to="selectable ? undefined : href">
        <h5
          class="overflow-hidden leading-tight"
          :style="{
            display: '-webkit-box',
            '-webkit-line-clamp': 2,
            '-webkit-box-orient': 'vertical',
          }"
        >
          {{ book.title }}
        </h5>
      </NuxtLink>
      <h6 v-if="authorName" class="truncate">
        {{ authorName }}
      </h6>
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
console.log(props.book)

function onSelect() {
  if (props.selectable) {
    emit('selected', !props.book.selected)
  }
}
</script>

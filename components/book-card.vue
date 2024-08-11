<template>
  <div class="flex flex-col items-start gap-3">
    <bl-book-image-small
      v-model:selected="selected"
      :alt="book.title"
      :href="href"
      :cover-src="book.coverSrc"
      :selectable="selectable"
    />
    <div class="w-full flex-col">
      <NuxtLink :to="href">
        <h5 class="truncate">
          {{ book.title }}
        </h5>
      </NuxtLink>
      <!-- <p v-if="book.author" class="text-sm text-gray-600 truncate">
        {{ book.author }}
      </p> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Book } from '~/types/book'

const props = defineProps<{
  book: Pick<Book, 'id' | 'title' | 'coverSrc'>
  selectable?: boolean
}>()

const href = `/library/books/${props.book.id}`

const selected = ref(false)
</script>

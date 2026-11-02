<template>
  <img
    v-if="book.coverSrc"
    :src="book.coverSrc"
    :alt="`Cover of ${book.title}`"
    class="object-cover object-top"
  />
  <bl-empty-book-image
    v-else
    icon="IconBook"
    :icon-size="iconSize"
    aria-hidden="true"
    class="text-xs! [&_span]:line-clamp-3 [&_span]:whitespace-normal"
  >
    <template v-if="showTitle" #default>{{ book.title }}</template>
    <template v-else #emptyLabel />
  </bl-empty-book-image>
</template>

<script setup lang="ts">
import type { Book } from '~/types/book'

withDefaults(
  defineProps<{
    book: Pick<Book, 'title' | 'coverSrc'>
    iconSize?: number
    showTitle?: boolean
  }>(),
  { iconSize: 22, showTitle: true },
)
</script>

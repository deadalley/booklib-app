<template>
  <div class="inline-flex flex-col items-center gap-3">
    <NuxtLink :to="`library/books/${book.id}`">
      <img :src="book.coverSrc" :alt="book.title" class="rounded-2xl" />
    </NuxtLink>
    <div class="flex-col w-full">
      <NuxtLink :to="`library/books/${book.id}`">
        <h4>{{ book.title }}</h4>
      </NuxtLink>
      <p v-if="book.author" class="text-sm text-gray-600">{{ book.author }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Book } from '~/types/book'

defineProps({
  book: {
    type: Object as PropType<Book>,
    required: true,
  },
})
</script>

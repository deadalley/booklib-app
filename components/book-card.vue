<template>
  <div class="inline-flex flex-col items-center gap-3">
    <NuxtLink :to="`/library/books/${book.id}`">
      <div class="h-96 w-64">
        <bl-empty-book-image v-if="!book.coverSrc"></bl-empty-book-image>
        <img
          v-if="book.coverSrc"
          :src="book.coverSrc ?? undefined"
          :alt="book.title"
          class="rounded-2xl"
        />
      </div>
    </NuxtLink>
    <div class="flex-col w-full">
      <NuxtLink :to="`/library/books/${book.id}`">
        <h4 class="font-medium">{{ book.title }}</h4>
      </NuxtLink>
      <p v-if="book.author" class="text-sm text-gray-600">
        {{ book.author }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Book } from '~/types/book'

defineProps({
  book: {
    type: Object as PropType<Omit<Book, 'authorId'> & { author?: string }>,
    required: true,
  },
})
</script>

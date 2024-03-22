<template>
  <div class="inline-flex flex-col items-center gap-3">
    <NuxtLink :to="`/library/books/${book.id}`">
      <bl-empty-book-image
        v-if="!coverSrc"
        class="rounded-2xl h-64 w-auto"
      ></bl-empty-book-image>
      <img
        v-if="coverSrc"
        :src="coverSrc ?? undefined"
        :alt="book.title"
        class="rounded-2xl h-64 w-auto"
      />
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

const props = defineProps({
  book: {
    type: Object as PropType<Omit<Book, 'authorId'> & { author?: string }>,
    required: true,
  },
})

const { data: coverSrc } = await useFetch<string>(
  `/api/books/${props.book.id}/cover`,
)
</script>

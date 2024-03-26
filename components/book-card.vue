<template>
  <div class="flex flex-col items-start gap-3">
    <div v-if="pending" class="h-96 w-full flex justify-center items-center">
      <bl-loading></bl-loading>
    </div>
    <NuxtLink class="h-full w-4/6" :to="`/library/books/${book.id}`">
      <bl-empty-book-image
        v-if="!coverSrc"
        class="!rounded-2xl !p-6 min-h-56 h-full w-full"
      ></bl-empty-book-image>
      <img
        v-if="!pending && coverSrc"
        :src="coverSrc ?? undefined"
        :alt="book.title"
        class="rounded-2xl h-64 w-auto"
      />
    </NuxtLink>
    <div class="flex-col w-full">
      <NuxtLink :to="`/library/books/${book.id}`">
        <h4 class="font-medium truncate">
          {{ book.title }}
        </h4>
      </NuxtLink>
      <p v-if="book.author" class="text-sm text-gray-600 truncate">
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

const { data: coverSrc, pending } = await useFetch<string>(
  `/api/books/${props.book.id}/cover`,
)
</script>

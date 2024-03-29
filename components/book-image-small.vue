<template>
  <div v-if="pending" class="h-full w-full flex justify-center items-center">
    <bl-loading></bl-loading>
  </div>
  <NuxtLink :to="`/library/books/${book.id}`">
    <bl-empty-book-image
      v-if="!coverSrc"
      class="!rounded-2xl !p-5 !h-48 min-w-32"
    ></bl-empty-book-image>
    <img
      v-if="!pending && coverSrc"
      :src="coverSrc ?? undefined"
      :alt="book.title"
      class="rounded-2xl h-48 w-auto object-center object-cover"
    />
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Book } from '~/types/book'

const props = defineProps<{ book: Book }>()

const { data: coverSrc, pending } = await useFetch<string>(
  `/api/books/${props.book.id}/cover`,
)
</script>

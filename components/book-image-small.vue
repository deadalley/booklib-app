<template>
  <div v-if="pending" class="flex size-full items-center justify-center">
    <bl-loading></bl-loading>
  </div>
  <NuxtLink :to="`/library/books/${book.id}`">
    <bl-empty-book-image
      v-if="!coverSrc"
      class="!h-48 min-w-32 !rounded-2xl !p-5"
    ></bl-empty-book-image>
    <img
      v-if="!pending && coverSrc"
      :src="coverSrc ?? undefined"
      :alt="book.title"
      class="h-48 w-auto rounded-2xl object-cover object-center"
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

<template>
  <NuxtLink :to="`/library/books/${book.id}`" class="w-full">
    <bl-empty-book-image
      v-if="!coverSrc"
      class="!h-48 min-w-32 !rounded-2xl !p-5"
    ></bl-empty-book-image>
    <NuxtImg
      v-if="coverSrc"
      :src="coverSrc ?? undefined"
      :alt="book.title"
      class="h-auto w-full max-w-full rounded-2xl object-cover object-center md:h-48 md:w-auto"
    />
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Book } from '~/types/book'

const props = defineProps<{ book: Book }>()

const coverSrc = ref(props.book.coverSrc)
</script>

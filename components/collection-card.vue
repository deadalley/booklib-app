<template>
  <div class="flex flex-col items-start gap-3">
    <div class="flex">
      <div v-for="book in bookCovers" :key="book.id">
        <bl-book-image-small :book="book" />
      </div>
      <bl-book-image-small v-if="!bookCovers?.length" :book="{ id: '' }" />
    </div>
    <div class="w-full flex-col">
      <NuxtLink :to="`/library/collections/${collection.id}`">
        <h5 class="truncate">
          {{ collection.name }}
        </h5>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Book } from '~/types/book'
import type { Collection } from '~/types/collection'

const props = defineProps<{
  collection: Collection
  bookCovers: {
    id: Book['id']
    title?: Book['title']
    coverSrc: Book['coverSrc']
  }[]
}>()

const { data: bookCovers } = await useAsyncData<
  {
    id: Book['id']
    title?: Book['title']
    coverSrc: Book['coverSrc']
  }[]
>('bookCovers', () =>
  Promise.all(
    props.collection.books.map(({ id }) =>
      $fetch(`/api/books/${id}/cover`).then((coverSrc) => ({ id, coverSrc })),
    ),
  ),
)

console.log(props.collection, bookCovers)
</script>

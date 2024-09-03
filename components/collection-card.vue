<template>
  <div class="flex flex-col items-start gap-3">
    <div
      class="grid h-48 w-full cursor-pointer grid-cols-2 grid-rows-2 overflow-hidden rounded-lg transition duration-300 ease-in-out hover:scale-110"
    >
      <template v-for="(book, index) in bookCovers" :key="book.id">
        <NuxtLink
          :to="`/library/collections/${collection.id}`"
          :class="{
            'col-span-2': bookCovers?.length === 1,
            'row-span-2':
              (bookCovers?.length === 3 && index === 0) ||
              bookCovers?.length === 2 ||
              bookCovers?.length === 1,
          }"
        >
          <NuxtImg
            :src="book.coverSrc ?? undefined"
            :alt="book.title"
            class="size-full object-cover object-center"
          />
        </NuxtLink>
      </template>
      <bl-book-image-small
        v-if="!bookCovers?.length"
        :href="`/library/collections/${collection.id}`"
        :alt="collection.name"
        class="col-span-2 row-span-2"
      />
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
}>()

const { data: bookCovers } = await useAsyncData<
  {
    id: Book['id']
    title?: Book['title']
    coverSrc: Book['coverSrc']
  }[]
>(`${props.collection.id}`, () =>
  Promise.all(
    props.collection.books
      .slice(0, 4)
      .map((id) =>
        $fetch(`/api/books/${id}/cover`).then((coverSrc) => ({ id, coverSrc })),
      ),
  ),
)
</script>

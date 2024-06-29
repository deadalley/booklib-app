<template>
  <div class="flex flex-col items-start gap-3">
    <bl-book-image-small :book="book" />
    <div class="w-full flex-col">
      <NuxtLink :to="`/library/books/${book.id}`">
        <h5 class="truncate">
          {{ book.title }}
        </h5>
      </NuxtLink>
      <!-- <p v-if="book.author" class="text-sm text-gray-600 truncate">
        {{ book.author }}
      </p> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Book } from '~/types/book'

defineProps<{ book: Book }>()
</script>

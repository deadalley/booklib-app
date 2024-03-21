<template>
  <div class="flex flex-col gap-8">
    <div class="flex items-baseline gap-3">
      <h3>All Books</h3>
      <h6 class="text-accent-dark">TOTAL {{ books?.length }}</h6>
    </div>
    <div>
      <bl-book-card v-for="book in books" :key="book.title" :book="book">
      </bl-book-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Book } from '~/types/book'

const { data: books } = await useFetch<Book[]>('/api/books')

useHead({
  title: 'BookLib | My Library',
})

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
})
</script>

<template>
  <NuxtLayout name="dashboard" title="Statistics">
    <div class="flex">
      <div class="flex flex-1 flex-col items-center gap-4 overflow-x-auto">
        <h4>Book progress</h4>
        <bl-books-pie-chart
          v-if="books"
          :books="books"
          book-property="progressStatus"
          :show-percentages="false"
        />
      </div>
      <div class="flex flex-1 flex-col items-center gap-4 overflow-x-auto">
        <h4>Languages</h4>
        <bl-books-pie-chart
          v-if="books"
          :books="books"
          book-property="language"
          :show-percentages="false"
        />
      </div>
      <div class="flex flex-1 flex-col items-center gap-4 overflow-x-auto">
        <h4>Original Languages</h4>
        <bl-books-pie-chart
          v-if="books"
          :books="books"
          book-property="originalLanguage"
          :show-percentages="false"
        />
      </div>
    </div>
    <div class="flex w-1/2 flex-col gap-4 overflow-x-auto">
      <h4>Your top rated books</h4>
      <bl-ranking :items="rankedBooks" unit="★⯨" />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { RankingItem } from '~/components/ranking.client.vue'
import type { Book } from '~/types/book'

const { data: books } = await useFetch<Book[]>('/api/books')

const rankedBooks = computed<RankingItem[]>(() =>
  sortBooksBy(books.value ?? [], 'rating', 5).map((book) => ({
    label: book.title,
    value: book.rating!,
  })),
)
useHead({
  title: 'BookLib | Statistics',
})

definePageMeta({
  middleware: 'auth',
})
</script>

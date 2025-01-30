<template>
  <NuxtLayout name="dashboard" title="Statistics">
    <div class="grid grid-cols-12 gap-4">
      <bl-tile class="col-span-5">
        <template #title>Book status</template>
        <bl-books-pie-chart
          v-if="books"
          :books="books"
          book-property="progressStatus"
          :show-percentages="false"
        />
      </bl-tile>
      <bl-tile class="col-span-4">
        <template #title>Top rated books</template>
        <bl-ranking :items="rankedBooks" unit="★⯨" />
      </bl-tile>
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

<template>
  <div class="flex flex-col gap-8">
    <div class="flex justify-between">
      <div class="flex items-baseline gap-3">
        <h3>All Books</h3>
        <h6 class="text-accent-dark">TOTAL {{ books?.length }}</h6>
      </div>
      <div class="flex gap-3">
        <NuxtLink to="/library/books/new">
          <bl-button>
            <template #prependIcon="prependIcon">
              <IconPlus v-bind="prependIcon" />
            </template>
            Book
          </bl-button>
        </NuxtLink>
        <bl-switch>
          <bl-switch-option value="cards">
            <template #icon="iconProps">
              <IconLayoutDashboard v-bind="iconProps" />
            </template>
          </bl-switch-option>
          <bl-switch-option value="table">
            <template #icon="iconProps">
              <IconTable v-bind="iconProps" />
            </template>
          </bl-switch-option>
        </bl-switch>
      </div>
    </div>
    <div class="grid grid-cols-10 gap-y-5">
      <bl-book-card v-for="book in sortedBooks" :key="book.title" :book="book">
      </bl-book-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Book } from '~/types/book'
import { IconPlus, IconLayoutDashboard, IconTable } from '@tabler/icons-vue'

const { data: books } = await useFetch<Book[]>('/api/books')

const sortedBooks = computed(() =>
  books.value?.sort((b1, b2) => b1.title.localeCompare(b2.title)),
)

useHead({
  title: 'BookLib | My Library',
})

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
  alias: ['/library'],
})
</script>

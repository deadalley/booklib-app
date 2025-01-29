<template>
  <NuxtLayout name="dashboard" title="Home">
    <div v-if="isEmpty" class="flex flex-col">
      <h1 class="mb-8">
        Welcome to your new library, {{ user?.user_metadata.name }}!
      </h1>
      <div class="flex flex-col items-center gap-4">
        <NuxtImg
          src="/book-graphics.svg"
          alt="Book"
          class="h-96 object-cover object-center"
        />
        <h4>Your library is empty.</h4>
        <p class="text-center text-lg">
          It looks like you don't have any books yet in your library.
          <br />
          Let's add your first book.
        </p>
        <NuxtLink class="mt-4 flex md:inline-flex" to="/library/books/new">
          <bl-button expand>
            <template #prependIcon="prependIcon">
              <IconPlus v-bind="prependIcon" />
            </template>
            Add first book to library
          </bl-button>
        </NuxtLink>
        <div
          class="flex w-1/2 items-center justify-center gap-6 py-3 [&_hr]:w-full [&_hr]:text-accent"
        >
          <hr />
          <h6>OR</h6>
          <hr />
        </div>
        <NuxtLink to="/import">
          <bl-button expand>
            <template #prependIcon="prependIcon">
              <IconUpload v-bind="prependIcon" />
            </template>
            Import books from file
          </bl-button>
        </NuxtLink>
      </div>
    </div>
    <div v-if="!isEmpty" class="flex flex-col gap-20">
      <div class="flex w-full flex-col gap-4 overflow-x-auto">
        <h4>Last books added to library</h4>
        <div
          class="relative flex size-max gap-x-2 p-3 transition duration-100 ease-out"
        >
          <bl-book-card
            v-for="book in latestBooks"
            :key="book.title"
            :book="book"
            class="!w-36"
          />
        </div>
      </div>
      <div class="flex w-1/2 flex-col gap-4 overflow-x-auto">
        <h4>Your longest books</h4>
        <bl-ranking :items="rankedBooks" unit="Pages" />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { IconPlus, IconUpload } from '@tabler/icons-vue'
import type { RankingItem } from '~/components/ranking.client.vue'
import type { Book } from '~/types/book'
const user = useSupabaseUser()

const { data: isEmpty } = await useFetch<number>('/api/library/is-empty')
const { data: latestBooks } = await useFetch<
  Pick<Book, 'id' | 'title' | 'coverSrc'>[]
>('/api/library/latest-books')
const { data: rankedBooksByPages } = await useFetch<
  Required<Pick<Book, 'id' | 'title' | 'pages'>>[]
>('/api/library/ordered-books?property=pages&count=8')

const rankedBooks = computed<RankingItem[]>(() =>
  (rankedBooksByPages.value ?? []).map((book) => ({
    label: book.title,
    value: book.pages,
  })),
)

useHead({
  title: 'BookLib | Home',
})

definePageMeta({
  middleware: 'auth',
})
</script>

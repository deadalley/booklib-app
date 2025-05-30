<template>
  <NuxtLayout name="dashboard" title="Home">
    <div v-if="isEmpty" class="flex flex-col">
      <h1 class="mb-8">Welcome to your new library!</h1>
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
    <div v-if="!isEmpty" class="flex flex-col gap-10">
      <h1>Welcome to your library!</h1>
      <div class="flex w-full gap-8">
        <NuxtLink
          to="/library/books"
          class="flex flex-1 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-accent bg-white px-4 py-8 hover:bg-accent-light"
        >
          <IconBooks class="text-main" size="50" stroke="1.5" />
          <h5>Books</h5>
          <bl-total-tag v-if="books?.length">
            {{ books?.length }} {{ books?.length > 1 ? 'books' : 'book' }}
          </bl-total-tag>
          <NuxtLink to="/library/books/new">
            <bl-button v-if="!books?.length">Create a book</bl-button>
          </NuxtLink>
        </NuxtLink>
        <NuxtLink
          to="/library/collections"
          class="flex flex-1 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-accent bg-white px-4 py-8 hover:bg-accent-light"
        >
          <IconArchive class="text-main" size="50" stroke="1.5" />
          <h5>Collections</h5>
          <bl-total-tag v-if="collections?.length">
            {{ collections?.length }}
            {{ collections?.length > 1 ? 'collections' : 'collection' }}
          </bl-total-tag>
          <NuxtLink to="/library/collections/new">
            <bl-button v-if="!collections?.length"
              >Create a collection</bl-button
            >
          </NuxtLink>
        </NuxtLink>
      </div>
      <div class="flex flex-col gap-8">
        <bl-tile>
          <template #title>Last books added to library</template>
          <div
            class="relative flex size-max w-full gap-x-6 overflow-x-auto p-3 transition duration-100 ease-out"
          >
            <bl-book-card
              v-for="book in latestBooks"
              :key="book.title"
              :book="book"
              class="!w-36"
            />
          </div>
        </bl-tile>
      </div>
      <div class="grid grid-cols-12 gap-5">
        <div class="col-span-12 flex flex-col lg:col-span-5">
          <bl-book-stats-tile :books="books ?? []" />
        </div>
        <div class="col-span-12 flex flex-col lg:col-span-4">
          <bl-book-suggestions-tile
            :books="books ?? []"
            :authors="authors ?? []"
          />
        </div>
        <div class="col-span-12 flex flex-col gap-4 lg:col-span-3">
          <bl-author-highlight-tile
            v-if="authorsByBookCount?.length"
            :authors="authorsByRatings"
          >
            <template #title>Highest rated authors</template>
          </bl-author-highlight-tile>
          <bl-author-highlight-tile
            v-if="authorsByBookCount?.length"
            :authors="authorsByBookCount"
          >
            <template #title>Author with the most books</template>
          </bl-author-highlight-tile>
          <bl-author-highlight-tile
            v-if="authorsByBookCount?.length"
            :authors="authorsByBookCount"
          >
            <template #title>Author with the most books</template>
          </bl-author-highlight-tile>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { IconArchive, IconBooks, IconPlus, IconUpload } from '@tabler/icons-vue'
import type { Author } from '~/types/author'
import type { Book } from '~/types/book'
import type { Collection } from '~/types/collection'

const { data: isEmpty } = await useFetch<number>('/api/library/is-empty')
const { data: authors } = await useFetch<Author[]>('/api/authors')
const { data: books } = await useFetch<Book[]>('/api/books')
const { data: collections } = await useFetch<Collection[]>('/api/collections')
const { data: latestBooks } = await useFetch<
  Pick<Book, 'id' | 'title' | 'coverSrc'>[]
>('/api/library/latest-books')

const authorsByRatings = computed(() =>
  sortAuthorsByBookRatings(books.value ?? [], authors.value ?? [], 4).map(
    (author) => ({
      ...author,
      label: author.average ? 'Average rating' : undefined,
    }),
  ),
)

const authorsByBookCount = computed(() =>
  sortAuthorsByBookCount(books.value ?? [], authors.value ?? []).map(
    (author) => ({
      ...author,
      label: `${author.count} ${author.count > 1 ? 'books' : 'book'}`,
    }),
  ),
)

useHead({
  title: 'BookLib | Home',
})
</script>

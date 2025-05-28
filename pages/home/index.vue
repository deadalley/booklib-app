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
          <bl-total-tag v-if="bookCount">{{ bookCount }} books</bl-total-tag>
          <NuxtLink to="/library/books/new">
            <bl-button v-if="!bookCount">Create a book</bl-button>
          </NuxtLink>
        </NuxtLink>
        <NuxtLink
          to="/library/collections"
          class="flex flex-1 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-accent bg-white px-4 py-8 hover:bg-accent-light"
        >
          <IconArchive class="text-main" size="50" stroke="1.5" />
          <h5>Collections</h5>
          <bl-total-tag v-if="collectionCount"
            >{{ collectionCount }} collections</bl-total-tag
          >
          <NuxtLink to="/library/collections/new">
            <bl-button v-if="!collectionCount">Create a collection</bl-button>
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
        <div class="flex flex-1 gap-8">
          <div class="flex flex-[4] flex-col">
            <bl-tile v-if="bookListTileChance === 'length'">
              <template #title> Your longest books </template>
              <bl-ranking
                :items="longestBooks"
                :height="longestBooks.length * 60"
                unit="Pages"
                with-label
              />
            </bl-tile>
            <bl-tile v-if="bookListTileChance === 'rating'">
              <template #title> Your top rated books </template>
              <bl-ranking
                :items="ratedBooks"
                :height="ratedBooks.length * 60"
                :unit="getRatingUnit"
                with-label
              />
            </bl-tile>
          </div>
          <div class="flex flex-[3] flex-col">
            <bl-tile v-if="bookTileChance === 'not-read' && randomUnreadBook">
              <template #title> How about starting a new book? </template>
              <NuxtLink :to="`/library/books/${randomUnreadBook.id}`">
                <bl-book-image :book="randomUnreadBook" />
              </NuxtLink>
              <bl-button expand>
                Start reading
                <template #appendIcon="iconProps">
                  <component
                    :is="icons[PROGRESS_STATUS_MAP.read.icon]"
                    v-bind="iconProps"
                  />
                </template>
              </bl-button>
            </bl-tile>
            <bl-tile v-if="bookTileChance === 'reading' && randomReadingBook">
              <template #title>
                Are you still reading
                {{ randomReadingBook.title }}?
              </template>
              <NuxtLink :to="`/library/books/${randomReadingBook.id}`">
                <bl-book-image :book="randomReadingBook" />
              </NuxtLink>
              <bl-button expand>
                Mark as read
                <template #appendIcon="iconProps">
                  <component
                    :is="icons[PROGRESS_STATUS_MAP.reading.icon]"
                    v-bind="iconProps"
                  />
                </template>
              </bl-button>
            </bl-tile>
          </div>
          <div class="flex flex-[6] flex-col">
            <bl-tile> </bl-tile>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  IconArchive,
  IconBooks,
  IconPlus,
  icons,
  IconUpload,
} from '@tabler/icons-vue'
import type { RankingItem } from '~/components/ranking.client.vue'
import type { Book } from '~/types/book'

const { data: isEmpty } = await useFetch<number>('/api/library/is-empty')
const { data: bookCount } = await useFetch<number>('/api/library/book-count')
const { data: collectionCount } = await useFetch<number>(
  '/api/library/collection-count',
)

const { data: latestBooks } = await useFetch<
  Pick<Book, 'id' | 'title' | 'coverSrc'>[]
>('/api/library/latest-books')

const { data: rankedBooksByPages } = await useFetch<
  Required<Pick<Book, 'id' | 'title' | 'pages'>>[]
>('/api/library/ordered-books', {
  query: {
    property: 'pages',
    count: 5,
  },
})
const { data: rankedBooksByRating } = await useFetch<
  Required<Pick<Book, 'id' | 'title' | 'rating'>>[]
>('/api/library/ordered-books', {
  query: {
    property: 'rating',
    count: 5,
  },
})
const { data: readingBooks } = await useFetch<Book[]>('/api/books', {
  query: {
    bookProgress: 'reading',
    page: 0,
    pageSize: 5,
  },
})
const { data: unreadBooks } = await useFetch<Book[]>('/api/books', {
  query: {
    bookProgress: 'not-read',
    page: 0,
    pageSize: 5,
  },
})

const bookListTileChance = computed(() => {
  if (!ratedBooks.value?.length) {
    return 'length'
  } else if (!longestBooks.value?.length) {
    return 'rating'
  }

  const random = Math.random()

  if (random < 0.5) {
    return 'length'
  } else {
    return 'rating'
  }
})

const ratedBooks = computed<RankingItem[]>(() =>
  (rankedBooksByRating.value ?? []).map((book) => ({
    label: book.title,
    value: book.rating ?? 0,
  })),
)

const longestBooks = computed<RankingItem[]>(() =>
  (rankedBooksByPages.value ?? []).map((book) => ({
    label: book.title,
    value: book.pages ?? 0,
  })),
)

const bookTileChance = computed(() => {
  if (!readingBooks.value?.length) {
    return 'not-read'
  } else if (!unreadBooks.value?.length) {
    return 'reading'
  }

  const random = Math.random()

  if (random < 0.5) {
    return 'reading'
  } else {
    return 'not-read'
  }
})

const randomUnreadBook = computed(
  () =>
    unreadBooks.value?.length &&
    unreadBooks.value[randomInt(0, unreadBooks.value.length - 1)],
)

const randomReadingBook = computed(
  () =>
    readingBooks.value?.length &&
    readingBooks.value[randomInt(0, readingBooks.value.length - 1)],
)

useHead({
  title: 'BookLib | Home',
})
</script>

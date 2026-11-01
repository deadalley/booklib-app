<template>
  <NuxtLayout name="dashboard" title="Home">
    <div v-if="isEmpty" class="mx-auto flex w-full max-w-[90rem] flex-col">
      <div class="mb-8 flex flex-col gap-1">
        <span class="section-label text-primary">Home</span>
        <h3>Welcome to your new library</h3>
      </div>
      <div class="flex flex-col items-center gap-4">
        <img
          :src="getAssetPath('/book-graphics.svg')"
          alt="Book"
          class="h-56 object-cover object-center sm:h-80"
        />
        <h4>Your library is empty.</h4>
        <p class="text-center text-lg">
          It looks like you don't have any books yet in your library.
          <br />
          Let's add your first book.
        </p>
        <bl-button to="/library/books/new" class="mt-4 w-full sm:w-72">
          <template #prependIcon="prependIcon">
            <IconPlus v-bind="prependIcon" />
          </template>
          Add first book to library
        </bl-button>
        <div
          class="[&_hr]:text-ink-muted flex w-full max-w-sm items-center justify-center gap-6 py-3 [&_hr]:w-full"
        >
          <hr />
          <h6>OR</h6>
          <hr />
        </div>
        <bl-button
          to="/data-management"
          variant="secondary"
          class="w-full sm:w-72"
        >
          <template #prependIcon="prependIcon">
            <IconUpload v-bind="prependIcon" />
          </template>
          Import books from file
        </bl-button>
      </div>
    </div>
    <div
      v-if="!isEmpty"
      class="mx-auto flex w-full max-w-[90rem] flex-col gap-8"
    >
      <div class="flex flex-col gap-1">
        <span class="section-label text-primary">Home</span>
        <h3>Welcome to your library</h3>
      </div>
      <div class="flex w-full flex-col gap-4 md:flex-row">
        <bl-section-tile icon="IconBooks" href="/library/books">
          <template #label>Books</template>
          <template #total>
            {{ books?.length }}
            {{ (books?.length ?? 0) > 1 ? 'books' : 'book' }}
          </template>
          <bl-button
            v-if="!books?.length"
            to="/library/books/new"
            size="sm"
            class="max-sm:hidden"
          >
            Create a book
          </bl-button>
        </bl-section-tile>
        <bl-section-tile icon="IconArchive" href="/library/collections">
          <template #label>Collections</template>
          <template #total>
            {{ collections?.length }}
            {{ (collections?.length ?? 0) > 1 ? 'collections' : 'collection' }}
          </template>
          <bl-button
            v-if="!collections?.length"
            to="/library/collections/new"
            size="sm"
            class="max-sm:hidden"
          >
            Create a collection
          </bl-button>
        </bl-section-tile>
        <bl-section-tile icon="IconFeather" href="/library/authors">
          <template #label>Authors</template>
          <template #total>
            <template v-if="authors?.length">
              {{ authors?.length }}
              {{ (authors?.length ?? 0) > 1 ? 'authors' : 'author' }}
            </template>
            <template v-if="!authors?.length">No authors</template>
          </template>
        </bl-section-tile>
      </div>
      <div v-if="latestBooks?.length" class="flex min-w-0 flex-col gap-8">
        <bl-tile>
          <template #title>Last books added to library</template>
          <div class="relative min-w-0 overflow-x-auto overflow-y-hidden pb-1">
            <div class="flex w-max items-stretch gap-6">
              <bl-book-tile
                v-for="book in latestBooks"
                :key="book.id"
                :book="book"
                class="w-36 shrink-0"
              />
            </div>
          </div>
        </bl-tile>
      </div>
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12 flex flex-col md:col-span-6 2xl:col-span-4">
          <bl-book-stats-tile :books="books ?? []" />
        </div>
        <div
          v-if="books.length || authors.length"
          class="col-span-12 flex flex-col md:col-span-6 2xl:col-span-4"
        >
          <bl-book-suggestions-tile
            :books="books"
            :authors="authors"
            :reload-books="refresh"
          />
        </div>
        <div class="col-span-12 flex flex-col gap-4 2xl:col-span-4">
          <bl-goal-suggestion-tile />
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { IconPlus, IconUpload } from '@tabler/icons-vue'
import type { Author } from '~/types/author'
import type { Book, ViewBook } from '~/types/book'
import type { Collection } from '~/types/collection'
import { useBookLibrary } from '~/composables/use-book-library'
import { getAssetPath } from '~/utils/assets'

const { isLibraryEmpty, getAuthors, getBooks, getCollections, getLatestBooks } =
  useBookLibrary()

const isEmpty = ref<boolean>(false)
const authors = ref<Author[]>([])
const books = ref<Book[]>([])
const collections = ref<Collection[]>([])
const latestBooks = ref<ViewBook[]>([])

const loadData = async () => {
  isEmpty.value = await isLibraryEmpty()
  authors.value = await getAuthors()
  books.value = await getBooks()
  collections.value = await getCollections()
  const allLatestBooks = await getLatestBooks()
  const authorsById = new Map(authors.value.map((a) => [a.id, a.name]))
  latestBooks.value = allLatestBooks.map((book) => ({
    ...book,
    authorName: book.author ? authorsById.get(book.author) : undefined,
  }))
}

const refresh = loadData

onMounted(loadData)

useHead({
  title: 'BookLib | Home',
})
</script>

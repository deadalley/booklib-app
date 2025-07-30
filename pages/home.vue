<template>
  <NuxtLayout name="dashboard" title="Home">
    <div v-if="isEmpty" class="flex flex-col">
      <h1 class="mb-8">Welcome to your new library!</h1>
      <div class="flex flex-col items-center gap-4">
        <img
          :src="getAssetPath('/book-graphics.svg')"
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
      <div class="flex w-full flex-col gap-4 md:flex-row">
        <bl-section-tile icon="IconBooks" href="/library/books">
          <template #label>Books</template>
          <template #total>
            {{ books?.length }}
            {{ (books?.length ?? 0) > 1 ? 'books' : 'book' }}
          </template>
          <NuxtLink
            v-if="!books?.length"
            class="hidden sm:block"
            to="/library/books/new"
          >
            <bl-button>Create a book</bl-button>
          </NuxtLink>
        </bl-section-tile>
        <bl-section-tile icon="IconArchive" href="/library/collections">
          <template #label>Collections</template>
          <template #total>
            {{ collections?.length }}
            {{ (collections?.length ?? 0) > 1 ? 'collections' : 'collection' }}
          </template>
          <NuxtLink
            v-if="!collections?.length"
            class="hidden sm:block"
            to="/library/collections/new"
          >
            <bl-button>Create a collection</bl-button>
          </NuxtLink>
        </bl-section-tile>
        <bl-section-tile icon="IconFeather" href="/library/authors">
          <template #label>Authors</template>
          <template #total>
            <template v-if="authors?.length">
              {{ authors?.length }}
              {{ (authors?.length ?? 0) > 1 ? 'authors' : 'author' }}
            </template>
            <template v-if="!authors?.length"> No authors </template>
          </template>
        </bl-section-tile>
      </div>
      <div v-if="latestBooks?.length" class="flex flex-col gap-8">
        <bl-tile>
          <template #title>Last books added to library</template>
          <div
            class="relative flex size-max w-full gap-x-6 overflow-x-auto p-3 transition duration-100 ease-out"
          >
            <bl-book-card
              v-for="book in latestBooks"
              :key="book.title"
              :book="book"
              class="!w-32 shrink-0"
            />
          </div>
        </bl-tile>
      </div>
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12 flex flex-col lg:col-span-5">
          <bl-book-stats-tile :books="books ?? []" />
        </div>
        <div class="col-span-12 flex flex-col lg:col-span-4">
          <bl-book-suggestions-tile
            :books="books ?? []"
            :authors="authors ?? []"
            :reload-books="refresh"
          />
        </div>
        <div class="col-span-12 flex flex-col gap-4 lg:col-span-3">
          <bl-author-highlight-tile
            v-if="authorsByBookCount?.length"
            :authors="authorsByRatings"
          />

          <bl-author-highlight-tile
            v-if="authorsByBookCount?.length"
            :authors="authorsByBookCount"
          />

          <bl-author-highlight-tile
            v-if="authorsByWithStatuses?.length"
            :authors="authorsByWithStatuses"
          />
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { IconPlus, IconUpload } from '@tabler/icons-vue'
import type { Author } from '~/types/author'
import type { Book } from '~/types/book'
import type { Collection } from '~/types/collection'
import { useBookLibrary } from '~/composables/use-book-library'
import { getAssetPath } from '~/utils/assets'

const { isLibraryEmpty, getAuthors, getBooks, getCollections, getLatestBooks } =
  useBookLibrary()

const isEmpty = ref<boolean>(false)
const authors = ref<Author[]>([])
const books = ref<Book[]>([])
const collections = ref<Collection[]>([])
const latestBooks = ref<Pick<Book, 'id' | 'title' | 'coverSrc'>[]>([])

const loadData = async () => {
  isEmpty.value = await isLibraryEmpty()
  authors.value = await getAuthors()
  books.value = await getBooks()
  collections.value = await getCollections()
  latestBooks.value = (await getLatestBooks()) as Pick<
    Book,
    'id' | 'title' | 'coverSrc'
  >[]
}

const refresh = loadData

onMounted(loadData)

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
      label: 'Total books',
    }),
  ),
)

const authorsByWithStatuses = computed(() =>
  sortAuthorByStatusesCount(books.value ?? [], authors.value ?? []).map(
    (author) => ({
      ...author,
    }),
  ),
)

useHead({
  title: 'BookLib | Home',
})
</script>

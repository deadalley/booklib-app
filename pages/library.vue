<template>
  <NuxtLayout name="dashboard" title="Library" :nav-items="navItems">
    <template #action-btn>
      <bl-search-bar-autocomplete
        v-if="searchGroups.length"
        :groups="searchGroups"
        placeholder="Search books, collections, authors..."
      />
    </template>

    <!-- Error boundary -->
    <NuxtErrorBoundary>
      <template #error="{ error, clearError }">
        <bl-warning-badge>
          <template #icon="iconProps">
            <IconAlertTriangle v-bind="iconProps" class="text-primary" />
          </template>
          <template #title> Something went wrong. </template>
          <template #content>
            <div class="flex flex-col gap-4">
              {{ error.message || 'An unexpected error occurred.' }}
              <bl-button @click="clearError"> Reload page </bl-button>
            </div>
          </template>
        </bl-warning-badge>
      </template>
      <NuxtPage />
    </NuxtErrorBoundary>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { IconAlertTriangle } from '@tabler/icons-vue'
import { useBookLibrary } from '~/composables/use-book-library'
import type { Author } from '~/types/author'
import type { Book } from '~/types/book'
import type { Collection } from '~/types/collection'
import type {
  SearchAutocompleteGroup,
  SearchAutocompleteOption,
} from '~/components/search-bar-autocomplete.vue'

const route = useRoute()

const { isLibraryEmpty, getBooks, getCollections, getAuthors } =
  useBookLibrary()

const isEmpty = ref<boolean>(false)
const searchGroups = ref<SearchAutocompleteGroup[]>([])

onMounted(async () => {
  isEmpty.value = await isLibraryEmpty()
  await refreshSearchGroups()
})

const navItems = [
  {
    to: '/library/books',
    label: 'Books',
  },
  {
    to: '/library/collections',
    label: 'Collections',
  },
  {
    to: '/library/authors',
    label: 'Authors',
  },
]

if (isEmpty.value && !route.path.includes('/new')) {
  navigateTo('/home')
}

watch(
  () => route.fullPath,
  async () => {
    await refreshSearchGroups()
  },
)

async function refreshSearchGroups() {
  const [books, collections, authors] = await Promise.all([
    getBooks(),
    getCollections(),
    getAuthors(),
  ])

  searchGroups.value = buildSearchGroups(books, collections, authors)
}

function buildSearchGroups(
  books: Book[],
  collections: Collection[],
  authors: Author[],
) {
  const authorById = Object.fromEntries(
    authors.map((author) => [author.id, author]),
  )
  const booksByAuthorId = books.reduce<Record<string, number>>((acc, book) => {
    if (book.author) {
      acc[book.author] = (acc[book.author] ?? 0) + 1
    }

    return acc
  }, {})

  const coverByCollectionId = books.reduce<Record<string, string>>(
    (acc, book) => {
      if (!book.coverSrc) {
        return acc
      }

      for (const collectionId of book.collections) {
        if (!acc[collectionId]) {
          acc[collectionId] = book.coverSrc
        }
      }

      return acc
    },
    {},
  )

  const bookOptions: SearchAutocompleteOption[] = books.map((book) => ({
    value: `book:${book.id}`,
    label: book.title,
    subtitle: book.author ? authorById[book.author]?.name : undefined,
    imageSrc: book.coverSrc,
    href: `/library/books/${book.id}`,
    group: 'books',
  }))

  const collectionOptions: SearchAutocompleteOption[] = collections.map(
    (collection) => ({
      value: `collection:${collection.id}`,
      label: collection.name,
      subtitle: `${collection.books.length} ${collection.books.length === 1 ? 'book' : 'books'}`,
      imageSrc: coverByCollectionId[collection.id],
      href: `/library/collections/${collection.id}`,
      group: 'collections',
    }),
  )

  const authorOptions: SearchAutocompleteOption[] = authors.map((author) => ({
    value: `author:${author.id}`,
    label: author.name,
    subtitle: `${booksByAuthorId[author.id] ?? 0} ${(booksByAuthorId[author.id] ?? 0) === 1 ? 'book' : 'books'}`,
    href: '/library/authors',
    group: 'authors',
  }))

  return [
    { label: 'Books', options: bookOptions },
    { label: 'Collections', options: collectionOptions },
    { label: 'Authors', options: authorOptions },
  ].filter((group) => group.options.length)
}

useHead({
  title: 'BookLib | Library',
})
</script>

<template>
  <!-- Desktop: inline search bar -->
  <bl-search-bar-autocomplete
    class="hidden sm:flex"
    :class="{ invisible: isLibraryEmpty }"
    :groups="searchGroups"
    placeholder="Search books, collections, authors..."
  />

  <!-- Mobile: icon button that opens a modal -->
  <button
    v-if="!isLibraryEmpty"
    type="button"
    class="hover:text-primary flex cursor-pointer sm:hidden"
    aria-label="Search"
    @click="mobileOpen = true"
  >
    <IconSearch :size="ICON_SIZE_MEDIUM" stroke="1.5" />
  </button>

  <bl-search-modal
    v-if="mobileOpen"
    :open="mobileOpen"
    :groups="searchGroups"
    @close="mobileOpen = false"
  />
</template>

<script setup lang="ts">
import { IconSearch } from '@tabler/icons-vue'
import { useBookLibrary } from '~/composables/use-book-library'
import type { Author } from '~/types/author'
import type { Book } from '~/types/book'
import type { Collection } from '~/types/collection'
import type {
  SearchAutocompleteGroup,
  SearchAutocompleteOption,
} from '~/components/search-bar-autocomplete.vue'

const route = useRoute()

const mobileOpen = ref(false)

const {
  isLibraryEmpty: checkLibraryEmpty,
  getBooks,
  getCollections,
  getAuthors,
} = useBookLibrary()

const isLibraryEmpty = ref(true)
const searchGroups = ref<SearchAutocompleteGroup[]>([])

onMounted(async () => {
  isLibraryEmpty.value = await checkLibraryEmpty()
  await refreshSearchGroups()
})

watch(
  () => route.fullPath,
  async () => {
    isLibraryEmpty.value = await checkLibraryEmpty()
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
      subtitle: `${collection.books.length} ${
        collection.books.length === 1 ? 'book' : 'books'
      }`,
      imageSrc: coverByCollectionId[collection.id],
      href: `/library/collections/${collection.id}`,
      group: 'collections',
    }),
  )

  const authorOptions: SearchAutocompleteOption[] = authors.map((author) => ({
    value: `author:${author.id}`,
    label: author.name,
    subtitle: `${booksByAuthorId[author.id] ?? 0} ${
      (booksByAuthorId[author.id] ?? 0) === 1 ? 'book' : 'books'
    }`,
    href: '/library/authors',
    group: 'authors',
  }))

  return [
    { label: 'Books', options: bookOptions },
    { label: 'Collections', options: collectionOptions },
    { label: 'Authors', options: authorOptions },
  ].filter((group) => group.options.length)
}
</script>

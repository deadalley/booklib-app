<template>
  <!-- Desktop: inline search bar -->
  <bl-search-bar-autocomplete
    ref="searchBar"
    class="hidden sm:flex"
    :class="{ invisible: isLibraryEmpty }"
    :groups="searchGroups"
    :shortcut="shortcut"
  />

  <!-- Mobile: icon button that opens a modal -->
  <bl-icon-button
    v-if="!isLibraryEmpty"
    variant="tertiary"
    class="sm:hidden"
    aria-label="Search"
    @click="mobileOpen = true"
  >
    <template #default="iconProps">
      <IconSearch v-bind="iconProps" />
    </template>
  </bl-icon-button>

  <bl-search-modal
    v-if="mobileOpen"
    :open="mobileOpen"
    :groups="searchGroups"
    @close="mobileOpen = false"
  />
</template>

<script setup lang="ts">
import { IconSearch } from '@tabler/icons-vue'
import { useEventListener } from '@vueuse/core'
import { useBookLibrary } from '~/composables/use-book-library'
import type { Author } from '~/types/author'
import type { Book } from '~/types/book'
import type { Collection } from '~/types/collection'
import type { Goal } from '~/types/goal'
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
  getGoals,
} = useBookLibrary()

const searchBar = ref<{ $el?: HTMLElement } | null>(null)

// "⌘K" on macOS, "Ctrl K" elsewhere
const shortcut = ref<string>()
onMounted(() => {
  shortcut.value = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘K' : 'Ctrl K'
})

// Ctrl/Cmd+K focuses the search bar, or opens the search on small screens
useEventListener(document, 'keydown', (event: KeyboardEvent) => {
  if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') {
    return
  }
  if (isLibraryEmpty.value) return
  event.preventDefault()
  const input = searchBar.value?.$el?.querySelector?.('input')
  if (input && input.offsetParent !== null) input.focus()
  else mobileOpen.value = true
})

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
  const [books, collections, authors, goals] = await Promise.all([
    getBooks(),
    getCollections(),
    getAuthors(),
    getGoals(),
  ])

  searchGroups.value = buildSearchGroups(books, collections, authors, goals)
}

function buildSearchGroups(
  books: Book[],
  collections: Collection[],
  authors: Author[],
  goals: Goal[],
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
    keywords: bookKeywords(book),
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
    href: `/library/authors/${author.id}`,
    group: 'authors',
  }))

  const goalOptions: SearchAutocompleteOption[] = goals.map((goal) => {
    const resolved = resolveGoal(goal, books)
    return {
      value: `goal:${goal.id}`,
      label: goal.title,
      subtitle: `${formatGoalNumber(goal.amount)} ${getGoalUnit(goal, goal.amount)} ${GOAL_INTERVAL_MAP[goal.interval].description} · ${getGoalStatusLabel(resolved)}`,
      href: `/tracking#goal-${goal.id}`,
      group: 'goals',
    }
  })

  // Log entries with text, newest first
  const noteOptions: SearchAutocompleteOption[] = books
    .flatMap((book) =>
      (book.progress.notes ?? [])
        .filter((note) => !!note.content?.trim())
        .map((note, index) => ({ book, note, index })),
    )
    .sort((a, b) => Date.parse(b.note.createdAt) - Date.parse(a.note.createdAt))
    .map(({ book, note, index }) => ({
      value: `note:${book.id}:${note.id ?? index}`,
      label: note.content.trim(),
      subtitle: [
        book.title,
        note.page !== undefined ? `p. ${note.page}` : null,
        note.createdAt ? toDefaultDate(note.createdAt) : null,
      ]
        .filter(Boolean)
        .join(' · '),
      href: `/library/books/${book.id}`,
      group: 'notes',
    }))

  return [
    { label: 'Books', options: bookOptions },
    { label: 'Collections', options: collectionOptions },
    { label: 'Authors', options: authorOptions },
    { label: 'Goals', options: goalOptions },
    { label: 'Notes', options: noteOptions },
  ].filter((group) => group.options.length)
}

/** Book fields matched besides the title and author */
function bookKeywords(book: Book): SearchAutocompleteOption['keywords'] {
  const keywords: { label: string; value: string }[] = []
  if (book.originalTitle) {
    keywords.push({ label: 'original title', value: book.originalTitle })
  }
  if (book.isbn) {
    keywords.push({ label: 'ISBN', value: book.isbn })
    // Also match an ISBN typed without hyphens or spaces
    const compact = book.isbn.replace(/[\s-]/g, '')
    if (compact !== book.isbn) keywords.push({ label: 'ISBN', value: compact })
  }
  if (book.publisher) {
    keywords.push({ label: 'publisher', value: book.publisher })
  }
  return keywords
}
</script>

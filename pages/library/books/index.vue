<template>
  <NuxtLayout
    name="library"
    title="Books"
    :total="
      sortedBooks.length !== undefined &&
      `${sortedBooks.length} ${sortedBooks.length === 1 ? 'book' : 'books'}`
    "
    :sidebar-content="sidebarContent"
    :loading="loading"
  >
    <template #headerActions>
      <NuxtLink to="/library/books/new">
        <bl-button variant="primary" :expand="isMobile()">
          <template #prependIcon="iconProps">
            <IconPlus v-bind="iconProps" />
          </template>
          Add book
        </bl-button>
      </NuxtLink>
    </template>
    <template #navbar>
      <bl-search-bar @input="onSearch" />
      <bl-view-switch v-model:view="view" show-labels />
      <bl-dropdown
        v-if="view === 'cards'"
        :items="sortDropdownItems"
        @click="onSortByChange"
      >
        {{ sortLabel || 'Sort' }}
      </bl-dropdown>
      <bl-dropdown v-if="view === 'table'" :items="tableColumnsOptions">
        <template #prependIcon="iconProps">
          <IconTable v-bind="iconProps" />
        </template>
        Columns
        <template #item="{ item }">
          <div @click.stop="toggleColumnChecked(item.value as string)">
            <bl-checkbox
              :id="`col-${item.value}`"
              v-model="columnCheckboxStates[item.value as string]"
            >
              {{ item.label }}
            </bl-checkbox>
          </div>
        </template>
      </bl-dropdown>
      <bl-tooltip>
        <template #tooltip-content>Filter</template>
        <bl-button variant="secondary" @click="onFilterOpen">
          <template #prependIcon="iconProps">
            <IconFilter v-bind="iconProps" />
          </template>
          Filter
        </bl-button>
      </bl-tooltip>
      <bl-tooltip>
        <template #tooltip-content>Bulk actions</template>
        <bl-button variant="secondary" @click="editing = true">
          <template #prependIcon="iconProps">
            <IconStack2 v-bind="iconProps" />
          </template>
          Manage
        </bl-button>
      </bl-tooltip>
    </template>
    <bl-empty v-if="books?.length === 0" icon="IconBooks">
      <template #label>There are no books in your library</template>
      <template #action>
        <NuxtLink to="/library/books/new">
          <bl-button>Create a book</bl-button>
        </NuxtLink>
      </template>
    </bl-empty>
    <bl-books-views
      v-if="books.length"
      v-model:current-page="currentPage"
      v-model:books="filteredBooksByPage"
      :editing="editing"
      :view="view"
      :selected-table-columns="selectedTableColumns"
      :total-book-count="sortedBooks.length"
      @update:page="onPageChange"
      @book-select="onBookSelect"
    />
    <bl-empty
      v-if="books?.length >= 0 && sortedBooks?.length === 0"
      icon="IconBooks"
    >
      <template #label>No books found</template>
    </bl-empty>
  </NuxtLayout>
  <bl-sidebar
    :title="sidebarContent"
    :open="!!sidebarContent"
    @close="onCloseSidebar"
  >
    <bl-book-filter
      v-if="sidebarContent === 'Filter'"
      v-model:selected-collections="selectedCollections"
      v-model:selected-author="selectedAuthor"
      v-model:selected-publishers="selectedPublishers"
      v-model:selected-languages="selectedLanguages"
      v-model:selected-original-languages="selectedOriginalLanguages"
      v-model:selected-genres="selectedGenres"
      v-model:selected-statuses="selectedStatuses"
      v-model:selected-property-statuses="selectedPropertyStatuses"
      v-model:selected-formats="selectedFormats"
      v-model:selected-year-range="selectedYearRange"
      v-model:selected-page-range="selectedPageRange"
      v-model:selected-table-columns="selectedTableColumns"
      :publishers="publishers"
      :languages="languages"
      :original-languages="originalLanguages"
      :genres="genres"
      :min-max-year-range="[minYear, maxYear]"
      :min-max-page-range="[minPages, maxPages]"
      :books="books ?? []"
      :collections="collections ?? []"
      :authors="authors ?? []"
      @reset="onResetFilter"
      @apply="onCloseSidebar"
    />
  </bl-sidebar>

  <bl-book-bulk-actions
    v-model="editing"
    :selected-books-count="selectedBooksCount"
    :has-selected-books="hasSelectedBooks"
    :collection-options="collectionActionOptions"
    :author-options="authorActionOptions"
    @close="onCancel"
    @move-to-collection="onMoveBooksToCollection"
    @edit-author="onEditBooksAuthor"
    @delete="onDeleteSelectedBooks"
  />
</template>

<script setup lang="ts">
import type { Book, ViewBook } from '~/types/book'
import { IconPlus, IconFilter, IconTable, IconStack2 } from '@tabler/icons-vue'
import type { DropdownItem } from '~/components/dropdown.vue'
import type { Author } from '~/types/author'
import { indexBy } from 'ramda'
import type { Collection } from '~/types/collection'

const { getBooks, getAuthors, getCollections, updateBook, deleteBooks } =
  useBookLibrary()

const books = ref<Book[]>(await getBooks({ withBookCovers: true }))
const collections = ref<Collection[]>(await getCollections())
const authors = ref<Author[]>(await getAuthors())

const authorsById = computed(() =>
  authors.value ? indexBy(({ id }) => String(id), authors.value) : {},
)

const sortDropdownItems: DropdownItem[] = [
  { label: 'Title (A-Z)', value: 'title-asc' },
  { label: 'Title (Z-A)', value: 'title-desc' },
  { label: 'Author (A-Z)', value: 'author-asc' },
  { label: 'Year (Newest)', value: 'year-desc' },
  { label: 'Rating (Highest)', value: 'rating-desc' },
]

const viewBooks = ref<ViewBook[]>(getBooksWithAuthorNames(books.value))

const editing = ref(false)
const loading = ref(false)

watch(books, (newBooks) => {
  viewBooks.value = getBooksWithAuthorNames(newBooks)
})

const {
  view,
  currentPage,
  sortBy,
  sortedBooks,
  filteredBooksByPage,
  sidebarContent,
  selectedTableColumns,
  minYear,
  maxYear,
  minPages,
  maxPages,
  selectedCollections,
  selectedAuthor,
  selectedPublishers,
  selectedLanguages,
  selectedOriginalLanguages,
  selectedGenres,
  selectedStatuses,
  selectedFormats,
  selectedYearRange,
  selectedPageRange,
  publishers,
  languages,
  originalLanguages,
  genres,
  onFilterOpen,
  onCloseSidebar,
  onResetFilter,
  onSortByChange,
  onSearch,
} = useSortBooks(viewBooks)

const sortLabel = computed(
  () =>
    sortDropdownItems.find(({ value }) => value === sortBy.value)?.label ?? '',
)

const tableColumnsOptions = computed(() =>
  Object.entries(selectedTableColumns.value).map(([value, rest]) => ({
    value,
    ...rest,
  })),
)

const columnCheckboxStates = ref<Record<string, boolean>>({})

watch(
  tableColumnsOptions,
  (columns) => {
    columns.forEach((col) => {
      columnCheckboxStates.value[col.value] = !!col.checked
    })
  },
  { immediate: true, deep: true },
)

function toggleColumnChecked(columnValue: string) {
  const entry =
    selectedTableColumns.value[
      columnValue as keyof typeof selectedTableColumns.value
    ]
  if (entry) {
    entry.checked = !entry.checked
    columnCheckboxStates.value[columnValue] = entry.checked
  }
}

function onPageChange(page: number) {
  currentPage.value = page
}

const selectedBookIds = computed(() =>
  viewBooks.value.filter(({ selected }) => !!selected).map(({ id }) => id),
)
const selectedBooksCount = computed(() => selectedBookIds.value.length)
const hasSelectedBooks = computed(() => selectedBooksCount.value > 0)

const collectionActionOptions = computed(() =>
  collections.value.map(({ id, name }) => ({ value: id, label: name })),
)
const authorActionOptions = computed(() =>
  authors.value.map(({ id, name }) => ({ value: id, label: name })),
)

function clearSelectedBooks() {
  viewBooks.value.forEach((book) => {
    book.selected = false
  })
}

async function refresh() {
  books.value = await getBooks({ withBookCovers: true })
  authors.value = await getAuthors()
}

async function onMoveBooksToCollection(collectionId: string) {
  if (!collectionId || !hasSelectedBooks.value) {
    return
  }

  loading.value = true

  try {
    await Promise.all(
      selectedBookIds.value.map(async (bookId) => {
        const currentBook = books.value.find((book) => book.id === bookId)
        if (!currentBook) return

        const nextCollections = Array.from(
          new Set([...(currentBook.collections ?? []), collectionId]),
        )
        await updateBook(bookId, { collections: nextCollections })
      }),
    )

    await refresh()
    clearSelectedBooks()
    onResetFilter()
  } finally {
    loading.value = false
  }
}

async function onEditBooksAuthor(authorId: string) {
  if (!authorId || !hasSelectedBooks.value) {
    return
  }

  loading.value = true

  try {
    await Promise.all(
      selectedBookIds.value.map((bookId) =>
        updateBook(bookId, { author: authorId }),
      ),
    )

    await refresh()
    clearSelectedBooks()
    onResetFilter()
  } finally {
    loading.value = false
  }
}

async function onDeleteSelectedBooks() {
  if (!hasSelectedBooks.value) {
    return
  }

  loading.value = true

  try {
    await deleteBooks(selectedBookIds.value)

    await refresh()
    clearSelectedBooks()
    onResetFilter()
    editing.value = false
  } finally {
    loading.value = false
  }
}

function updateBookSelection(bookId: Book['id'], selected: boolean) {
  const book = viewBooks.value.find((b) => b.id === bookId)
  if (book) book.selected = selected
}

function onBookSelect({
  bookId,
  selected,
}: {
  bookId: Book['id']
  selected: boolean
}) {
  updateBookSelection(bookId, selected)
}

function onCancel() {
  editing.value = false
  clearSelectedBooks()
}

// TODO: return author name with book from server
function getBooksWithAuthorNames(_books: Book[] | null): ViewBook[] {
  return (_books ?? []).map((book) => ({
    ...book,
    authorName: book.author
      ? authorsById.value[String(book.author)]?.name
      : undefined,
  }))
}
</script>

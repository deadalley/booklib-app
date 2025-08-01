<template>
  <NuxtLayout
    name="library"
    title="Books"
    :total="
      sortedBooks.length &&
      `${sortedBooks.length} ${sortedBooks.length > 1 ? 'books' : 'book'}`
    "
    :sidebar-content="sidebarContent"
    :loading="loading"
  >
    <template #navbar>
      <bl-search-bar @input="onSearch" />
      <NuxtLink class="flex md:inline-flex lg:order-6" to="/library/books/new">
        <bl-button expand>
          <template #prependIcon="prependIcon">
            <IconPlus v-bind="prependIcon" />
          </template>
          Book
        </bl-button>
      </NuxtLink>
      <div class="flex justify-end gap-3">
        <bl-view-switch v-model:view="view" />
        <bl-tooltip>
          <template #tooltip-content>Filter</template>
          <bl-button variant="tertiary" @click="onFilterOpen">
            <template #appendIcon="iconProps">
              <IconFilter v-bind="iconProps" />
            </template>
          </bl-button>
        </bl-tooltip>
        <bl-tooltip v-if="view === 'table'">
          <template #tooltip-content>Table</template>
          <bl-button variant="tertiary" @click="onTableSettingsOpen">
            <template #appendIcon="iconProps">
              <IconTable v-bind="iconProps" />
            </template>
          </bl-button>
        </bl-tooltip>
        <bl-tooltip>
          <template #tooltip-content>Bulk actions</template>
          <bl-button variant="tertiary" @click="editing = true">
            <template #appendIcon="iconProps">
              <IconStack2 v-bind="iconProps" />
            </template>
          </bl-button>
        </bl-tooltip>
      </div>
      <div v-if="editing" class="flex justify-end gap-3">
        <bl-button expand variant="secondary" @click="onCancel">
          Cancel
        </bl-button>
        <bl-dropdown :items="dropdownItems" @click="onActionSelect">
          Select action
        </bl-dropdown>
      </div>
    </template>
    <bl-empty v-if="books?.length === 0" icon="IconBooks">
      <template #label> There are no books in your library </template>
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
  </NuxtLayout>
  <bl-sidebar
    :title="sidebarContent"
    :open="!!sidebarContent"
    @close="onCloseSidebar"
  >
    <bl-book-table-columns-selector
      v-if="sidebarContent === 'Table'"
      v-model:selected-table-columns="selectedTableColumns"
    />
    <bl-book-filter
      v-if="sidebarContent === 'Filter'"
      v-model:selected-collections="selectedCollections"
      v-model:selected-author="selectedAuthor"
      v-model:selected-publishers="selectedPublishers"
      v-model:selected-languages="selectedLanguages"
      v-model:selected-original-languages="selectedOriginalLanguages"
      v-model:selected-genres="selectedGenres"
      v-model:selected-statuses="selectedStatuses"
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
      :authors="authors ?? []"
      @reset="onResetFilter"
      @apply="onCloseSidebar"
    />
  </bl-sidebar>
</template>

<script setup lang="ts">
import type { Book, ViewBook } from '~/types/book'
import { IconPlus, IconFilter, IconTable, IconStack2 } from '@tabler/icons-vue'
import type { DropdownItem } from '~/components/dropdown.vue'
import type { Author } from '~/types/author'
import { indexBy } from 'ramda'

const { getBooks, getAuthors, deleteBooks } = useBookLibrary()

const books = ref<Book[]>(await getBooks({ withBookCovers: true }))
const authors = ref<Author[]>(await getAuthors())

const authorsById = computed(() =>
  authors.value ? indexBy(({ id }) => String(id), authors.value) : {},
)

const dropdownItems: DropdownItem[] = [
  { label: 'Delete', value: 'delete', icon: 'IconTrash' },
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
  onSearch,
  onFilterOpen,
  onTableSettingsOpen,
  onCloseSidebar,
  onResetFilter,
} = useSortBooks(viewBooks)

function onPageChange(page: number) {
  currentPage.value = page
}

async function refresh() {
  books.value = await getBooks({ withBookCovers: true })
  authors.value = await getAuthors()
}

async function onActionSelect(action: string) {
  loading.value = true
  if (action === 'delete') {
    await deleteBooks(
      viewBooks.value.filter(({ selected }) => selected).map(({ id }) => id),
    )
  }
  await refresh()
  editing.value = false
  onResetFilter()
  loading.value = false
}

function onBookSelect({
  bookId,
  selected,
}: {
  bookId: Book['id']
  selected: boolean
}) {
  viewBooks.value = viewBooks.value.map((book) => ({
    ...book,
    selected: book.id === bookId ? selected : book.selected,
  }))
}

function onCancel() {
  editing.value = false
  viewBooks.value = viewBooks.value.map((book) => ({
    ...book,
    selected: false,
  }))
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

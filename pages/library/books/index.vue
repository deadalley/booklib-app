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
      <div class="flex w-full items-start gap-3 xl:flex-row">
        <bl-search-bar @input="onSearch" />
        <bl-view-switch v-model:view="view" />
        <bl-tooltip>
          <template #tooltip-content>Filter</template>
          <bl-button variant="tertiary" @click="onFilterOpen">
            <template #appendIcon="iconProps">
              <IconFilter v-bind="iconProps" />
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
        <bl-tooltip>
          <template #tooltip-content>Table</template>
          <bl-button
            v-if="view === 'table'"
            variant="tertiary"
            @click="onTableSettingsOpen"
          >
            <template #appendIcon="iconProps">
              <IconTable v-bind="iconProps" />
            </template>
          </bl-button>
        </bl-tooltip>
        <bl-button v-if="editing" expand variant="secondary" @click="onCancel">
          Cancel
        </bl-button>
        <bl-dropdown
          v-if="editing"
          :items="dropdownItems"
          @click="onActionSelect"
        >
          Select action
        </bl-dropdown>
      </div>
      <NuxtLink class="flex md:inline-flex" to="/library/books/new">
        <bl-button expand>
          <template #prependIcon="prependIcon">
            <IconPlus v-bind="prependIcon" />
          </template>
          Book
        </bl-button>
      </NuxtLink>
    </template>
    <div
      v-if="books?.length === 0"
      class="flex flex-col items-center justify-center gap-8 rounded-xl bg-accent-light px-4 py-16"
    >
      <IconBooks class="text-accent-dark" size="58" stroke="1" />
      <div class="flex flex-col items-center justify-center gap-4">
        There are no books in your library
        <NuxtLink to="/library/books/new">
          <bl-button>Create a book</bl-button>
        </NuxtLink>
      </div>
    </div>
    <bl-books-views
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
    :is-open="!!sidebarContent"
    :on-close="onCloseSidebar"
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
import {
  IconBooks,
  IconPlus,
  IconFilter,
  IconTable,
  IconStack2,
} from '@tabler/icons-vue'
import type { DropdownItem } from '~/components/dropdown.vue'
import type { Author } from '~/types/author'
import { indexBy } from 'ramda'

const { data: books, refresh } = await useFetch<Book[]>('/api/books', {
  query: { withBookCovers: true },
})
const { data: authors } = await useFetch<Author[]>('/api/authors')

const authorsById = computed(() =>
  authors.value ? indexBy(({ id }) => String(id), authors.value) : {},
)

const dropdownItems: DropdownItem[] = [
  { label: 'Delete books', value: 'delete', icon: 'IconTrash' },
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
  refresh()
}

async function onActionSelect(action: string) {
  try {
    loading.value = true
    if (action === 'delete') {
      await $fetch<Book['id']>('/api/books', {
        method: 'delete',
        body: viewBooks.value
          .filter(({ selected }) => selected)
          .map(({ id }) => id),
      })
    }
  } catch (error) {
    console.error(error)
  } finally {
    await refresh()
    editing.value = false
    onResetFilter()
    loading.value = false
  }
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

function getBooksWithAuthorNames(_books: Book[] | null): ViewBook[] {
  return (_books ?? []).map((book) => ({
    ...book,
    authorName: book.author
      ? authorsById.value[String(book.author)]?.name
      : undefined,
  }))
}
</script>

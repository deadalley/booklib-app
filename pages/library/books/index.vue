<template>
  <NuxtLayout
    name="library"
    title="Books"
    :total="bookCount && `${bookCount} books`"
    :sidebar-content="sidebarContent"
    :loading="loading"
  >
    <template #navbar>
      <div class="flex w-full items-start gap-3 xl:flex-row">
        <bl-search-bar @input="onSearch" />
        <bl-view-switch v-model:view="view" />
        <bl-dropdown
          :with-chevron="false"
          :items="manageDropdownItems"
          align="end"
          @click="onManageItemSelect"
        >
          <IconAdjustmentsHorizontal :size="ICON_SIZE_SMALL" stroke="1.5" />
        </bl-dropdown>
        <bl-dropdown
          v-if="editing"
          :items="dropdownItems"
          @click="onActionSelect"
        >
          Select action
        </bl-dropdown>
        <bl-button v-if="editing" expand variant="secondary" @click="onCancel">
          Cancel
        </bl-button>
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
  IconAdjustmentsHorizontal,
} from '@tabler/icons-vue'
import type { DropdownItem } from '~/components/dropdown.vue'
import type { Author } from '~/types/author'
import { keyBy, property } from 'lodash'

const { data: bookCount } = await useFetch<number>('/api/library/book-count')
const { data: books, refresh } = await useFetch<Book[]>('/api/books', {
  query: { withBookCovers: true },
})
const { data: authors } = await useFetch<Author[]>('/api/authors')

const authorsById = computed(() => keyBy(authors.value, property('id')))

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
  filterCount,
  sidebarContent,
  selectedTableColumns,
  minYear,
  maxYear,
  minPages,
  maxPages,
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

const manageDropdownItems = computed<DropdownItem[]>(
  () =>
    [
      {
        label: `Filters ${filterCount.value ? `(${filterCount.value})` : ''}`,
        value: 'filter',
        icon: 'IconFilter',
      },
      view.value === 'table'
        ? { label: 'Table', value: 'table', icon: 'IconTable' }
        : null,
      { label: 'Manage', value: 'edit', icon: 'IconStack2' },
    ].filter(Boolean) as DropdownItem[],
)

function onPageChange(page: number) {
  currentPage.value = page
  refresh()
}

function onManageItemSelect(item: string) {
  switch (item) {
    case 'filter':
      return onFilterOpen()
    case 'edit':
      editing.value = true
      return
    case 'table':
      onTableSettingsOpen()
      return
    default:
      return
  }
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

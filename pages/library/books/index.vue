<template>
  <NuxtLayout
    name="library"
    title="Books"
    :total="bookCount"
    :sidebar-content="sidebarContent"
  >
    <template #navbar>
      <div class="flex w-full items-start gap-3 xl:flex-row">
        <bl-search-bar @input="onSearch" />
        <bl-button expand variant="secondary" @click="onFilterOpen">
          Filter {{ filterCount ? `(${filterCount})` : '' }}
        </bl-button>
        <bl-view-switch v-model:view="view" />
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
    <bl-books-views
      v-model:current-page="currentPage"
      v-model:books="filteredBooksByPage"
      :view="view"
      :selected-table-columns="selectedTableColumns"
      :total-book-count="sortedBooks.length"
      @update:page="onPageChange"
    />
  </NuxtLayout>
  <bl-sidebar
    :title="sidebarContent"
    :is-open="!!sidebarContent"
    :on-close="onCloseSidebar"
  >
    <bl-book-filter
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
      :on-reset="onResetFilter"
      :on-apply="onCloseSidebar"
    />
  </bl-sidebar>
</template>

<script setup lang="ts">
import type { Book } from '~/types/book'
import { IconPlus } from '@tabler/icons-vue'

const { data: bookCount } = await useFetch<number>('/api/library/book-count')
const { data: books, refresh } = await useFetch<Book[]>('/api/books')

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
  onCloseSidebar,
  onResetFilter,
} = useSortBooks(books)

function onPageChange(page: number) {
  currentPage.value = page
  refresh()
}

definePageMeta({
  middleware: 'auth',
})
</script>

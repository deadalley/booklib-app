<template>
  <NuxtLayout
    name="library"
    title="Books"
    :total="books?.length ?? 0"
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
      :view="view"
      :books="sortedBooks"
      :selected-table-columns="selectedTableColumns"
    />
  </NuxtLayout>
  <bl-sidebar
    :title="sidebarContent"
    :is-open="!!sidebarContent"
    :on-close="onCloseSidebar"
  >
    <bl-book-filter
      v-model:selectedPublishers="selectedPublishers"
      v-model:selectedLanguages="selectedLanguages"
      v-model:selectedOriginalLanguages="selectedOriginalLanguages"
      v-model:selectedYearRange="selectedYearRange"
      v-model:selectedPageRange="selectedPageRange"
      v-model:selectedTableColumns="selectedTableColumns"
      v-model:selectedGenres="selectedGenres"
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

const { data: books } = await useFetch<Book[]>('/api/books')

const {
  view,
  sortedBooks,
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

definePageMeta({
  middleware: 'auth',
})
</script>

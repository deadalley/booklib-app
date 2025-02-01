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
        <bl-button
          v-if="!editing"
          expand
          variant="secondary"
          @click="editing = true"
        >
          Manage
        </bl-button>
        <bl-button
          v-if="editing"
          expand
          variant="secondary"
          @click="editing = false"
        >
          Cancel
        </bl-button>
        <bl-dropdown
          v-if="editing"
          :items="dropdownItems"
          @click="onActionSelect"
        >
          Select action
        </bl-dropdown>
        <bl-button
          v-if="view === 'table'"
          expand
          variant="secondary"
          @click="onTableSettingsOpen"
        >
          Table
          <template #appendIcon="iconProps">
            <IconSettings v-bind="iconProps" />
          </template>
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
    <bl-book-table-columns-selector
      v-if="sidebarContent === 'Table'"
      v-model:selected-table-columns="selectedTableColumns"
    />
    <bl-book-filter
      v-if="sidebarContent === 'Filter'"
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
      @reset="onResetFilter"
      @apply="onCloseSidebar"
    />
  </bl-sidebar>
</template>

<script setup lang="ts">
import type { Book } from '~/types/book'
import { IconPlus, IconSettings } from '@tabler/icons-vue'
import type { DropdownItem } from '~/components/dropdown.vue'

const { data: bookCount } = await useFetch<number>('/api/library/book-count')
const { data: books, refresh } = await useFetch<Book[]>('/api/books')

const dropdownItems: DropdownItem[] = [
  { label: 'Delete books', value: 'delete', icon: 'IconTrash' },
]

const editing = ref(false)

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
  onTableSettingsOpen,
  onCloseSidebar,
  onResetFilter,
} = useSortBooks(books)

function onPageChange(page: number) {
  currentPage.value = page
  refresh()
}

function onActionSelect(action: string) {
  if (action === 'delete') {
    console.log('bruh')
  }
}

definePageMeta({
  middleware: 'auth',
})
</script>

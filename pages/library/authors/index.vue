<template>
  <NuxtLayout
    name="library"
    title="Authors"
    :total="
      sortedAuthors?.length &&
      `${sortedAuthors.length} ${sortedAuthors.length > 1 ? 'authors' : 'author'}`
    "
  >
    <template #navbar>
      <div class="flex w-full items-start gap-3 xl:flex-row">
        <bl-search-bar @input="onSearch" />
        <bl-view-switch
          v-model:view="view"
          :views="['cards', 'expanded-cards']"
        />
      </div>
    </template>
    <div
      v-if="authors?.length === 0"
      class="flex flex-col items-center justify-center gap-8 rounded-xl bg-accent-light px-4 py-16"
    >
      <IconFeather class="text-accent-dark" size="58" stroke="1" />
      <div class="flex flex-col items-center justify-center gap-4">
        There are no authors in your library
      </div>
    </div>
    <div
      v-if="view === 'cards'"
      class="grid h-min w-full grid-cols-1 flex-wrap gap-x-6 gap-y-8 overflow-y-auto overflow-x-visible p-3 md:grid-cols-[repeat(auto-fill,minmax(9rem,1fr))]"
    >
      <bl-collection-card
        v-for="author in filteredAuthorsByPage"
        :key="author.id"
        collection-type="authors"
        :collection="{ ...author, books: booksByAuthorId[author.id] ?? [] }"
        :icon="DEFAULT_COLLECTION_ICONS_FILLED[author.id]"
      />
    </div>
    <div v-if="view === 'expanded-cards'" class="h-full overflow-y-auto">
      <div class="flex flex-col gap-y-4">
        <bl-expanded-collection
          v-for="author in filteredAuthorsByPage"
          :key="author.id"
          collection-type="authors"
          :collection="author"
          :books="booksByAuthorId[author.id] ?? []"
          :icon="DEFAULT_COLLECTION_ICONS_FILLED[author.id]"
          can-delete
        />
      </div>
    </div>
    <div v-if="sortedAuthors.length" class="flex justify-center py-2">
      <bl-pagination
        v-if="sortedAuthors.length && sortedAuthors.length > AUTHORS_PAGE_SIZE"
        v-model="currentPage"
        :total-item-count="sortedAuthors.length"
        :items-per-page="AUTHORS_PAGE_SIZE"
        @update:page="onPageChange"
      />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { IconFeather } from '@tabler/icons-vue'
import type { Book } from '~/types/book'
import type { Author } from '~/types/author'

const { data: books } = await useFetch<Book[]>('/api/books', {
  query: { withBookCovers: true },
})
const { data: authors } = await useFetch<Author[]>('/api/authors')

const booksByAuthorId = computed(() =>
  getBooksByAuthor(books.value ?? [], authors.value ?? []),
)

const { view, currentPage, sortedAuthors, filteredAuthorsByPage, onSearch } =
  useSortAuthors(authors.value ?? [])

function onPageChange(page: number) {
  currentPage.value = page
}
</script>

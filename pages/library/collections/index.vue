<template>
  <NuxtLayout
    name="library"
    title="Collections"
    :total="collections?.length && `${collections.length} collections`"
  >
    <template #navbar>
      <div class="flex w-full items-start gap-3 xl:flex-row">
        <bl-search-bar @input="onSearch" />
        <bl-view-switch
          v-model:view="view"
          :views="['cards', 'expanded-cards']"
        />
      </div>
      <NuxtLink class="flex md:inline-flex" to="/library/collections/new">
        <bl-button expand>
          <template #prependIcon="prependIcon">
            <IconPlus v-bind="prependIcon" />
          </template>
          Collection
        </bl-button>
      </NuxtLink>
    </template>
    <div
      v-if="view === 'cards'"
      class="grid h-min w-full grid-cols-1 flex-wrap gap-x-6 gap-y-8 overflow-y-auto overflow-x-visible p-3 md:grid-cols-[repeat(auto-fill,minmax(9rem,1fr))]"
    >
      <bl-collection-card
        v-for="collection in sortedCollections"
        :key="collection.id"
        :collection="collection"
      />
    </div>
    <div v-if="view === 'expanded-cards'" class="h-full overflow-y-auto">
      <div class="flex flex-col">
        <bl-expanded-collection
          v-for="collection in sortedCollections"
          :key="collection.id"
          :collection="collection"
          :books="booksByCollectionId[collection.id]"
        />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Collection } from '~/types/collection'
import { IconPlus } from '@tabler/icons-vue'
import type { Book, ViewBook } from '~/types/book'
import type { Author } from '~/types/author'

const { data: collections } = await useFetch<Collection[]>('/api/collections')
const { data: books } = await useFetch<Book[]>('/api/books', {
  query: { withBookCovers: true },
})
const { data: authors } = await useFetch<Author[]>('/api/authors')

const booksByCollectionId = computed(
  () =>
    collections.value?.reduce<Record<string, ViewBook[]>>(
      (collectionBooks, collection) => ({
        ...collectionBooks,
        [collection.id]: (books.value ?? [])
          .filter((book) => collection.books.some(({ id }) => id === book.id))
          .map((book) => ({
            ...book,
            order: collection.books.find(({ id }) => id === book.id)?.order,
            authorName: authors.value?.find(({ id }) => id === book.author)
              ?.name,
          })),
      }),
      {},
    ) ?? {},
)

const { view, sortedCollections, onSearch } = useSortCollections(
  collections.value ?? [],
)
</script>

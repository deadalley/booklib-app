<template>
  <NuxtLayout
    name="library"
    title="All Collections"
    :total="collections?.length ?? 0"
  >
    <template #navbar>
      <bl-search-bar @input="onSearch" />
      <bl-view-switch
        v-model:view="view"
        :views="['cards', 'expanded-cards']"
      />
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
      class="grid h-min w-full grid-cols-1 gap-x-6 gap-y-8 overflow-auto pt-1 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-12"
    >
      <bl-collection-card
        v-for="collection in sortedCollections"
        :key="collection.id"
        :collection="collection"
      />
    </div>
    <div class="h-full overflow-y-auto">
      <div v-if="view === 'expanded-cards'" class="flex flex-col">
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
import type { Book } from '~/types/book'

const { data: collections } = await useFetch<Collection[]>('/api/collections')
const { data: books } = await useFetch<Book[]>('/api/books')

const booksByCollectionId = computed(
  () =>
    collections.value?.reduce<Record<string, Book[]>>(
      (collectionBooks, collection) => ({
        ...collectionBooks,
        [collection.id]: (books.value ?? []).filter((book) =>
          collection.books.includes(book.id),
        ),
      }),
      {},
    ) ?? {},
)

const { view, sortedCollections, onSearch } = useSortCollections(
  collections.value ?? [],
)
</script>

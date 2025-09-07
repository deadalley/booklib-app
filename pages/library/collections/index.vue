<template>
  <NuxtLayout
    name="library"
    title="Collections"
    :total="
      sortedCollections?.length &&
      `${sortedCollections.length} ${sortedCollections.length > 1 ? 'collections' : 'collection'}`
    "
  >
    <template #navbar>
      <bl-search-bar @input="onSearch" />
      <NuxtLink
        class="flex md:inline-flex lg:order-6"
        to="/library/collections/new"
      >
        <bl-button expand>
          <template #prependIcon="prependIcon">
            <IconPlus v-bind="prependIcon" />
          </template>
          Collection
        </bl-button>
      </NuxtLink>
      <div class="flex justify-end gap-3">
        <bl-view-switch
          v-model:view="view"
          :views="['cards', 'expanded-cards']"
        />
      </div>
    </template>
    <bl-empty v-if="collections?.length === 0" icon="IconArchive">
      <template #label> There are no collections in your library </template>
      <template #action>
        <NuxtLink to="/library/collections/new">
          <bl-button>Create a collection</bl-button>
        </NuxtLink>
      </template>
    </bl-empty>
    <div
      v-if="view === 'cards'"
      class="grid h-min w-full grid-cols-1 flex-wrap gap-x-6 gap-y-8 overflow-y-auto overflow-x-visible p-3 md:grid-cols-[repeat(auto-fill,minmax(9rem,1fr))]"
    >
      <bl-collection-card
        v-for="collection in filteredCollectionsByPage"
        :key="collection.id"
        collection-type="collections"
        :collection="collection"
        :icon="DEFAULT_COLLECTION_ICONS_FILLED[collection.id]"
      />
    </div>
    <div v-if="view === 'expanded-cards'" class="h-full overflow-y-auto">
      <div class="flex flex-col gap-y-4">
        <bl-expanded-collection
          v-for="collection in filteredCollectionsByPage"
          :key="collection.id"
          collection-type="collections"
          :collection="collection"
          :books="booksByCollectionId[collection.id] ?? []"
          :icon="DEFAULT_COLLECTION_ICONS_FILLED[collection.id]"
          :can-delete="!DEFAULT_COLLECTIONS.includes(collection.id)"
          @delete="deleteCollection"
        />
      </div>
    </div>
    <div v-if="sortedCollections.length" class="flex justify-center py-2">
      <bl-pagination
        v-if="
          sortedCollections.length &&
          sortedCollections.length > COLLECTIONS_PAGE_SIZE
        "
        v-model="currentPage"
        :total-item-count="sortedCollections.length"
        :items-per-page="COLLECTIONS_PAGE_SIZE"
        @update:page="onPageChange"
      />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useBookLibrary } from '~/composables/use-book-library'
import type { Collection } from '~/types/collection'
import { IconPlus } from '@tabler/icons-vue'
import type { Book } from '~/types/book'
import type { Author } from '~/types/author'

const {
  getCollections,
  getBooks,
  getAuthors,
  deleteCollection: _deleteCollection,
} = useBookLibrary()

const collections = ref<Collection[]>(await getCollections())
const books = ref<Book[]>(await getBooks({ withBookCovers: true }))
const authors = ref<Author[]>(await getAuthors())

const booksByCollectionId = computed(() =>
  getBooksByCollection(
    books.value ?? [],
    collections.value ?? [],
    authors.value ?? [],
  ),
)

const {
  view,
  currentPage,
  sortedCollections,
  filteredCollectionsByPage,
  onSearch,
} = useSortCollections(collections)

function onPageChange(page: number) {
  currentPage.value = page
}

async function refresh() {
  books.value = await getBooks({ withBookCovers: true })
  collections.value = await getCollections()
}

async function deleteCollection(id: string | number, deleteBooks: boolean) {
  await _deleteCollection(id as string, deleteBooks)
  await refresh()
}
</script>

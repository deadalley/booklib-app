<template>
  <bl-entity-page
    v-if="collection"
    kind="collection"
    :entity="collection"
    :books="books"
    :can-delete="!DEFAULT_COLLECTIONS.includes(collection.id)"
    @delete="onDelete"
  />
</template>

<script setup lang="ts">
import { useBookLibrary } from '~/composables/use-book-library'
import type { ViewBook } from '~/types/book'
import type { Collection } from '~/types/collection'

const { getCollection, getBooks, getAuthors, deleteCollection } =
  useBookLibrary()

const route = useRoute()

const collection = ref<Collection>()
const books = ref<ViewBook[]>([])

async function fetchCollection() {
  const id = route.params.id as string
  const [data, allBooks, authors] = await Promise.all([
    getCollection(id),
    getBooks({ withBookCovers: true }),
    getAuthors(),
  ])

  if (!data) {
    navigateTo('/library/collections')
    return
  }

  collection.value = data
  books.value = sortBooksByOrder(
    data.books.flatMap(({ id: bookId, order }) => {
      const book = allBooks.find(({ id }) => id === bookId)

      return book
        ? [
            {
              ...book,
              order,
              authorName: authors.find(({ id }) => id === book.author)?.name,
            },
          ]
        : []
    }),
  )
}

async function onDelete(deleteBooks: boolean) {
  await deleteCollection(route.params.id as string, deleteBooks)
  navigateTo('/library/collections')
}

onMounted(fetchCollection)

useHead({
  title: 'BookLib | My Library',
})
</script>

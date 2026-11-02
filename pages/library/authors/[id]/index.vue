<template>
  <bl-entity-page
    v-if="author"
    kind="author"
    :entity="author"
    :books="books"
    can-delete
    @delete="onDelete"
  />
</template>

<script setup lang="ts">
import { useBookLibrary } from '~/composables/use-book-library'
import type { Author } from '~/types/author'
import type { ViewBook } from '~/types/book'

const { getAuthors, getBooks, deleteAuthor } = useBookLibrary()

const route = useRoute()

const author = ref<Author>()
const books = ref<ViewBook[]>([])

async function fetchAuthor() {
  const id = route.params.id as string
  const [authors, allBooks] = await Promise.all([
    getAuthors(),
    getBooks({ withBookCovers: true }),
  ])

  const data = authors.find((a) => a.id === id)

  if (!data) {
    navigateTo('/library/authors')
    return
  }

  author.value = data
  books.value = allBooks
    .filter((book) => book.author === id)
    .map((book) => ({ ...book, authorName: data.name }))
    .sort((a, b) =>
      a.title.localeCompare(b.title, undefined, { numeric: true }),
    )
}

async function onDelete(deleteBooks: boolean) {
  await deleteAuthor(route.params.id as string, deleteBooks)
  navigateTo('/library/authors')
}

onMounted(fetchAuthor)

useHead({
  title: 'BookLib | My Library',
})
</script>

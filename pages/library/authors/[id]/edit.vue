<template>
  <bl-entity-edit-page
    v-if="author"
    kind="author"
    :initial-name="author.name"
    :books="books"
    :initial-selected-ids="initialSelectedIds"
    @cancel="navigateTo(detailHref)"
    @save="onSave"
  />
</template>

<script setup lang="ts">
import { useBookLibrary } from '~/composables/use-book-library'
import type { Author } from '~/types/author'
import type { Book, ViewBook } from '~/types/book'

const { getAuthors, getBooks, updateAuthor } = useBookLibrary()

const route = useRoute()

const author = ref<Author>()
const books = ref<ViewBook[]>([])

const authorId = computed(() => route.params.id as string)
const detailHref = computed(() => `/library/authors/${authorId.value}`)

const initialSelectedIds = computed(() =>
  books.value
    .filter(({ author }) => author === authorId.value)
    .sort((a, b) =>
      a.title.localeCompare(b.title, undefined, { numeric: true }),
    )
    .map(({ id }) => id),
)

async function fetchData() {
  const [authors, allBooks] = await Promise.all([
    getAuthors(),
    getBooks({ withBookCovers: true }),
  ])

  const data = authors.find(({ id }) => id === authorId.value)

  if (!data) {
    navigateTo('/library/authors')
    return
  }

  books.value = allBooks.map((book) => ({
    ...book,
    authorName: authors.find(({ id }) => id === book.author)?.name,
  }))
  author.value = data
}

async function onSave({
  name,
  selectedIds,
}: {
  name: string
  selectedIds: Book['id'][]
}) {
  await updateAuthor(authorId.value, { name, bookIds: selectedIds })
  navigateTo(detailHref.value)
}

onMounted(fetchData)

useHead({
  title: 'BookLib | My Library',
})
</script>

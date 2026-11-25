<template>
  <bl-entity-page
    v-if="collection"
    kind="collection"
    :entity="collection"
    :books="books"
    :can-delete="!DEFAULT_COLLECTIONS.includes(collection.id)"
    reorderable
    pickable
    shareable
    @delete="onDelete"
    @share="onShare"
    @reorder="onReorder"
    @pick="pickerOpen = true"
  />
  <bl-next-read-picker
    v-if="collection"
    v-model="pickerOpen"
    :sources="pickerSources"
    :authors="authors"
    :library="library"
    :tbr-ids="tbrIds"
    @started="onStarted"
  />
  <bl-toast
    :message="toast?.message ?? null"
    :action-label="toast?.bookId ? 'View book' : undefined"
    @action="navigateTo(`/library/books/${toast?.bookId}`)"
  />
</template>

<script setup lang="ts">
import { useBookLibrary } from '~/composables/use-book-library'
import type { Author } from '~/types/author'
import type { Book, ViewBook } from '~/types/book'
import type { Collection } from '~/types/collection'
import { bookToRecord, listFileName, serializeList } from '~/services/transfer'

const TOAST_MS = 2600

const {
  getCollection,
  getBooks,
  getAuthors,
  deleteCollection,
  updateCollection,
} = useBookLibrary()

const route = useRoute()

const collection = ref<Collection>()
const books = ref<ViewBook[]>([])
const library = ref<Book[]>([])
const authors = ref<Author[]>([])
const tbrIds = ref<string[]>([])
const pickerOpen = ref(false)
const toast = ref<{ message: string; bookId?: string } | null>(null)

const orderedIds = (data: Collection | null | undefined) =>
  [...(data?.books ?? [])].sort((a, b) => a.order - b.order).map(({ id }) => id)

async function fetchCollection() {
  const id = route.params.id as string
  const [data, allBooks, allAuthors, tbr] = await Promise.all([
    getCollection(id),
    getBooks({ withBookCovers: true }),
    getAuthors(),
    getCollection(TBR_COLLECTION_ID),
  ])

  if (!data) {
    navigateTo('/library/collections')
    return
  }

  collection.value = data
  library.value = allBooks
  authors.value = allAuthors
  tbrIds.value = orderedIds(tbr)
  books.value = sortBooksByOrder(
    data.books.flatMap(({ id: bookId, order }) => {
      const book = allBooks.find(({ id }) => id === bookId)

      return book
        ? [
            {
              ...book,
              order,
              authorName: allAuthors.find(({ id }) => id === book.author)?.name,
            },
          ]
        : []
    }),
  )
}

// This collection first; any unstarted book as the alternative
const pickerSources = computed(() => [
  {
    id: 'collection',
    label: collection.value?.name ?? '',
    books: books.value,
    // To Be Read is a queue: Smart pick favours its top
    queue: collection.value?.id === TBR_COLLECTION_ID,
  },
  { id: 'all', label: 'All books', books: library.value },
])

async function onReorder(bookIds: Book['id'][]) {
  const id = route.params.id as string
  await updateCollection(id, {
    books: bookIds.map((bookId, order) => ({ id: bookId, order })),
  })
  if (id === TBR_COLLECTION_ID) tbrIds.value = bookIds
  books.value = bookIds.flatMap((bookId, order) => {
    const book = books.value.find(({ id }) => id === bookId)
    return book ? [{ ...book, order }] : []
  })
}

let toastTimer: ReturnType<typeof setTimeout> | undefined
function showToast(message: string, bookId?: string) {
  toast.value = { message, bookId }
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = null), TOAST_MS)
}

async function onStarted(book: Book) {
  showToast(`Started ${book.title} · Added to Reading`, book.id)
  await fetchCollection()
}

// The books (without ratings, progress or notes) as a file to import into
// another BookLib: the share sheet where there is one, otherwise a download
async function onShare() {
  if (!collection.value) return
  const authorsById = new Map(authors.value.map((a) => [a.id, a]))
  const name = listFileName(collection.value.name)
  const text = serializeList(
    collection.value.name,
    books.value.map((book) => bookToRecord(book, authorsById)),
  )
  const file = new File([text], name, { type: 'application/json' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: collection.value.name })
    } catch {
      // Cancelled from the share sheet
    }
    return
  }
  downloadFile(name, text, 'application/json')
  showToast(`Saved ${name}. Import it from Data Management.`)
}
onBeforeUnmount(() => clearTimeout(toastTimer))

async function onDelete(deleteBooks: boolean) {
  await deleteCollection(route.params.id as string, deleteBooks)
  navigateTo('/library/collections')
}

onMounted(fetchCollection)

useHead({
  title: 'BookLib | My Library',
})
</script>

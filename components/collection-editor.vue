<template>
  <bl-entity-edit-page
    v-if="loaded"
    kind="collection"
    :is-new="!collectionId"
    :initial-name="collection?.name ?? ''"
    :books="books"
    :initial-selected-ids="initialSelectedIds"
    @cancel="onCancel"
    @save="onSave"
  />
</template>

<script setup lang="ts">
import { useBookLibrary } from '~/composables/use-book-library'
import type { Book, ViewBook } from '~/types/book'
import type { Collection } from '~/types/collection'

const props = defineProps<{ collectionId?: string }>()

const {
  getCollection,
  getBooks,
  getAuthors,
  createCollection,
  updateCollection,
} = useBookLibrary()

const loaded = ref(false)
const collection = ref<Collection | null>(null)
const books = ref<ViewBook[]>([])

const initialSelectedIds = computed(() =>
  [...(collection.value?.books ?? [])]
    .sort((a, b) => a.order - b.order)
    .map(({ id }) => id),
)

const detailHref = computed(() =>
  props.collectionId
    ? `/library/collections/${props.collectionId}`
    : '/library/collections',
)

async function fetchData() {
  const [data, allBooks, authors] = await Promise.all([
    props.collectionId ? getCollection(props.collectionId) : null,
    getBooks({ withBookCovers: true }),
    getAuthors(),
  ])

  if (props.collectionId && !data) {
    navigateTo('/library/collections')
    return
  }

  collection.value = data
  books.value = allBooks.map((book) => ({
    ...book,
    authorName: authors.find(({ id }) => id === book.author)?.name,
  }))
  loaded.value = true
}

function onCancel() {
  navigateTo(detailHref.value)
}

async function onSave({
  name,
  selectedIds,
}: {
  name: string
  selectedIds: Book['id'][]
}) {
  const booksInCollection = selectedIds.map((id, order) => ({ id, order }))

  if (props.collectionId) {
    await updateCollection(props.collectionId, {
      name,
      books: booksInCollection,
    })
    navigateTo(detailHref.value)
  } else {
    const created = await createCollection({
      name,
      books: booksInCollection,
    } as Collection)
    navigateTo(
      created ? `/library/collections/${created.id}` : '/library/collections',
    )
  }
}

onMounted(fetchData)
</script>

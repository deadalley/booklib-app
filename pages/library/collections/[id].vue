<template>
  <div
    v-if="collection"
    class="flex flex-1 flex-col gap-10 overflow-visible 2xl:w-9/12"
  >
    <header class="flex flex-col gap-6">
      <button
        class="flex items-center gap-2 hover:text-main"
        @click="$router.back()"
      >
        <IconArrowLeft :size="ICON_SIZE_SMALL" stroke="1.5" />
        <h6>Back</h6>
      </button>
      <div class="flex flex-col items-start justify-between gap-3 md:flex-row">
        <div class="flex flex-col">
          <div class="flex w-full flex-1 items-center gap-5 sm:w-[unset]">
            <h2 class="flex items-end leading-none">
              {{ isNew ? 'New Collection' : collection.name }}
            </h2>
            <div class="flex gap-2">
              <div v-if="editing" class="flex w-full justify-start gap-2">
                <bl-button variant="secondary" @click="onCancel">
                  {{ isNew ? 'Cancel' : 'Discard changes' }}
                </bl-button>
                <bl-button @click="onSubmit(collection)">{{
                  isNew ? 'Create collection' : 'Save changes'
                }}</bl-button>
              </div>

              <bl-button
                v-if="!editing"
                variant="secondary"
                @click="onEdit(true)"
              >
                <template #prependIcon>
                  <IconEdit :size="ICON_SIZE_SMALL" stroke="1.5" />
                </template>
              </bl-button>

              <bl-modal
                v-if="
                  !isNew &&
                  !editing &&
                  !DEFAULT_COLLECTIONS.includes(String(collection?.id))
                "
                size="sm"
                @confirm="deleteCollection"
              >
                <template #trigger>
                  <bl-button variant="secondary">
                    <template #prependIcon>
                      <IconTrash :size="ICON_SIZE_SMALL" stroke="1.5" />
                    </template>
                  </bl-button>
                </template>
                <template #title>
                  Are you sure you want to delete
                  <strong class="contents">{{ collection.name }}</strong>
                  ?
                </template>
                <bl-checkbox v-model="deleteBooks" align="left">
                  <template v-if="!deleteBooks">
                    Your books will <strong>not</strong> be deleted.
                  </template>
                  <template v-if="deleteBooks">
                    Your books <strong>will</strong> be deleted.
                  </template>
                  This action cannot be undone.
                </bl-checkbox>
                <template #cancel-label> Cancel </template>
                <template #action-label> Delete </template>
              </bl-modal>
            </div>
          </div>
        </div>
        <div
          class="flex w-full flex-col-reverse items-end gap-3 sm:w-[unset] sm:flex-row"
        >
          <bl-view-switch v-model:view="view" />
          <div v-if="!isNew" class="flex flex-col justify-end leading-tight">
            <p>Added on</p>
            <h6 class="w-max">{{ formattedDate }}</h6>
          </div>
        </div>
      </div>
    </header>
    <div class="flex flex-1 flex-col gap-10 lg:flex-row lg:overflow-auto">
      <ClientOnly>
        <div
          class="flex flex-col gap-16 overflow-y-auto md:flex-1 lg:flex-[2] [&>.form-form]:h-full"
        >
          <FormKit
            v-model="collection"
            type="form"
            :actions="false"
            @submit="onSubmit"
          >
            <div class="form-section">
              <bl-input id="id" type="hidden" name="id" />
              <div class="form-row">
                <bl-input
                  id="name"
                  :editing="editing"
                  :hidden="!editing"
                  name="name"
                  label="Name"
                  placeholder="Name"
                />
              </div>
            </div>

            <bl-books-views
              v-if="!!selectedBooks.length || managingBooks"
              v-model:selected-books="selectedBooks"
              v-model:not-selected-books="notSelectedBooks"
              v-model:books="allBooks"
              :view="view"
              interactive
              :editing="managingBooks"
              :selected-table-columns="selectedTableColumns"
              @book-select="onSelectBook"
              @book-drag="onDragBook"
            />

            <section
              v-if="!selectedBooks.length && !editing"
              class="flex flex-col items-center gap-3 py-24"
            >
              <p>There are no books in this collection.</p>
            </section>
          </FormKit>
        </div>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconArrowLeft, IconEdit, IconTrash } from '@tabler/icons-vue'
import { useBookLibrary } from '~/composables/use-book-library'
import type { Author } from '~/types/author'
import type { Book, ViewBook } from '~/types/book'
import type { Collection } from '~/types/collection'

const {
  getCollection,
  getBooks,
  getAuthors,
  deleteCollection: _deleteCollectionService,
  createCollection,
  updateCollection,
} = useBookLibrary()

const route = useRoute()

const isNew = computed(() => route.params.id === 'new')

const managingBooks = ref(isNew.value)
const editing = ref(isNew.value)
const collection = ref<Collection>()
const loading = ref(false)
const allBooks = ref<ViewBook[]>([])
const deleteBooks = ref(false)

const formattedDate = computed(() =>
  toFullDateCompact(collection.value?.createdAt),
)

const { view, selectedBooks, notSelectedBooks, selectedTableColumns } =
  useSortBooksByOrder(allBooks)

watch(isNew, () => {
  managingBooks.value = isNew.value
})

async function fetchCollection() {
  loading.value = true
  if (route.params.id === 'new') {
    collection.value = {} as Collection
  } else {
    const data = await getCollection(route.params.id as string)
    collection.value = data || ({} as Collection)
  }

  const books = await getBooks({ withBookCovers: true })
  const authors = await getAuthors()

  allBooks.value = getBooksFromCollection(collection.value!, books, authors)
  loading.value = false
}

async function deleteCollection() {
  await _deleteCollectionService(route.params.id as string, deleteBooks.value)
  navigateTo('/library/collections')
}

function onEdit(value: boolean) {
  editing.value = value
  managingBooks.value = value
}

async function onCancel() {
  if (isNew.value) {
    navigateTo('/library/collections')
  } else {
    if (collection.value) {
      const books = await getBooks({ withBookCovers: true })
      const authors = await getAuthors()

      allBooks.value = getBooksFromCollection(collection.value, books, authors)
    }
    onEdit(false)
  }
}

async function onSubmit(collection: Pick<Collection, 'id' | 'name'>) {
  const booksInCollection = allBooks.value
    .filter(({ selected }) => !!selected)
    .map(({ id, order }) => ({ id, order }))

  if (isNew.value) {
    await createCollection({
      ...collection,
      books: booksInCollection,
    } as Collection)
  } else {
    await updateCollection(collection.id!, {
      ...collection,
      books: booksInCollection,
    } as Collection)
  }

  navigateTo('/library/collections')
}

function onSelectBook({
  bookId,
  selected,
}: {
  bookId: Book['id']
  selected: boolean
}) {
  const selectedBookOrder = allBooks.value.find(
    ({ id }) => id === bookId,
  )?.order
  allBooks.value = allBooks.value.map((book) =>
    book.id === bookId
      ? {
          ...book,
          selected: selected,
          order: selected ? selectedBooks.value.length : undefined,
        }
      : selected ||
          selectedBookOrder === undefined ||
          book.order === undefined ||
          book.order < selectedBookOrder
        ? book
        : { ...book, order: book.order - 1 },
  )
}

function onDragBook({
  newOrder,
  oldOrder,
}: {
  bookId: Book['id']
  newOrder: number
  oldOrder: number
}) {
  allBooks.value = allBooks.value.map((book) => ({
    ...book,
    order: setBookOrder(book.order, newOrder, oldOrder),
  }))
}

function getBooksFromCollection(
  collection: Collection,
  books: Book[],
  authors: Author[],
): ViewBook[] {
  return books.map((book) => ({
    ...book,
    selected: !!collection?.books?.some(({ id }) => id === book.id),
    order: collection?.books?.find(({ id }) => id === book.id)?.order,
    authorName: authors.find(({ id }) => id === book.author)?.name,
  }))
}

function setBookOrder(
  bookOrder: ViewBook['order'],
  newOrder: number,
  oldOrder: number,
) {
  // book is not ordered
  if (bookOrder === undefined) {
    return bookOrder
  }

  // book was moved
  if (bookOrder === oldOrder) {
    return newOrder
  }

  // book was pushed forward, all books in range must be pushed back
  if (newOrder > oldOrder && bookOrder >= oldOrder && bookOrder <= newOrder) {
    return bookOrder - 1
  }

  // book was pushed backward, all books in range must be pushed foward
  if (newOrder < oldOrder && bookOrder >= newOrder && bookOrder <= oldOrder) {
    return bookOrder + 1
  }

  return bookOrder
}

onMounted(() => {
  fetchCollection()
})

useHead({
  title: 'BookLib | My Library',
})

definePageMeta({
  alias: ['/new'],
})
</script>

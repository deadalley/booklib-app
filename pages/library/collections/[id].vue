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
      <div
        class="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center"
      >
        <div class="flex items-center gap-5">
          <h2 class="flex items-end leading-none">
            {{ isNew ? 'New Collection' : collection.name }}
          </h2>
        </div>
        <div
          v-if="!isNew"
          class="flex w-full flex-col items-start gap-3 md:w-[unset] md:flex-row md:items-end"
        >
          <div
            class="order-3 flex w-full flex-col items-start gap-2 md:order-none md:flex-row md:items-end"
          >
            <bl-button
              v-if="!editing"
              variant="secondary"
              class="w-full"
              @click="onEdit(true)"
            >
              Edit
            </bl-button>

            <div v-if="editing" class="flex justify-end gap-2">
              <bl-button variant="secondary" @click="onCancel">
                {{ isNew ? 'Cancel' : 'Discard changes' }}
              </bl-button>
              <bl-button @click="onSubmit(collection)">{{
                isNew ? 'Create collection' : 'Save changes'
              }}</bl-button>
            </div>

            <bl-modal
              v-if="!isNew && !editing"
              ref="deleteModalRef"
              size="sm"
              @confirm="deleteCollection"
            >
              <template #trigger>
                <bl-button @click="openDeleteModal">Delete</bl-button>
              </template>
              <template #title>
                Are you sure you want to delete
                <strong>{{ collection.name }}</strong>
                ?
              </template>
              Your books will <strong>not</strong> be deleted. This action
              cannot be undone.
              <template #cancel-label> Cancel </template>
              <template #action-label> Delete </template>
            </bl-modal>
            <bl-view-switch v-model:view="view" />
          </div>
          <div class="flex flex-col justify-end leading-tight">
            <p>Added on</p>
            <h6 class="w-max">{{ formattedDate }}</h6>
          </div>
        </div>
      </div>
    </header>

    <div class="flex flex-1 flex-col gap-10 lg:flex-row lg:overflow-auto">
      <ClientOnly>
        <div
          class="flex flex-col gap-16 overflow-y-auto md:flex-1 lg:flex-[2] [&>.formkit-form]:h-full"
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
              :view="view"
              interactive
              :editing="managingBooks"
              :selected-table-columns="selectedTableColumns"
              @book-select="onSelectBook"
              @book-drag="onDragBook"
            />

            <section
              v-if="!selectedBooks.length"
              class="flex flex-col items-center gap-3 py-24"
            >
              <p>There are no books in this collection.</p>
            </section>

            <div v-if="editing" class="flex justify-end gap-2">
              <bl-button variant="secondary" @click="onCancel">
                {{ isNew ? 'Cancel' : 'Discard changes' }}
              </bl-button>
              <FormKit type="submit">
                <bl-button type="submit">{{
                  isNew ? 'Create collection' : 'Save changes'
                }}</bl-button>
              </FormKit>
            </div>
          </FormKit>
        </div>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconArrowLeft } from '@tabler/icons-vue'
import { format } from 'date-fns'
import type { Author } from '~/types/author'
import type { Book, ViewBook } from '~/types/book'
import type { Collection } from '~/types/collection'

const route = useRoute()

const isNew = computed(() => route.params.id === 'new')

const managingBooks = ref(isNew.value)
const editing = ref(isNew.value)
const deleteModalRef = ref()
const collection = ref<Collection>()
const loading = ref(false)
const allBooks = ref<ViewBook[]>([])

const formattedDate = computed(() =>
  format(collection.value?.createdAt ?? '', 'dd MMM yyyy'),
)

const { view, selectedBooks, notSelectedBooks, selectedTableColumns } =
  useSortBooksByOrder(allBooks)

watch(isNew, () => {
  managingBooks.value = isNew.value
})

function openDeleteModal() {
  deleteModalRef.value.setIsOpen(true)
}

async function fetchCollection() {
  loading.value = true
  if (route.params.id === 'new') {
    collection.value = {} as Collection
  } else {
    const data = await $fetch<Collection>(
      `/api/collections/${route.params.id}`,
      {},
    )
    collection.value = data
  }

  const books = await $fetch<Book[]>('/api/books', {
    query: { withBookCovers: true },
  })

  const authors = await $fetch<Author[]>('/api/authors')

  allBooks.value = getBooksFromCollection(collection.value, books, authors)
  loading.value = false
}

async function deleteCollection() {
  await $fetch<Collection>(`/api/collections/${route.params.id}`, {
    method: 'delete',
  })

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
      const books = await $fetch<Book[]>('/api/books', {
        query: { withBookCovers: true },
      })

      const authors = await $fetch<Author[]>('/api/authors')

      allBooks.value = getBooksFromCollection(collection.value, books, authors)
    }
    onEdit(false)
  }
}

async function onSubmit(collection: Pick<Collection, 'id' | 'name'>) {
  try {
    const booksInCollection = allBooks.value
      .filter(({ selected }) => !!selected)
      .map(({ id, order }) => ({ id, order }))

    const updatedCollection = await $fetch<Collection>('/api/collections', {
      method: 'post',
      body: { ...collection, books: booksInCollection },
    })

    if (updatedCollection) {
      navigateTo('/library/collections')
    }
  } catch (error) {
    console.error(error)
  }
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

<template>
  <div
    v-if="collection"
    class="flex flex-1 flex-col gap-10 lg:w-9/12 lg:overflow-auto"
  >
    <header class="flex flex-col gap-2">
      <div class="flex items-end justify-between gap-3">
        <div class="flex gap-5">
          <h2 class="flex items-end leading-none">
            {{ isNew ? 'New Collection' : collection.name }}
          </h2>
        </div>
        <div v-if="!isNew" class="flex gap-3">
          <bl-button variant="secondary" @click="onEdit(true)">Edit</bl-button>
          <div class="flex flex-col justify-end leading-tight">
            <p>Added on</p>
            <h6>{{ formattedDate }}</h6>
          </div>
        </div>
      </div>
    </header>
    <div class="flex flex-1 flex-col gap-10 lg:flex-row lg:overflow-auto">
      <div class="flex flex-col gap-16 overflow-y-auto md:flex-1 lg:flex-[2]">
        <section v-if="editing" class="book-section">
          <ClientOnly>
            <FormKit
              type="form"
              :value="collection"
              :actions="false"
              @submit="onSubmit"
            >
              <bl-input id="id" type="hidden" name="id" />
              <div class="form-section">
                <div class="form-row">
                  <bl-input
                    id="name"
                    :editing="editing"
                    name="name"
                    label="Name"
                    placeholder="Name"
                  />
                </div>
              </div>
              <div v-if="editing" class="flex justify-end gap-2">
                <bl-button compact variant="secondary" @click="onCancel"
                  >Discard</bl-button
                >
                <FormKit type="submit">
                  <bl-button type="submit" compact>Save</bl-button>
                </FormKit>
              </div>
            </FormKit>
          </ClientOnly>
        </section>
        <section class="book-section flex flex-col items-end gap-4">
          <div class="flex justify-end gap-3">
            <bl-view-switch v-model:view="view" />
            <bl-button
              v-if="!managingBooks"
              variant="secondary"
              @click="managingBooks = true"
              >Manage books</bl-button
            >
            <bl-button
              v-if="managingBooks"
              variant="secondary"
              @click="onCancelBooks"
              >Cancel</bl-button
            >
            <bl-button
              v-if="managingBooks"
              variant="primary"
              @click="onSaveBooks"
              >Save</bl-button
            >
          </div>
          <bl-books-views
            :view="view"
            :books="sortedBooks"
            :small="true"
            :selectable="managingBooks"
            :selected-table-columns="selectedTableColumns"
            @book-select="onSelectBook"
          />
        </section>
        <section v-if="!isNew" class="book-section">
          <h5>Delete collection</h5>
          <div class="flex justify-between gap-3">
            <p>
              Are you sure you want to delete this collection? This action
              cannot be undone.
            </p>
            <bl-button compact @click="openDeleteModal">Delete</bl-button>
          </div>
          <bl-modal ref="deleteModalRef" :on-confirm="deleteCollection">
            <template #title
              >Are you sure you want to delete
              <strong>{{ collection.name }}</strong
              >?</template
            >
            This action cannot be undone.
            <template #cancel-label> Cancel </template>
            <template #action-label> Delete </template>
          </bl-modal>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import type { Book } from '~/types/book'
import type { Collection } from '~/types/collection'

const route = useRoute()

const { data: books } = await useFetch<Book[]>('/api/books')

const isNew = computed(() => route.params.id === 'new')

const managingBooks = ref(false)
const editing = ref(isNew.value)
const deleteModalRef = ref()
const collection = ref<Collection>()
const loading = ref(false)
const allBooks = ref<(Book & { selected: boolean })[]>([])

const formattedDate = computed(() =>
  format(collection.value?.createdAt ?? '', 'dd MMM yyyy'),
)

const booksDisplayed = computed(() => {
  return managingBooks.value
    ? allBooks.value
    : allBooks.value.filter((book) => book.selected)
})

const { view, sortedBooks, selectedTableColumns } = useSortBooks(booksDisplayed)

function openDeleteModal() {
  deleteModalRef.value.setIsOpen(true)
}

async function fetchCollection() {
  if (route.params.id === 'new') {
    collection.value = {} as Collection
  } else {
    loading.value = true
    const data = await $fetch<Collection>(
      `/api/collections/${route.params.id}`,
      {},
    )
    collection.value = data
    allBooks.value = (books.value ?? []).map((book) => ({
      ...book,
      selected: !!collection.value?.books.includes(book.id),
    }))
    loading.value = false
  }
}

async function deleteCollection() {
  await $fetch<Collection>(`/api/collections/${route.params.id}`, {
    method: 'delete',
  })

  navigateTo('/library/collections')
}

function onEdit(value: boolean) {
  editing.value = value
}

function onCancel() {
  if (isNew.value) {
    navigateTo('/library/collections')
  } else {
    onEdit(false)
  }
}

async function onSubmit(collection: Pick<Collection, 'id' | 'name'>) {
  try {
    const booksInCollection = allBooks.value
      .filter(({ selected }) => !!selected)
      .map(({ id }) => id)

    const updatedCollection = await $fetch<Collection>('/api/collections', {
      method: 'post',
      body: { ...collection, books: booksInCollection },
    })

    if (updatedCollection) {
      if (isNew.value) {
        navigateTo(`/library/collections/${updatedCollection.id}`)
      } else {
        onEdit(false)
        await fetchCollection()
      }
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
  allBooks.value = allBooks.value.map((book) =>
    book.id === bookId ? { ...book, selected: selected } : book,
  )
}

function onCancelBooks() {
  managingBooks.value = false
}

async function onSaveBooks() {
  if (collection.value) {
    const { id, name } = collection.value
    await onSubmit({ id, name })
    managingBooks.value = false
  }
}

onMounted(() => {
  fetchCollection()
})

useHead({
  title: 'CollectionLib | My Library',
})

definePageMeta({
  alias: ['/new'],
})
</script>

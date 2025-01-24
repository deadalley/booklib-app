<template>
  <div
    v-if="collection"
    class="flex flex-1 flex-col gap-10 overflow-visible 2xl:w-9/12"
  >
    <header class="flex flex-col gap-2">
      <div
        class="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end"
      >
        <div class="flex gap-5">
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
              <template #title
                >Are you sure you want to delete
                <strong>{{ collection.name }}</strong
                >?</template
              >
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
              v-if="!!booksDisplayed.length"
              :class="{ 'mt-4': editing }"
              :view="view"
              :books="sortedBooks"
              :selectable="managingBooks"
              :selected-table-columns="selectedTableColumns"
              @book-select="onSelectBook"
            />

            <section
              v-if="!booksDisplayed.length"
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
import { format } from 'date-fns'
import type { Book } from '~/types/book'
import type { Collection } from '~/types/collection'

const route = useRoute()

const { data: books } = await useFetch<Book[]>('/api/books')

const isNew = computed(() => route.params.id === 'new')

const managingBooks = ref(isNew.value)
const editing = ref(isNew.value)
const deleteModalRef = ref()
const collection = ref<Collection>()
const loading = ref(false)
const allBooks = ref<(Book & { selected: boolean; order?: number })[]>([])

const formattedDate = computed(() =>
  format(collection.value?.createdAt ?? '', 'dd MMM yyyy'),
)

const booksDisplayed = computed(() => {
  return managingBooks.value
    ? allBooks.value
    : allBooks.value.filter((book) => book.selected)
})

const { view, sortedBooks, selectedTableColumns } = useSortBooks(booksDisplayed)

watch(isNew, () => {
  managingBooks.value = isNew.value
})

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
    loading.value = false
  }

  allBooks.value = getBooksFromCollection(collection.value)
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

function onCancel() {
  if (isNew.value) {
    navigateTo('/library/collections')
  } else {
    if (collection.value) {
      allBooks.value = getBooksFromCollection(collection.value)
    }
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

function getBooksFromCollection(collection: Collection) {
  return (books.value ?? []).map((book) => ({
    ...book,
    selected: !!collection?.books.some(({ id }) => id === book.id),
    order: collection?.books.find(({ id }) => id === book.id)?.order,
  }))
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

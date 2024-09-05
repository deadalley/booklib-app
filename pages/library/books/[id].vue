<template>
  <div
    v-if="book"
    class="flex flex-1 flex-col gap-10 lg:w-9/12 lg:overflow-auto"
  >
    <header class="flex flex-col gap-2">
      <div class="flex items-end justify-between gap-3">
        <div class="flex gap-5">
          <h2 class="flex items-end leading-none">
            {{ isNew ? 'New Book' : book.title }}
          </h2>
          <bl-rating
            :editing="true"
            :rating="book.rating ?? 0"
            :on-commit="onSubmitRating"
          />
        </div>
        <div v-if="!isNew" class="flex flex-col justify-end leading-tight">
          <p>Added on</p>
          <h6>{{ formattedDate }}</h6>
        </div>
      </div>
      <!-- <h5>{{ book.author }}</h5> -->
    </header>
    <div class="flex flex-1 flex-col gap-10 lg:flex-row lg:overflow-auto">
      <bl-book-image
        :editing="true"
        :book="book"
        :temp-cover-src="tempCoverSrc"
      />
      <div class="flex flex-col gap-16 overflow-y-auto md:flex-1 lg:flex-[8]">
        <section class="book-section max-w-screen-md">
          <div class="flex gap-3">
            <h4>Overview</h4>
            <bl-button compact variant="secondary" @click="onEdit(true)"
              >Edit</bl-button
            >
          </div>
          <ClientOnly>
            <FormKit
              type="form"
              :value="book"
              :actions="false"
              @submit="onSubmit"
            >
              <div class="form-section">
                <div class="form-row">
                  <bl-input
                    id="title"
                    :editing="editing"
                    name="title"
                    label="Title"
                    placeholder="Title"
                  />
                </div>
                <div class="form-row">
                  <bl-input
                    id="publisher"
                    :editing="editing"
                    name="publisher"
                    label="Publisher"
                    placeholder="Publisher"
                  />
                  <bl-input
                    id="language"
                    type="select"
                    :editing="editing"
                    name="language"
                    label="Language"
                    placeholder="Language"
                    :options="languageOptions"
                    :value="book.language"
                  />
                </div>
                <div class="form-row">
                  <bl-input
                    id="year"
                    :editing="editing"
                    name="year"
                    label="Year"
                    placeholder="Year"
                    type="number"
                    :min="0"
                  />
                  <bl-input
                    id="pages"
                    :editing="editing"
                    name="pages"
                    label="Pages"
                    placeholder="Pages"
                    type="number"
                    :min="0"
                  />
                </div>
                <div class="form-row">
                  <bl-input
                    id="originalTitle"
                    :editing="editing"
                    name="originalTitle"
                    label="Original Title"
                    placeholder="Original Title"
                  />
                  <bl-input
                    id="originalLanguage"
                    type="select"
                    :editing="editing"
                    name="originalLanguage"
                    label="Original Language"
                    placeholder="Original Language"
                    :options="languageOptions"
                    :value="book.originalLanguage"
                  />
                </div>
                <div class="form-row">
                  <bl-input
                    id="isbn"
                    :editing="editing"
                    name="isbn"
                    label="ISBN"
                    placeholder="ISBN"
                  />
                </div>
                <div v-if="editing" class="form-row">
                  <bl-input
                    id="summary"
                    type="textarea"
                    :editing="editing"
                    name="summary"
                    label="Summary"
                    placeholder="Summary"
                    :rows="4"
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
          <div class="mt-5 flex flex-wrap gap-3">
            <bl-genre-tag
              v-for="(genre, index) in genres"
              :key="genre"
              removable
              editable
              :value="genre"
              :index="index"
              :on-commit="onSubmitGenre"
              :on-remove="onRemoveGenre"
            />
            <bl-genre-tag
              key="new"
              removable
              :new-genre="true"
              :index="genres.length"
              :on-commit="onSubmitGenre"
              :on-remove="onRemoveGenre"
            />
          </div>
        </section>
        <section class="book-section">
          <div class="flex gap-3">
            <h4>Collections</h4>
            <bl-button
              v-if="!managingCollections"
              variant="secondary"
              @click="managingCollections = true"
            >
              Manage
            </bl-button>
            <bl-button
              v-if="managingCollections"
              variant="secondary"
              @click="managingCollections = false"
            >
              Cancel
            </bl-button>
            <bl-button
              v-if="managingCollections"
              variant="primary"
              @click="onSaveCollections"
            >
              Save
            </bl-button>
          </div>
          <div
            v-if="!collectionsDisplayed.length"
            class="flex max-w-screen-md flex-col items-center gap-3"
          >
            <p>This book is not assigned any collections.</p>
            <bl-button @click="onManageCollections"
              >Add book to collections</bl-button
            >
          </div>
          <div
            v-if="!!collectionsDisplayed.length"
            class="grid size-full grid-cols-1 gap-x-6 gap-y-8 overflow-auto px-1 pt-1 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8"
          >
            <bl-collection-card
              v-for="collection in collectionsDisplayed"
              :key="collection.id"
              :collection="collection"
              :selectable="managingCollections"
              @select="onSelectCollection"
            />
          </div>
        </section>
        <section v-if="!isNew" class="book-section">
          <h5>Delete book</h5>
          <div class="flex justify-between gap-3">
            <p>
              Are you sure you want to delete this book? This action cannot be
              undone.
            </p>
            <bl-button compact @click="openDeleteModal">Delete</bl-button>
          </div>
          <bl-modal ref="deleteModalRef" :on-confirm="deleteBook">
            <template #title
              >Are you sure you want to delete <strong>{{ book.title }}</strong
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
import { faker } from '@faker-js/faker'
import type { Book } from '~/types/book'
import type { Collection } from '~/types/collection'
import languageOptions from '~/public/languages-2.json'

const route = useRoute()

const isNew = computed(() => route.params.id === 'new')

const managingCollections = ref(false)
const editing = ref(isNew.value)
const deleteModalRef = ref()
const book = ref<Book>()
const loading = ref(false)
const tempCoverSrc = ref(`temp-${faker.string.uuid()}`)
const genres = ref(book.value?.genres ?? [])
const allCollections = ref<(Collection & { selected: boolean })[]>([])

const { data: collections } = await useFetch<Collection[]>('/api/collections')

const collectionsDisplayed = computed(() => {
  return managingCollections.value
    ? allCollections.value
    : allCollections.value.filter((collection) => collection.selected)
})

watch(book, () => {
  genres.value = book.value?.genres ?? []
})

const formattedDate = computed(() =>
  format(book.value?.createdAt ?? '', 'dd MMM yyyy'),
)

function openDeleteModal() {
  deleteModalRef.value.setIsOpen(true)
}

async function fetchBook() {
  if (route.params.id === 'new') {
    book.value = {} as Book
  } else {
    loading.value = true
    const data = await $fetch<Book>(`/api/books/${route.params.id}`, {})
    book.value = data
    loading.value = false
  }
  allCollections.value = (collections.value ?? [])
    .map((collection) => ({
      ...collection,
      selected: !!book.value?.collections.includes(collection.id),
    }))
    .sort((b1, b2) => b1.name.localeCompare(b2.name))
}

async function deleteBook() {
  await $fetch<Book>(`/api/books/${route.params.id}`, {
    method: 'delete',
  })

  navigateTo('/library/books')
}

function onManageCollections() {
  managingCollections.value = true
}

function onEdit(value: boolean) {
  editing.value = value
}

function onCancel() {
  if (isNew.value) {
    navigateTo('/library/books')
  } else {
    onEdit(false)
  }
}

function onSelectCollection({
  collectionId,
  selected,
}: {
  collectionId: Collection['id']
  selected: boolean
}) {
  allCollections.value = allCollections.value.map((collection) =>
    collection.id === collectionId
      ? { ...collection, selected: selected }
      : collection,
  )
}

async function onSaveCollections() {
  if (book.value) {
    await onSubmit(book.value)
    managingCollections.value = false
  }
}

async function onSubmit(book: Book) {
  try {
    const updatedBook = await $fetch<Book>('/api/books', {
      method: 'post',
      body: {
        ...book,
        collections: allCollections.value
          .filter(({ selected }) => !!selected)
          .map(({ id }) => id),
        tempCoverSrc: isNew.value ? tempCoverSrc.value : undefined,
      },
    })

    if (updatedBook) {
      if (isNew.value) {
        navigateTo(`/library/books/${updatedBook.id}`)
      } else {
        onEdit(false)
        await fetchBook()
      }
    }
  } catch (error) {
    console.error(error)
  }
}

async function onSubmitRating(rating: number) {
  if (book.value) {
    onSubmit({ ...book.value, rating })
  }
}

async function onSubmitGenre(genre: string | undefined, index: number) {
  if (book.value && genre) {
    const _genres: string[] = (genres.value ?? []).concat()
    _genres.splice(index, 1, genre)
    return onSubmit({ ...book.value, genres: _genres })
  }
}

async function onRemoveGenre(index: number) {
  if (book.value) {
    const _genres: string[] = (genres.value ?? []).concat()
    _genres.splice(index, 1)
    return onSubmit({ ...book.value, genres: _genres })
  }
}

onMounted(() => {
  fetchBook()
})

useHead({
  title: 'BookLib | My Library',
})

definePageMeta({
  alias: ['/new'],
})
</script>

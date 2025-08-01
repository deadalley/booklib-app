<template>
  <div
    v-if="book"
    class="flex flex-1 flex-col gap-10 2xl:w-9/12 2xl:overflow-auto"
  >
    <header class="flex flex-col gap-6">
      <button
        class="hidden items-center gap-2 hover:text-main sm:flex"
        @click="$router.back()"
      >
        <IconArrowLeft :size="ICON_SIZE_SMALL" stroke="1.5" />
        <h6>Back</h6>
      </button>
      <div class="flex flex-col">
        <div
          class="flex flex-col items-start justify-between gap-3 md:flex-row"
        >
          <div class="flex flex-col">
            <div class="flex w-full flex-1 items-center gap-5 sm:w-[unset]">
              <h2 class="flex items-end leading-none">
                {{ isNew ? 'New Book' : book.title }}
              </h2>
              <bl-rating
                :editing="editing"
                :rating="book.rating ?? 0"
                :on-commit="onSelectRating"
              />
              <div class="flex gap-2">
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
                  v-if="!isNew && !editing"
                  size="sm"
                  @confirm="deleteBook"
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
                    <strong class="contents">{{ book.title }}</strong>
                    ?
                  </template>
                  This action cannot be undone.
                  <template #cancel-label> Cancel </template>
                  <template #action-label> Delete </template>
                </bl-modal>
              </div>
            </div>
            <h5 v-if="authorName">{{ authorName }}</h5>
          </div>
          <div
            class="flex w-full flex-col-reverse items-start gap-3 sm:w-[unset] sm:flex-row"
          >
            <div class="flex w-full">
              <div v-if="editing" class="flex w-full justify-start gap-2">
                <bl-button expand variant="secondary" @click="onCancel">
                  {{ isNew ? 'Cancel' : 'Discard changes' }}
                </bl-button>
                <bl-button expand @click="onSaveChanges()">
                  {{ isNew ? 'Create book' : 'Save changes' }}
                </bl-button>
              </div>

              <div class="hidden gap-2 sm:flex">
                <bl-button
                  v-if="!editing"
                  variant="secondary"
                  @click="onEdit(true)"
                >
                  Edit
                </bl-button>
                <bl-modal
                  v-if="!isNew && !editing"
                  size="sm"
                  @confirm="deleteBook"
                >
                  <template #trigger>
                    <bl-button>Delete</bl-button>
                  </template>
                  <template #title>
                    Are you sure you want to delete
                    <strong class="contents">{{ book.title }}</strong>
                    ?
                  </template>
                  This action cannot be undone.
                  <template #cancel-label> Cancel </template>
                  <template #action-label> Delete </template>
                </bl-modal>
              </div>
            </div>
            <div v-if="!isNew" class="flex flex-col justify-end leading-tight">
              <p>Added on</p>
              <h6 class="w-max">{{ formattedDate }}</h6>
            </div>
          </div>
        </div>
      </div>
    </header>
    <div class="flex flex-1 flex-col gap-10 lg:flex-row lg:overflow-auto">
      <div class="flex flex-col gap-2">
        <div class="lg:w-80">
          <bl-book-image editing :book="book!" :temp-cover-src="tempCoverSrc" />
        </div>
        <bl-multiselect class="w-full">
          <bl-multiselect-option
            v-for="item in DEFAULT_COLLECTIONS"
            :key="item"
            :value="item"
            :selected="selectedDefaultCollections[item]"
            @select="onDefaultCollectionChange"
          >
            <template #icon="iconProps">
              <component
                :is="
                  icons[
                    (selectedDefaultCollections[item]
                      ? DEFAULT_COLLECTION_ICONS_FILLED
                      : DEFAULT_COLLECTION_ICONS)[item]
                  ]
                "
                class="text-main"
                v-bind="iconProps"
              />
            </template>
          </bl-multiselect-option>
        </bl-multiselect>
        <div class="mt-4 flex flex-col gap-2">
          <bl-stepper
            v-model="currentStep"
            :interactive="true"
            :steps="progressSteps"
            @change="onProgressChange"
          />
          <bl-modal v-model="stepperModalOpen" :with-close-button="false">
            <div class="flex flex-col gap-3">
              <div class="flex justify-center gap-3">
                <div
                  v-for="status in Object.values(PROGRESS_STATUS_MAP).filter(
                    ({ step }) => step === currentStep,
                  )"
                  :key="status.id"
                  class="flex size-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-accent p-2 hover:bg-accent-light"
                  @click="onSelectProgress(status.id)"
                >
                  <component
                    :is="icons[status.icon]"
                    :size="32"
                    class="text-main"
                  />
                  {{ status.description }}
                </div>
              </div>
            </div>
          </bl-modal>
        </div>
      </div>

      <ClientOnly>
        <div
          class="flex flex-1 flex-col gap-16 overflow-visible overflow-y-auto"
        >
          <FormKit
            v-model="book"
            type="form"
            :actions="false"
            @submit="onSaveChanges"
          >
            <section class="book-section max-w-screen-md">
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
                  <bl-input-autocomplete
                    id="author"
                    :editing="editing"
                    name="author"
                    label="Author"
                    placeholder="Author"
                    :options="authorSelectOptions"
                    can-create-new
                    clearable
                  />
                </div>
                <div class="form-row">
                  <bl-select
                    id="format"
                    type="select"
                    :editing="editing"
                    name="format"
                    label="Format"
                    placeholder="Format"
                    :options="
                      Object.values(BOOK_FORMAT_MAP).map(
                        ({ id, description, icon }) => ({
                          label: description,
                          value: id,
                          icon,
                        }),
                      )
                    "
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
                  <bl-select
                    id="language"
                    type="select"
                    :editing="editing"
                    name="language"
                    label="Language"
                    placeholder="Language"
                    :options="languageSelectOptions"
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
                  <bl-select
                    id="originalLanguage"
                    :editing="editing"
                    name="originalLanguage"
                    label="Original Language"
                    placeholder="Original Language"
                    :options="languageSelectOptions"
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
                <div class="form-row">
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
                <div class="form-row">
                  <bl-input
                    id="startedAt"
                    type="date"
                    :editing="editing"
                    name="startedAt"
                    label="Started reading on"
                    placeholder="Start date"
                    clearable
                    :formatter="dateFormatter"
                  />
                  <bl-input
                    id="finishedAt"
                    :editing="editing"
                    type="date"
                    name="finishedAt"
                    label="Finished reading on"
                    placeholder="End date"
                    clearable
                    :formatter="dateFormatter"
                  />
                </div>
              </div>
              <div
                v-if="!!(book.genres ?? []).length || editing"
                class="mt-5 flex flex-wrap gap-3"
              >
                <bl-genre-tag
                  v-for="(genre, index) in book.genres"
                  :key="genre"
                  :removable="editing"
                  :editable="editing"
                  :value="genre"
                  :index="index"
                  :on-commit="onSelectGenre"
                  :on-remove="onRemoveGenre"
                />
                <bl-genre-tag
                  v-if="editing"
                  key="new"
                  :removable="editing"
                  :new-genre="true"
                  :index="book.genres?.length ?? -1"
                  :on-commit="onSelectGenre"
                  :on-remove="onRemoveGenre"
                />
              </div>
            </section>

            <section
              v-if="!!collectionsDisplayed.length"
              class="book-section overflow-visible"
            >
              <h4>Collections</h4>
              <div
                v-if="!collectionsDisplayed.length"
                class="flex max-w-screen-md flex-col items-center gap-3"
              >
                <p>This book is not assigned any collections.</p>
              </div>
              <div
                v-if="!!collectionsDisplayed.length"
                class="grid h-min w-full grid-cols-1 flex-wrap gap-x-6 gap-y-8 overflow-y-auto overflow-x-hidden p-3 md:grid-cols-[repeat(auto-fill,minmax(9rem,1fr))]"
              >
                <bl-collection-card
                  v-for="collection in collectionsDisplayed"
                  :key="collection.id"
                  :collection="collection"
                  :selectable="managingCollections"
                  collection-type="collections"
                  :icon="DEFAULT_COLLECTION_ICONS_FILLED[collection.id]"
                  @select="onSelectCollection"
                />
              </div>
            </section>

            <section v-if="!externalBooks.length && false" class="book-section">
              <template v-if="!externalBooks.length && false">
                <h4>Find books</h4>
                <bl-button @click="fetchBooksFromGoogle">Fetch</bl-button>
              </template>
              <div
                v-if="externalBooks.length"
                class="relative flex size-max gap-x-6 p-3 transition duration-100 ease-out"
              >
                <bl-book-card
                  v-for="b in externalBooks"
                  :key="b.title"
                  :book="b"
                  class="!w-36"
                />
              </div>
            </section>
            <div v-if="editing" class="flex justify-end gap-2">
              <bl-button variant="secondary" @click="onCancel">
                {{ isNew ? 'Cancel' : 'Discard changes' }}
              </bl-button>
              <FormKit type="submit">
                <bl-button type="submit">{{
                  isNew ? 'Create book' : 'Save changes'
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
import { faker } from '@faker-js/faker'
import { useBookLibrary } from '~/composables/use-book-library'
import type { Book, BookProgressStatus } from '~/types/book'
import type { Collection } from '~/types/collection'
import languageOptions from '~/public/languages-2.json'
import { IconArrowLeft, IconEdit, icons, IconTrash } from '@tabler/icons-vue'
import { toDefaultDate } from '../../../utils/date'
import type { Author } from '~/types/author'

const {
  getCollections,
  getAuthors,
  getBook,
  deleteBook: deleteBookService,
  createBook,
  searchGoogleBooks,
} = useBookLibrary()

const route = useRoute()

const isNew = computed(() => route.params.id === 'new')

const externalBooks = ref<Book[]>([])
const managingCollections = ref(isNew.value)
const editing = ref(isNew.value)
const stepperModalOpen = ref()
const book = ref<Book>()
const loading = ref(false)
const tempCoverSrc = ref(`temp-${faker.string.uuid()}`)
const allCollections = ref<(Collection & { selected: boolean })[]>([])

const collections = ref<Collection[]>([])
const authors = ref<Author[]>([])

const loadData = async () => {
  collections.value = await getCollections()
  authors.value = await getAuthors()
}

onMounted(loadData)

const collectionsDisplayed = computed(() => {
  return managingCollections.value
    ? allCollections.value
    : allCollections.value.filter((collection) => collection.selected)
})

const formattedDate = computed(() => toFullDateCompact(book.value?.createdAt))

const currentStep = ref<number | undefined>(
  book.value
    ? PROGRESS_STATUS_MAP[book.value.progressStatus ?? 'not-read'].step
    : undefined,
)

const selectedDefaultCollections = ref<Record<string, boolean>>({
  [WISHLIST_COLLECTION_ID]: false,
  [FAVORITE_COLLECTION_ID]: false,
})

const languageSelectOptions = computed(() =>
  Object.entries(languageOptions).map(([value, label]) => ({ label, value })),
)

const authorSelectOptions = computed(() =>
  (authors.value ?? [])
    .map((author) => ({
      label: author.name,
      value: String(author.id),
    }))
    .sort(({ label: l1 }, { label: l2 }) => l1.localeCompare(l2)),
)

const progressSteps = computed(() => [
  book.value?.progressStatus === 'owned'
    ? PROGRESS_STATUS_MAP.owned
    : PROGRESS_STATUS_MAP['not-owned'],

  book.value?.progressStatus === 'not-read'
    ? PROGRESS_STATUS_MAP['not-read']
    : book.value?.progressStatus === 'paused'
      ? PROGRESS_STATUS_MAP.paused
      : PROGRESS_STATUS_MAP.reading,
  book.value?.progressStatus === 'not-finished'
    ? PROGRESS_STATUS_MAP['not-finished']
    : PROGRESS_STATUS_MAP.read,
])

const authorName = computed(
  () => authors.value?.find(({ id }) => book.value?.author === id)?.name,
)

watch(isNew, () => {
  managingCollections.value = isNew.value
})

async function fetchBook() {
  if (isNew.value) {
    book.value = {} as Book
  } else {
    loading.value = true
    const data = await getBook(route.params.id as string)
    book.value = data || ({} as Book)
    loading.value = false
  }

  allCollections.value = (collections.value ?? []).map((collection) => ({
    ...collection,
    selected: !!book.value?.collections?.includes(collection.id),
  }))

  currentStep.value =
    PROGRESS_STATUS_MAP[book.value?.progressStatus ?? 'not-read'].step

  selectedDefaultCollections.value[FAVORITE_COLLECTION_ID] =
    !!book.value &&
    isBookInDefaultCollection(book.value, FAVORITE_COLLECTION_ID)
  selectedDefaultCollections.value[WISHLIST_COLLECTION_ID] =
    !!book.value &&
    isBookInDefaultCollection(book.value, WISHLIST_COLLECTION_ID)
}

async function deleteBook() {
  await deleteBookService(route.params.id as string)
  navigateTo('/library/books')
}

function onEdit(value: boolean) {
  editing.value = value
  managingCollections.value = value
  allCollections.value = allCollections.value.map((collection) => ({
    ...collection,
    selected: !!book.value?.collections?.includes(collection.id),
  }))
}

function onCancel() {
  if (isNew.value) {
    navigateTo('/library/books')
  } else {
    onEdit(false)
  }
}

async function onSubmit(bookValues: Book) {
  const updatedBook = await createBook({
    ...bookValues,
    collections: allCollections.value
      .filter(({ selected }) => !!selected)
      .map(({ id }) => id),
    tempCoverSrc: isNew.value ? tempCoverSrc.value : undefined,
    genres: book.value?.genres ?? [],
    rating: book.value?.rating,
    progressStatus: book.value?.progressStatus,
  } as Book)

  return updatedBook
}

async function onSaveChanges() {
  if (book.value) {
    const updatedBook = await onSubmit(book.value)

    if (updatedBook) {
      navigateTo('/library/books')
    }
  }
}

async function onSelectRating(rating: number) {
  if (book.value) {
    book.value.rating = rating
  }
}

async function onSelectGenre(genre: string | undefined, index: number) {
  if (book.value && genre) {
    const _genres: string[] = (book.value.genres ?? []).concat()
    _genres.splice(index, 1, genre)
    book.value.genres = _genres
  }
}

async function onRemoveGenre(index: number) {
  if (book.value && index !== -1 && index !== book.value.genres?.length) {
    const _genres: string[] = (book.value.genres ?? []).concat()
    _genres.splice(index, 1)
    book.value.genres = _genres
  }
}

function onSelectCollection({
  collectionId,
  selected,
}: {
  collectionId: string
  selected: boolean
}) {
  allCollections.value = allCollections.value.map((collection) =>
    String(collection.id) === String(collectionId)
      ? { ...collection, selected }
      : collection,
  )
}

function onDefaultCollectionChange(collectionId: string) {
  selectedDefaultCollections.value[collectionId] =
    !selectedDefaultCollections.value[collectionId]
  onSelectCollection({
    collectionId,
    selected: selectedDefaultCollections.value[collectionId],
  })

  if (book.value) {
    onSubmit(book.value)
  }
}

function onSelectProgress(progressStatus: BookProgressStatus) {
  if (book.value) {
    book.value.progressStatus = progressStatus

    if (!isNew.value) {
      onSubmit(book.value)
    }
  }
  stepperModalOpen.value = false
}

function onProgressChange(progressStatusStep: number) {
  const progressStatus = progressSteps.value.find(
    ({ step }) => progressStatusStep === step,
  )

  if (progressStatus) {
    if (
      progressStatus.step === PROGRESS_STATUS_MAP.owned.step ||
      progressStatus.step === PROGRESS_STATUS_MAP.reading.step ||
      progressStatus.step === PROGRESS_STATUS_MAP.read.step
    ) {
      stepperModalOpen.value = true
    } else if (book.value) {
      book.value.progressStatus = progressStatus.id

      if (!isNew.value) {
        onSubmit(book.value)
      }
    }
  }
}

function dateFormatter(date: Date | undefined): string | undefined {
  return date && toDefaultDate(date)
}

async function fetchBooksFromGoogle() {
  if (book.value) {
    const books = await searchGoogleBooks(book.value.title || '')
    externalBooks.value = books as Book[]
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

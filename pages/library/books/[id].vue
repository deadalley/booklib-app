<template>
  <section
    v-if="book && !editing && !isNew"
    class="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto md:overflow-hidden"
  >
    <div class="flex items-center justify-between">
      <bl-breadcrumbs
        :items="[
          { label: 'Library', to: '../../' },
          { label: primaryCollectionName, to: '../' },
          { label: book.title },
        ]"
      />

      <div class="flex items-center gap-2 self-start">
        <bl-modal size="sm" @confirm="deleteBook">
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
          <template #cancel-label>Cancel</template>
          <template #action-label>Delete</template>
        </bl-modal>
        <bl-button variant="secondary" @click="onEdit(true)">
          <template #prependIcon>
            <IconEdit :size="ICON_SIZE_SMALL" stroke="1.5" />
          </template>
        </bl-button>
      </div>
    </div>

    <div
      class="grid min-h-0 flex-1 gap-16 overflow-y-auto md:h-full xl:grid-cols-[24rem_minmax(0,1fr)] 2xl:grid-cols-[24rem_minmax(0,1fr)]"
    >
      <aside class="flex flex-col gap-4 lg:overflow-y-auto">
        <bl-book-page-cover :book="book" editing />

        <bl-book-page-default-collections
          :book="book"
          @default-collection-change="onDefaultCollectionChange"
        />
      </aside>

      <div
        class="flex min-h-0 max-w-7xl flex-col gap-6 pr-1 pb-2 md:h-full lg:overflow-y-auto"
      >
        <section class="main-content-section">
          <bl-book-page-header :book="book" :authors="authors" />
        </section>

        <section class="main-content-section">
          <bl-book-page-fields :book="book" />
        </section>

        <section v-if="(book.genres ?? []).length" class="main-content-section">
          <div class="flex flex-col gap-4">
            <p class="section-title">Genres</p>
            <div class="flex flex-wrap gap-2">
              <bl-chip
                v-for="genre in book.genres"
                :key="genre"
                variant="primary"
              >
                {{ genre }}
              </bl-chip>
            </div>
          </div>
        </section>

        <section class="main-content-section">
          <div class="flex flex-col gap-4">
            <p class="section-title">Summary</p>
            <p class="text-ink-secondary text-lg font-normal tracking-wider">
              {{ book.summary || 'No summary available.' }}
            </p>
          </div>
        </section>

        <section class="main-content-section">
          <div class="flex flex-col gap-4">
            <p class="section-title">Progress</p>
            <bl-book-page-progress
              :book="book"
              @status-select="onSelectProgress"
              @log-entry="onLogEntry"
              @update-note="onUpdateNote"
              @delete-note="onDeleteNote"
            />
          </div>
        </section>

        <section
          v-if="collectionsDisplayed.length"
          class="main-content-section"
        >
          <p class="section-title">Collections</p>
          <div
            class="grid h-min w-full grid-cols-1 gap-x-6 gap-y-8 overflow-x-hidden overflow-y-auto pb-1 md:grid-cols-[repeat(auto-fill,minmax(9rem,1fr))]"
          >
            <bl-collection-tile
              v-for="collection in collectionsDisplayed"
              :key="collection.id"
              :collection="collection"
              collection-type="collections"
              layout="compact"
              :icon="DEFAULT_COLLECTION_ICONS_FILLED[collection.id]"
            />
          </div>
        </section>

        <section v-if="bookGoals.length" class="main-content-section">
          <p class="section-title">Goals</p>
          <div
            class="grid h-min w-full grid-cols-1 gap-x-6 gap-y-8 overflow-x-hidden overflow-y-auto pb-1 md:grid-cols-[repeat(auto-fill,minmax(30rem,1fr))]"
          >
            <bl-goal-link-tile
              v-for="goal in bookGoals"
              :key="goal.id"
              :goal="goal"
              :authors="authors"
            />
          </div>
        </section>
      </div>
    </div>
  </section>

  <bl-book-page-edit
    v-else-if="book"
    v-model:book="book"
    v-model:current-step="currentStep"
    v-model:stepper-modal-open="stepperModalOpen"
    v-model:start-reading-book-today="startReadingBookToday"
    v-model:finish-reading-book-today="finishReadingBookToday"
    :is-new="isNew"
    :editing="editing"
    :author-name="authorName"
    :formatted-date="formattedDate"
    :temp-cover-src="tempCoverSrc"
    :selected-default-collections="selectedDefaultCollections"
    :progress-steps="progressSteps"
    :managing-collections="managingCollections"
    :author-select-options="authorSelectOptions"
    :language-select-options="languageSelectOptions"
    :collections-displayed="collectionsDisplayed"
    :external-books="externalBooks"
    :date-formatter="dateFormatter"
    :on-select-rating="onSelectRating"
    :on-select-genre="onSelectGenre"
    :on-remove-genre="onRemoveGenre"
    @back="$router.back()"
    @cancel="onCancel"
    @save="onSaveChanges"
    @edit="onEdit(true)"
    @delete="deleteBook"
    @default-collection-change="onDefaultCollectionChange"
    @progress-change="onProgressChange"
    @status-select="onSelectProgress"
    @collection-select="onSelectCollection"
    @fetch-google-books="fetchBooksFromGoogle"
  />
</template>

<script setup lang="ts">
import { faker } from '@faker-js/faker'
import { IconEdit, IconTrash } from '@tabler/icons-vue'
import { useBookLibrary } from '~/composables/use-book-library'
import languageOptions from '~/public/languages-2.json'
import type { Author } from '~/types/author'
import type { Book, BookNote, BookProgressStatus } from '~/types/book'
import type { Collection } from '~/types/collection'
import type { Goal } from '~/types/goal'
import { ICON_SIZE_SMALL } from '~/utils/constants'
import { toDefaultDate } from '../../../utils/date'

const {
  getCollections,
  getAuthors,
  getBook,
  deleteBook: _deleteBook,
  createBook,
  updateBook,
  searchGoogleBooks,
  getGoals,
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
const startReadingBookToday = ref(false)
const finishReadingBookToday = ref(false)

const collections = ref<Collection[]>([])
const authors = ref<Author[]>([])
const goals = ref<Goal[]>([])

const loadData = async () => {
  collections.value = await getCollections()
  authors.value = await getAuthors()
  goals.value = await getGoals()
}

onMounted(loadData)

const collectionsDisplayed = computed(() => {
  return managingCollections.value
    ? allCollections.value
    : allCollections.value.filter((collection) => collection.selected)
})

const formattedDate = computed(() => toFullDateCompact(book.value?.createdAt))

const bookGoals = computed(() => {
  if (!book.value) return []

  return goals.value.filter((goal) => {
    if (goal.type === 'books') {
      return goal.entries.some(
        (entry) => String(entry.book) === String(book.value?.id),
      )
    }

    return false
  })
})

const currentStep = ref<number | undefined>(
  book.value
    ? PROGRESS_STATUS_MAP[book.value.progress.status ?? 'not-owned'].step
    : undefined,
)

const selectedDefaultCollections = ref<Record<string, boolean>>({
  [WISHLIST_COLLECTION_ID]: false,
  [TBR_COLLECTION_ID]: false,
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
  book.value?.progress.status === 'owned'
    ? PROGRESS_STATUS_MAP.owned
    : PROGRESS_STATUS_MAP['not-owned'],
  book.value?.progress.status === 'paused'
    ? PROGRESS_STATUS_MAP.paused
    : PROGRESS_STATUS_MAP.reading,
  book.value?.progress.status === 'not-finished'
    ? PROGRESS_STATUS_MAP['not-finished']
    : PROGRESS_STATUS_MAP.read,
])

const authorName = computed(
  () => authors.value?.find(({ id }) => book.value?.author === id)?.name,
)

const primaryCollectionName = computed(() => {
  const firstCollection = allCollections.value.find(
    ({ id, selected }) => selected && !DEFAULT_COLLECTIONS.includes(String(id)),
  )

  return firstCollection?.name ?? 'Books'
})

watch(isNew, () => {
  managingCollections.value = isNew.value
})

async function fetchBook() {
  if (isNew.value) {
    book.value = {
      progress: { status: null, startedAt: null, finishedAt: null, notes: [] },
    } as unknown as Book
  } else {
    loading.value = true
    const data = await getBook(route.params.id as string)
    book.value = data
      ? {
          ...data,
          progress: { ...data.progress, notes: data.progress?.notes ?? [] },
        }
      : ({
          progress: {
            status: null,
            startedAt: null,
            finishedAt: null,
            notes: [],
          },
        } as unknown as Book)
    loading.value = false
  }

  allCollections.value = (collections.value ?? []).map((collection) => ({
    ...collection,
    selected: !!book.value?.collections?.includes(collection.id),
  }))

  currentStep.value =
    PROGRESS_STATUS_MAP[book.value?.progress.status ?? 'not-owned'].step

  selectedDefaultCollections.value[FAVORITE_COLLECTION_ID] =
    !!book.value &&
    isBookInDefaultCollection(book.value, FAVORITE_COLLECTION_ID)
  selectedDefaultCollections.value[WISHLIST_COLLECTION_ID] =
    !!book.value &&
    isBookInDefaultCollection(book.value, WISHLIST_COLLECTION_ID)
  selectedDefaultCollections.value[TBR_COLLECTION_ID] =
    !!book.value && isBookInDefaultCollection(book.value, TBR_COLLECTION_ID)
}

async function deleteBook() {
  await _deleteBook(route.params.id as string)
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
  const updatedBook = {
    ...bookValues,
    collections: allCollections.value
      .filter(({ selected }) => !!selected)
      .map(({ id }) => id),
    tempCoverSrc: isNew.value ? tempCoverSrc.value : undefined,
    genres: book.value?.genres ?? [],
    progress: {
      ...bookValues.progress,
      notes: book.value?.progress.notes ?? bookValues.progress?.notes ?? [],
      status: book.value?.progress.status ?? bookValues.progress?.status,
    },
    rating: book.value?.rating,
  } as Book

  if (isNew.value) {
    await createBook(updatedBook)
  } else {
    await updateBook(route.params.id as string, updatedBook)
  }

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

async function onAddNote({
  content,
  page,
}: Pick<BookNote, 'content' | 'page'>) {
  if (!book.value || isNew.value) return

  const nextNotes: BookNote[] = [
    ...(book.value.progress.notes ?? []),
    {
      createdAt: now(),
      content,
      ...(page ? { page } : {}),
    },
  ]

  book.value.progress.notes = nextNotes
  await onSubmit(book.value)
}

async function onUpdateNote({
  index,
  content,
  page,
  createdAt,
}: {
  index: number
  content: string
  page?: number
  createdAt?: string
}) {
  if (!book.value || isNew.value) return
  if (index < 0 || index >= (book.value.progress.notes ?? []).length) return

  const nextNotes = [...(book.value.progress.notes ?? [])]
  const currentNote = nextNotes[index]
  if (!currentNote) return

  nextNotes[index] = {
    ...currentNote,
    content,
    ...(createdAt ? { createdAt } : {}),
    ...(page ? { page } : { page: undefined }),
  }

  book.value.progress.notes = nextNotes
  await onSubmit(book.value)
}

async function onDeleteNote({ index }: { index: number }) {
  if (!book.value || isNew.value) return

  const nextNotes = [...(book.value.progress.notes ?? [])]
  if (index < 0 || index >= nextNotes.length) return

  nextNotes.splice(index, 1)
  book.value.progress.notes = nextNotes
  await onSubmit(book.value)
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
      : { ...collection },
  )
}

async function onDefaultCollectionChange(collectionId: string) {
  selectedDefaultCollections.value[collectionId] =
    !selectedDefaultCollections.value[collectionId]
  onSelectCollection({
    collectionId,
    selected: selectedDefaultCollections.value[collectionId],
  })

  if (book.value) {
    book.value.collections = allCollections.value
      .filter(({ selected }) => !!selected)
      .map(({ id }) => id)

    await onSubmit(book.value)
  }
}

async function onLogEntry(page: number, note: string, date: string) {
  if (!book.value || isNew.value) return

  book.value.progress.currentPage = page
  book.value.progress.notes = [
    ...(book.value.progress.notes ?? []),
    { createdAt: date, content: note, page },
  ]

  await onSubmit(book.value)
}

async function onSelectProgress(
  progressStatus: BookProgressStatus,
  startedAt?: string,
) {
  if (book.value) {
    book.value.progress.status = progressStatus

    if (startedAt) {
      book.value.progress.startedAt = startedAt
    } else if (progressStatus === 'reading' && startReadingBookToday.value) {
      book.value.progress.startedAt = now()
    } else if (progressStatus === 'read' && finishReadingBookToday.value) {
      book.value.progress.finishedAt = now()
    }

    if (!isNew.value) {
      await onSubmit(book.value)
    }
  }
  stepperModalOpen.value = false
  startReadingBookToday.value = false
  finishReadingBookToday.value = false
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
      book.value.progress.status = progressStatus.id

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

<style scoped>
@reference '../../../assets/css/main.css';

.section-title {
  @apply text-primary text-base font-semibold tracking-widest uppercase;
}

.main-content-section {
  @apply border-stroke-subtle flex flex-col gap-4 border-b pb-6;
}
</style>

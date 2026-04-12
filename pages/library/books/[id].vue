<template>
  <bl-book-page
    v-if="book && !editing && !isNew"
    v-model:stepper-modal-open="stepperModalOpen"
    v-model:start-reading-book-today="startReadingBookToday"
    v-model:finish-reading-book-today="finishReadingBookToday"
    :book="book"
    :book-goals="bookGoals"
    :authors="authors"
    :primary-collection-name="primaryCollectionName"
    :is-favorite="!!selectedDefaultCollections[FAVORITE_COLLECTION_ID]"
    :author-name="authorName"
    :current-step="currentStep ?? 1"
    :lifecycle-badge-label="lifecycleBadgeLabel"
    :progress-steps="progressSteps"
    :lifecycle-state-options="lifecycleStateOptions"
    :book-facts-primary="bookFactsPrimary"
    :book-facts-secondary="bookFactsSecondary"
    :reading-progress="readingProgress"
    :reading-progress-subtitle="readingProgressSubtitle"
    :reading-secondary-label="readingSecondaryLabel"
    :reading-secondary-value="readingSecondaryValue"
    :collections-displayed="collectionsDisplayed"
    :on-select-rating="onSelectRating"
    @share="onShare"
    @favorite-toggle="onDefaultCollectionChange(FAVORITE_COLLECTION_ID)"
    @edit="onEdit(true)"
    @delete="deleteBook"
    @step-change="onProgressChange"
    @status-select="onSelectProgress"
  />

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
import { useBookLibrary } from '~/composables/use-book-library'
import languageOptions from '~/public/languages-2.json'
import type { Author } from '~/types/author'
import type { Book, BookProgressStatus } from '~/types/book'
import type { Collection } from '~/types/collection'
import type { Goal } from '~/types/goal'
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
    ? PROGRESS_STATUS_MAP[book.value.progressStatus ?? 'not-owned'].step
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
  book.value?.progressStatus === 'owned'
    ? PROGRESS_STATUS_MAP.owned
    : PROGRESS_STATUS_MAP['not-owned'],
  book.value?.progressStatus === 'paused'
    ? PROGRESS_STATUS_MAP.paused
    : PROGRESS_STATUS_MAP.reading,
  book.value?.progressStatus === 'not-finished'
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

const lifecycleBadgeLabel = computed(() => {
  const status = book.value?.progressStatus ?? 'not-owned'

  if (status === 'reading' || status === 'paused') {
    return 'Active Tracking'
  }

  if (status === 'read') {
    return 'Finished'
  }

  if (status === 'not-finished') {
    return 'Archived'
  }

  if (status === 'owned') {
    return 'Owned'
  }

  return 'Pending'
})

const lifecycleStateOptions = computed(() => [
  {
    id: 'reading' as BookProgressStatus,
    label: 'Reading',
    icon: PROGRESS_STATUS_MAP.reading.icon,
  },
  {
    id: 'paused' as BookProgressStatus,
    label: 'Paused',
    icon: PROGRESS_STATUS_MAP.paused.icon,
  },
  {
    id: 'owned' as BookProgressStatus,
    label: 'Owned',
    icon: PROGRESS_STATUS_MAP.owned.icon,
  },
  {
    id: 'not-owned' as BookProgressStatus,
    label: 'Pending',
    icon: PROGRESS_STATUS_MAP['not-owned'].icon,
  },
])

const bookFactsPrimary = computed(() => [
  {
    label: 'Publisher',
    value: book.value?.publisher || 'Unknown',
  },
  {
    label: 'Release Year',
    value: book.value?.year || 'Unknown',
  },
  {
    label: 'Format',
    value: book.value?.format
      ? BOOK_FORMAT_MAP[book.value.format].description
      : 'Unknown',
  },
])

const bookFactsSecondary = computed(() => [
  {
    label: 'Pages',
    value: book.value?.pages || 'Unknown',
  },
  {
    label: 'ISBN-13',
    value: book.value?.isbn || 'Unknown',
  },
  {
    label: 'Language',
    value: book.value?.language || 'Unknown',
  },
])

const readingProgress = computed(() => {
  const status = book.value?.progressStatus ?? 'not-owned'

  if (status === 'read') return 100
  if (status === 'not-finished') return 75
  if (status === 'reading' || status === 'paused') return 50
  if (status === 'owned') return 8

  return 0
})

const readingProgressSubtitle = computed(() => {
  const pages = book.value?.pages
  if (!pages) {
    return PROGRESS_STATUS_MAP[book.value?.progressStatus ?? 'not-owned']
      .description
  }

  const pagesRead = Math.round((pages * readingProgress.value) / 100)
  return `${pagesRead} of ${pages} pages`
})

const readingTrackingDays = computed(() => {
  if (!book.value?.startedAt) return undefined

  const startedAt = new Date(book.value.startedAt)
  const endDate = book.value.finishedAt
    ? new Date(book.value.finishedAt)
    : new Date()
  const diff = endDate.getTime() - startedAt.getTime()

  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)))
})

const readingSecondaryLabel = computed(() =>
  readingTrackingDays.value ? 'Days Tracked' : 'Current Status',
)

const readingSecondaryValue = computed(() =>
  readingTrackingDays.value
    ? `${readingTrackingDays.value} days`
    : PROGRESS_STATUS_MAP[book.value?.progressStatus ?? 'not-owned']
        .description,
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
    PROGRESS_STATUS_MAP[book.value?.progressStatus ?? 'not-owned'].step

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

async function onShare() {
  if (!book.value || typeof window === 'undefined') return

  const shareData = {
    title: book.value.title,
    text: authorName.value ?? undefined,
    url: window.location.href,
  }

  if (navigator.share) {
    await navigator.share(shareData)
    return
  }

  await navigator.clipboard.writeText(window.location.href)
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
    rating: book.value?.rating,
    progressStatus: book.value?.progressStatus,
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

async function onSelectProgress(progressStatus: BookProgressStatus) {
  if (book.value) {
    book.value.progressStatus = progressStatus

    if (progressStatus === 'reading' && startReadingBookToday.value) {
      book.value.startedAt = now()
    } else if (progressStatus === 'read' && finishReadingBookToday.value) {
      book.value.finishedAt = now()
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

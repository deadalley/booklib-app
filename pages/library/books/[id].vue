<template>
  <section
    v-if="book && !editing && !isNew"
    class="@container mx-auto flex w-full max-w-[90rem] flex-col gap-8"
  >
    <div class="flex flex-wrap items-center justify-between gap-4">
      <bl-breadcrumbs
        :items="[
          { label: 'Library', to: '../../' },
          { label: primaryCollectionName, to: '../' },
          { label: book.title },
        ]"
      />

      <div class="flex items-center gap-2">
        <bl-button variant="secondary" @click="onEdit(true)">
          <template #prependIcon>
            <IconEdit :size="ICON_SIZE_SMALL" stroke="1.5" />
          </template>
          Edit
        </bl-button>
        <bl-modal size="sm" @confirm="deleteBook">
          <template #trigger>
            <bl-button
              variant="secondary"
              aria-label="Delete book"
              title="Delete book"
            >
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
      </div>
    </div>

    <bl-book-page-header
      :book="book"
      :authors="authors"
      :selected-default-collections="selectedDefaultCollections"
      @default-collection-change="onDefaultCollectionChange"
    />

    <div class="book-page-body">
      <div class="book-page-body-progress">
        <bl-book-page-progress
          :book="book"
          @status-select="onSelectProgress"
          @property-status-select="onPropertyStatusSelect"
          @log-entry="onLogEntry"
          @update-note="onUpdateNote"
          @delete-note="onDeleteNote"
        />
      </div>

      <div class="book-page-body-main">
        <section class="book-page-section">
          <p class="book-page-section-title">Summary</p>
          <p class="summary" :class="{ empty: !book.summary }">
            {{ book.summary || 'No summary yet.' }}
          </p>
        </section>

        <section class="book-page-section">
          <p class="book-page-section-title">Details</p>
          <bl-book-page-fields :book="book" />
        </section>

        <section v-if="collectionsDisplayed.length" class="book-page-section">
          <div class="flex items-center justify-between gap-3">
            <p class="book-page-section-title">Collections</p>
            <bl-total-tag>{{ collectionsDisplayed.length }}</bl-total-tag>
          </div>
          <div
            class="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-4"
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

        <section v-if="bookGoals.length" class="book-page-section">
          <p class="book-page-section-title">Goals</p>
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
    :is-new="isNew"
    :temp-cover-src="tempCoverSrc"
    :selected-default-collections="selectedDefaultCollections"
    :author-select-options="authorSelectOptions"
    :language-select-options="languageSelectOptions"
    :collections-displayed="collectionsDisplayed"
    :on-select-rating="onSelectRating"
    :on-select-genre="onSelectGenre"
    :on-remove-genre="onRemoveGenre"
    @cancel="onCancel"
    @save="onSaveChanges"
    @default-collection-change="onDefaultCollectionChange"
    @collection-select="onSelectCollection"
  />
</template>

<script setup lang="ts">
import { faker } from '@faker-js/faker'
import { IconEdit, IconTrash } from '@tabler/icons-vue'
import { useBookLibrary } from '~/composables/use-book-library'
import languageOptions from '~/public/languages-2.json'
import type { Author } from '~/types/author'
import type {
  Book,
  BookNote,
  BookProgressStatus,
  BookPropertyStatus,
} from '~/types/book'
import type { Collection } from '~/types/collection'
import type { Goal } from '~/types/goal'
import { ICON_SIZE_SMALL } from '~/utils/constants'

const {
  getCollections,
  getAuthors,
  getBook,
  deleteBook: _deleteBook,
  createBook,
  updateBook,
  getGoals,
} = useBookLibrary()

const route = useRoute()

const isNew = computed(() => route.params.id === 'new')

const managingCollections = ref(isNew.value)
const editing = ref(isNew.value)
const book = ref<Book>()
const loading = ref(false)
const tempCoverSrc = ref(`temp-${faker.string.uuid()}`)
const allCollections = ref<(Collection & { selected: boolean })[]>([])

const collections = ref<Collection[]>([])
const authors = ref<Author[]>([])
const goals = ref<Goal[]>([])

const loadData = async () => {
  collections.value = await getCollections()
  authors.value = await getAuthors()
  goals.value = await getGoals()
}

const collectionsDisplayed = computed(() => {
  return managingCollections.value
    ? allCollections.value
    : allCollections.value.filter((collection) => collection.selected)
})

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

const selectedDefaultCollections = ref<Record<string, boolean>>({
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
      collections: [],
      genres: [],
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

  selectedDefaultCollections.value[FAVORITE_COLLECTION_ID] =
    !!book.value &&
    isBookInDefaultCollection(book.value, FAVORITE_COLLECTION_ID)
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

async function onCancel() {
  if (isNew.value) {
    navigateTo('/library/books')
  } else {
    await fetchBook()
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

async function onSelectRating(rating: number | null) {
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

  if (book.value && !editing.value) {
    book.value.collections = allCollections.value
      .filter(({ selected }) => !!selected)
      .map(({ id }) => id)

    await onSubmit(book.value)
  }
}

async function onLogEntry(
  page: number | undefined,
  note: string,
  date: string,
) {
  if (!book.value || isNew.value) return

  book.value.progress.currentPage = page ?? book.value.progress.currentPage
  book.value.progress.notes = [
    ...(book.value.progress.notes ?? []),
    { createdAt: date, content: note, page },
  ]

  await onSubmit(book.value)
}

async function onPropertyStatusSelect(propertyStatus: BookPropertyStatus) {
  if (book.value) {
    book.value.propertyStatus = propertyStatus

    if (!isNew.value) {
      await onSubmit(book.value)
    }
  }
}

async function onSelectProgress(
  progressStatus: BookProgressStatus | null,
  startedAt?: string,
) {
  if (book.value) {
    book.value.progress.status = progressStatus

    if (startedAt) {
      book.value.progress.startedAt = startedAt
    }

    if (!isNew.value) {
      await onSubmit(book.value)
    }
  }
}

onMounted(async () => {
  await loadData()
  await fetchBook()
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

.book-page-body {
  @apply grid grid-cols-[minmax(0,1fr)] items-start gap-6;
  grid-template-areas: 'progress' 'main';
  @apply @min-[960px]:grid-cols-[minmax(0,1fr)_23rem];
}

@container (min-width: 960px) {
  .book-page-body {
    grid-template-areas: 'main progress';
  }
}

.book-page-body-progress {
  @apply min-w-0 @min-[960px]:sticky @min-[960px]:top-0;
  grid-area: progress;
}

.book-page-body-main {
  @apply flex min-w-0 flex-col gap-6;
  grid-area: main;
}

.summary {
  @apply text-ink-secondary max-w-[68ch] text-[1.0625rem] leading-[1.65];
  text-wrap: pretty;
}

.summary.empty {
  @apply text-ink-muted;
}
</style>

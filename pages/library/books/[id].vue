<template>
  <div
    v-if="book"
    class="flex flex-1 flex-col gap-10 2xl:w-9/12 2xl:overflow-auto"
  >
    <header class="flex flex-col gap-2">
      <div
        class="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end"
      >
        <div class="flex flex-1 gap-5">
          <h2 class="flex items-end leading-none">
            {{ isNew ? 'New Book' : book.title }}
          </h2>
          <bl-rating
            :editing="editing"
            :rating="book.rating ?? 0"
            :on-commit="onSubmitRating"
          />
        </div>
        <div class="flex gap-2">
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

          <bl-button
            v-if="!editing"
            compact
            variant="secondary"
            @click="onEdit(true)"
          >
            Edit
          </bl-button>
          <bl-modal
            v-if="!isNew && !editing"
            ref="deleteModalRef"
            :on-confirm="deleteBook"
            size="sm"
          >
            <template #trigger>
              <bl-button compact>Delete</bl-button>
            </template>
            <template #title>
              Are you sure you want to delete <strong>{{ book.title }}</strong>
              ?
            </template>
            This action cannot be undone.
            <template #cancel-label> Cancel </template>
            <template #action-label> Delete </template>
          </bl-modal>
        </div>
        <div v-if="!isNew" class="flex flex-col justify-end leading-tight">
          <p>Added on</p>
          <h6 class="w-max">{{ formattedDate }}</h6>
        </div>
      </div>
      <!-- <h5>{{ book.author }}</h5> -->
    </header>
    <div class="flex flex-1 flex-col gap-10 lg:flex-row lg:overflow-auto">
      <div class="flex flex-col gap-2">
        <div class="lg:w-80">
          <bl-book-image
            :editing="editing"
            :book="book"
            :temp-cover-src="tempCoverSrc"
          />
        </div>
        <div class="mt-4 flex flex-col gap-2">
          <bl-stepper v-model="currentStep" :steps="progressSteps" />
        </div>
      </div>

      <ClientOnly>
        <div
          class="flex flex-1 flex-col gap-16 overflow-visible overflow-y-auto"
        >
          <FormKit
            type="form"
            :value="book ?? {}"
            :actions="false"
            @submit="onSubmit"
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
                  <bl-input
                    id="publisher"
                    :editing="editing"
                    name="publisher"
                    label="Publisher"
                    placeholder="Publisher"
                  />
                  <bl-select-input
                    id="language"
                    type="select"
                    :editing="editing"
                    name="language"
                    label="Language"
                    placeholder="Language"
                    :options="languageSelectOptions"
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
                  <bl-select-input
                    id="originalLanguage"
                    :editing="editing"
                    name="originalLanguage"
                    label="Original Language"
                    placeholder="Original Language"
                    :options="languageSelectOptions"
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
                  :on-commit="onSubmitGenre"
                  :on-remove="onRemoveGenre"
                />
                <bl-genre-tag
                  v-if="editing"
                  key="new"
                  :removable="editing"
                  :new-genre="true"
                  :index="book.genres?.length ?? -1"
                  :on-commit="onSubmitGenre"
                  :on-remove="onRemoveGenre"
                />
              </div>
            </section>
            <section v-if="editing" class="book-section">
              <h4>Progress</h4>
              <bl-stepper
                v-model="currentStep"
                :steps="progressSteps"
                :interactive="true"
                @change="onProgressChange"
              />
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
                class="grid h-min w-full grid-cols-1 flex-wrap gap-x-6 gap-y-8 overflow-y-auto overflow-x-hidden p-1 md:grid-cols-[repeat(auto-fill,minmax(9rem,1fr))]"
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

  <bl-modal v-model="stepperModalOpen" :with-close-button="false">
    <div class="flex justify-center gap-3">
      <div
        v-if="currentStep === PROGRESS_STATUS_MAP.reading.step"
        class="flex size-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-accent p-2 hover:bg-accent-light"
        @click="onSelectProgress(PROGRESS_STATUS_MAP.reading.id)"
      >
        <IconEyeglass2 :size="32" class="text-main" />
        {{ PROGRESS_STATUS_MAP.reading.description }}
      </div>
      <div
        v-if="currentStep === PROGRESS_STATUS_MAP.paused.step"
        class="flex size-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-accent p-2 hover:bg-accent-light"
        @click="onSelectProgress(PROGRESS_STATUS_MAP.paused.id)"
      >
        <IconPlayerPause :size="32" class="text-main" />
        {{ PROGRESS_STATUS_MAP.paused.description }}
      </div>
      <div
        v-if="currentStep === PROGRESS_STATUS_MAP.read.step"
        class="flex size-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-accent p-2 hover:bg-accent-light"
        @click="onSelectProgress(PROGRESS_STATUS_MAP.read.id)"
      >
        <IconBook :size="32" class="text-main" />
        {{ PROGRESS_STATUS_MAP.read.description }}
      </div>
      <div
        v-if="currentStep === PROGRESS_STATUS_MAP['not-finished'].step"
        class="flex size-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-accent p-2 hover:bg-accent-light"
        @click="onSelectProgress(PROGRESS_STATUS_MAP['not-finished'].id)"
      >
        <IconBookOff :size="32" class="text-main" />
        {{ PROGRESS_STATUS_MAP['not-finished'].description }}
      </div>
    </div>
  </bl-modal>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { faker } from '@faker-js/faker'
import type { Book, BookProgressStatus } from '~/types/book'
import type { Collection } from '~/types/collection'
import languageOptions from '~/public/languages-2.json'
import {
  type icons,
  IconEyeglass2,
  IconBook,
  IconBookOff,
  IconPlayerPause,
} from '@tabler/icons-vue'

const route = useRoute()

const isNew = computed(() => route.params.id === 'new')

const PROGRESS_STATUS_MAP: Record<
  BookProgressStatus,
  {
    id: BookProgressStatus
    description: string
    step: number
    icon: keyof typeof icons
  }
> = {
  unread: {
    id: 'unread',
    step: 1,
    description: 'Not read',
    icon: 'IconBook2',
  },
  queued: {
    id: 'queued',
    step: 2,
    description: 'Queued',
    icon: 'IconStackPush',
  },
  reading: {
    id: 'reading',
    step: 3,
    description: 'Reading',
    icon: 'IconEyeglass2',
  },
  paused: {
    id: 'paused',
    step: 3,
    description: 'Paused',
    icon: 'IconPlayerPause',
  },
  read: {
    id: 'read',
    step: 4,
    description: 'Read',
    icon: 'IconBook',
  },
  'not-finished': {
    id: 'not-finished',
    step: 4,
    description: 'Not finished',
    icon: 'IconBookOff',
  },
}

const managingCollections = ref(isNew.value)
const editing = ref(isNew.value)
const deleteModalRef = ref()
const stepperModalOpen = ref()
const book = ref<Book>()
const loading = ref(false)
const tempCoverSrc = ref(`temp-${faker.string.uuid()}`)
const allCollections = ref<(Collection & { selected: boolean })[]>([])

const { data: collections } = await useFetch<Collection[]>('/api/collections')

const collectionsDisplayed = computed(() => {
  return managingCollections.value
    ? allCollections.value
    : allCollections.value.filter((collection) => collection.selected)
})

const formattedDate = computed(() =>
  format(book.value?.createdAt ?? '', 'dd MMM yyyy'),
)

const currentStep = ref<number | undefined>(
  book.value
    ? PROGRESS_STATUS_MAP[book.value.progressStatus ?? 'unread'].step
    : undefined,
)

const languageSelectOptions = computed(() =>
  Object.entries(languageOptions).map(([value, label]) => ({ label, value })),
)

const progressSteps = computed(() => [
  PROGRESS_STATUS_MAP.unread,
  PROGRESS_STATUS_MAP.queued,
  book.value?.progressStatus === 'paused'
    ? PROGRESS_STATUS_MAP.paused
    : PROGRESS_STATUS_MAP.reading,
  book.value?.progressStatus === 'not-finished'
    ? PROGRESS_STATUS_MAP['not-finished']
    : PROGRESS_STATUS_MAP.read,
])

watch(isNew, () => {
  managingCollections.value = isNew.value
})

async function fetchBook() {
  if (isNew.value) {
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
      selected: !!book.value?.collections?.includes(collection.id),
    }))
    .sort((b1, b2) => b1.name.localeCompare(b2.name))

  currentStep.value =
    PROGRESS_STATUS_MAP[book.value?.progressStatus ?? 'unread'].step
}

async function deleteBook() {
  await $fetch<Book>(`/api/books/${route.params.id}`, {
    method: 'delete',
  })

  navigateTo('/library/books')
}

function onEdit(value: boolean) {
  editing.value = value
  managingCollections.value = value
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

async function onSubmit(bookValues: Book) {
  try {
    const updatedBook = await $fetch<Book>('/api/books', {
      method: 'post',
      body: {
        ...bookValues,
        collections: allCollections.value
          .filter(({ selected }) => !!selected)
          .map(({ id }) => id),
        tempCoverSrc: isNew.value ? tempCoverSrc.value : undefined,
        genres: book.value?.genres ?? [],
        rating: book.value?.rating,
        progressStatus: book.value?.progressStatus,
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
    book.value.rating = rating
  }
}

async function onSubmitGenre(genre: string | undefined, index: number) {
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

function onSelectProgress(progressStatus: BookProgressStatus) {
  if (book.value) {
    book.value.progressStatus = progressStatus
  }
  stepperModalOpen.value = false
}

function onProgressChange(progressStatusStep: number) {
  const progressStatus = progressSteps.value.find(
    ({ step }) => progressStatusStep === step,
  )

  if (progressStatus) {
    if (progressStatus.step === 3 || progressStatus.step === 4) {
      stepperModalOpen.value = true
    } else if (book.value) {
      book.value.progressStatus = progressStatus.id
    }
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

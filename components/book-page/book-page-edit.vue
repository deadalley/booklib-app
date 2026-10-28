<template>
  <section class="@container mx-auto flex w-full max-w-[90rem] flex-col gap-8">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <button
        type="button"
        class="text-ink-secondary hover:text-primary inline-flex cursor-pointer items-center gap-2 py-2 text-base font-semibold"
        @click="$emit('cancel')"
      >
        <IconArrowLeft :size="ICON_SIZE_SMALL" stroke="1.5" />
        Back
      </button>
      <div class="flex gap-2">
        <bl-button variant="secondary" @click="$emit('cancel')">
          {{ isNew ? 'Cancel' : 'Discard changes' }}
        </bl-button>
        <bl-button :disabled="!dirty" @click="onSave">
          <template #prependIcon="iconProps">
            <IconDeviceFloppy v-bind="iconProps" />
          </template>
          {{ isNew ? 'Create book' : 'Save changes' }}
        </bl-button>
      </div>
    </div>

    <header class="flex flex-col gap-2">
      <p class="book-page-section-title">
        {{ isNew ? 'New book' : 'Editing' }}
      </p>
      <h2 class="edit-title">{{ book.title?.trim() || 'Untitled book' }}</h2>
    </header>

    <div class="edit-grid">
      <aside class="flex min-w-0 flex-col gap-6">
        <div class="w-48 @min-[720px]:w-56">
          <bl-book-page-cover :book="book" :temp-cover-src="tempCoverSrc" />
        </div>

        <div class="flex flex-col gap-2.5">
          <p class="form-label">Rating</p>
          <bl-rating-input :rating="book.rating" @commit="onSelectRating" />
        </div>

        <div class="flex flex-col gap-2.5">
          <p class="form-label">Quick collections</p>
          <bl-book-page-default-collections
            :selected="selectedDefaultCollections"
            @default-collection-change="
              (id) => $emit('default-collection-change', id)
            "
          />
        </div>
      </aside>

      <ClientOnly>
        <div class="@container flex max-w-3xl min-w-0 flex-col gap-6">
          <FormKit
            v-model="book"
            type="form"
            :actions="false"
            :form-class="'flex flex-col gap-6'"
            @submit="onSave"
          >
            <section class="book-page-section">
              <p class="book-page-section-title">Book</p>
              <div class="flex flex-col gap-5">
                <bl-input
                  id="title"
                  name="title"
                  label="Title"
                  placeholder="Title"
                  :error="titleError"
                />
                <bl-input-autocomplete
                  id="author"
                  name="author"
                  label="Author"
                  placeholder="Author"
                  :options="authorSelectOptions"
                  can-create-new
                  clearable
                />
                <div class="edit-row">
                  <bl-input
                    id="publisher"
                    name="publisher"
                    label="Publisher"
                    placeholder="Publisher"
                  />
                  <bl-input
                    id="originalTitle"
                    name="originalTitle"
                    label="Original Title"
                    placeholder="Original Title"
                  />
                </div>
                <div class="edit-row">
                  <bl-input
                    id="year"
                    name="year"
                    label="Year"
                    placeholder="Year"
                    type="number"
                    :min="0"
                  />
                  <bl-input
                    id="pages"
                    name="pages"
                    label="Pages"
                    placeholder="Pages"
                    type="number"
                    :min="0"
                  />
                </div>
                <div class="edit-row">
                  <bl-select
                    id="language"
                    name="language"
                    label="Language"
                    placeholder="Language"
                    :options="languageSelectOptions"
                  />
                  <bl-select
                    id="originalLanguage"
                    name="originalLanguage"
                    label="Original Language"
                    placeholder="Original Language"
                    :options="languageSelectOptions"
                  />
                </div>
                <div class="edit-row">
                  <bl-select
                    id="format"
                    name="format"
                    label="Format"
                    placeholder="Format"
                    :options="formatOptions"
                  />
                  <bl-input
                    id="isbn"
                    name="isbn"
                    label="ISBN"
                    placeholder="ISBN"
                  />
                </div>
                <bl-input
                  id="summary"
                  type="textarea"
                  name="summary"
                  label="Summary"
                  placeholder="Summary"
                  :rows="5"
                />
              </div>
            </section>

            <section class="book-page-section">
              <p class="book-page-section-title">Reading</p>
              <div class="edit-row">
                <bl-input
                  id="startedAt"
                  v-model="startedAt"
                  type="date"
                  label="Started reading on"
                  placeholder="Start date"
                  :ignore="true"
                  clearable
                />
                <bl-input
                  id="finishedAt"
                  v-model="finishedAt"
                  type="date"
                  label="Finished reading on"
                  placeholder="End date"
                  :ignore="true"
                  :error="dateError"
                  clearable
                />
              </div>
            </section>

            <section class="book-page-section">
              <p class="book-page-section-title">Genres</p>
              <bl-book-page-genre-editor
                :genres="book.genres ?? []"
                @add="(genre) => onSelectGenre(genre, book.genres?.length ?? 0)"
                @remove="onRemoveGenre"
              />
            </section>

            <section v-if="customCollections.length" class="book-page-section">
              <p class="book-page-section-title">Collections</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="collection in customCollections"
                  :key="collection.id"
                  type="button"
                  class="pill"
                  :class="{ 'pill-selected': collection.selected }"
                  :aria-pressed="!!collection.selected"
                  @click="
                    $emit('collection-select', {
                      collectionId: String(collection.id),
                      selected: !collection.selected,
                    })
                  "
                >
                  <IconCheck v-if="collection.selected" :size="14" stroke="2" />
                  {{ collection.name }}
                </button>
              </div>
            </section>
          </FormKit>

          <div class="flex flex-wrap justify-end gap-2">
            <bl-button variant="secondary" @click="$emit('cancel')">
              {{ isNew ? 'Cancel' : 'Discard changes' }}
            </bl-button>
            <bl-button :disabled="!dirty" @click="onSave">
              <template #prependIcon="iconProps">
                <IconDeviceFloppy v-bind="iconProps" />
              </template>
              {{ isNew ? 'Create book' : 'Save changes' }}
            </bl-button>
          </div>
        </div>
      </ClientOnly>
    </div>
  </section>
</template>

<script
  setup
  lang="ts"
  generic="
    T extends {
      id: string | number
      name: string
      books: { id: string; order: number }[]
      selected?: boolean
    }
  "
>
import { IconArrowLeft, IconCheck, IconDeviceFloppy } from '@tabler/icons-vue'
import { BOOK_FORMAT_MAP, DEFAULT_COLLECTIONS } from '~/utils/constants'
import { fromSimpleDate, toSimpleDate } from '~/utils/date'
import type { Book } from '~/types/book'

const book = defineModel<Book>('book', { required: true })

const props = defineProps<{
  isNew: boolean
  tempCoverSrc: string
  selectedDefaultCollections: Record<string, boolean>
  authorSelectOptions: { label: string; value: string }[]
  languageSelectOptions: { label: string; value: string }[]
  collectionsDisplayed: T[]
  onSelectRating: (rating: number | null) => Promise<void>
  onSelectGenre: (
    genre: string | undefined,
    index: number,
  ) => void | Promise<void>
  onRemoveGenre: (index: number) => void | Promise<void>
}>()

const emit = defineEmits<{
  (e: 'cancel' | 'save'): void
  (e: 'default-collection-change', collectionId: string): void
  (
    e: 'collection-select',
    payload: { collectionId: string; selected: boolean },
  ): void
}>()

const submitAttempted = ref(false)

const formatOptions = Object.values(BOOK_FORMAT_MAP).map(
  ({ id, description, icon }) => ({ label: description, value: id, icon }),
)

const customCollections = computed(() =>
  props.collectionsDisplayed.filter(
    ({ id }) => !DEFAULT_COLLECTIONS.includes(String(id)),
  ),
)

function dateModel(key: 'startedAt' | 'finishedAt') {
  return computed({
    get: () => {
      const value = book.value.progress?.[key]
      return value ? toSimpleDate(value) : undefined
    },
    set: (value: string | undefined) => {
      book.value.progress = {
        ...book.value.progress,
        [key]: value ? fromSimpleDate(value) : null,
      }
    },
  })
}

const startedAt = dateModel('startedAt')
const finishedAt = dateModel('finishedAt')

const titleError = computed(
  () =>
    submitAttempted.value && !book.value.title?.trim() && 'Title is required',
)

const dateError = computed(
  () =>
    !!startedAt.value &&
    !!finishedAt.value &&
    finishedAt.value < startedAt.value &&
    'Finish date is before start date',
)

const DIRTY_FIELDS = [
  'title',
  'author',
  'publisher',
  'originalTitle',
  'year',
  'pages',
  'language',
  'originalLanguage',
  'format',
  'isbn',
  'summary',
  'rating',
] as const

function normalize(value: unknown) {
  return value === undefined || value === null || value === ''
    ? ''
    : String(value)
}

const formState = computed(() =>
  JSON.stringify({
    fields: DIRTY_FIELDS.map((field) => normalize(book.value[field])),
    startedAt: normalize(startedAt.value),
    finishedAt: normalize(finishedAt.value),
    genres: book.value.genres ?? [],
    collections: props.collectionsDisplayed
      .filter(({ selected }) => selected)
      .map(({ id }) => String(id))
      .sort(),
    defaultCollections: DEFAULT_COLLECTIONS.filter(
      (id) => props.selectedDefaultCollections[id],
    ),
  }),
)

const initialSnapshot = ref(formState.value)

const dirty = computed(() => formState.value !== initialSnapshot.value)

function onSave() {
  submitAttempted.value = true

  if (!dirty.value || titleError.value || dateError.value) return

  emit('save')
}

function onKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
    event.preventDefault()
    onSave()
  }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
@reference '../../assets/css/main.css';

.edit-title {
  @apply leading-[1.05] wrap-anywhere;
  font-size: clamp(1.75rem, 5cqi, 2.986rem);
  text-wrap: balance;
}

.edit-grid {
  @apply grid grid-cols-[minmax(0,1fr)] items-start gap-8;
  @apply @min-[720px]:grid-cols-[14rem_minmax(0,1fr)] @min-[720px]:gap-12;
}

.edit-row {
  @apply flex flex-col gap-4 @min-[480px]:flex-row;
}

.edit-row > * {
  @apply min-w-0 flex-1;
}
</style>

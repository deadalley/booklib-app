<template>
  <section class="flex flex-1 flex-col gap-10 2xl:w-9/12 2xl:overflow-auto">
    <header class="flex flex-col gap-6">
      <button
        class="hover:text-primary hidden items-center gap-2 sm:flex"
        @click="$emit('back')"
      >
        <IconArrowLeft :size="ICON_SIZE_SMALL" stroke="1.5" />
        <h6>Back</h6>
      </button>
      <div class="flex flex-col items-start justify-between gap-3 md:flex-row">
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
              <div v-if="editing" class="flex w-full justify-start gap-2">
                <bl-button expand variant="secondary" @click="$emit('cancel')">
                  {{ isNew ? 'Cancel' : 'Discard changes' }}
                </bl-button>
                <bl-button expand @click="$emit('save')">
                  {{ isNew ? 'Create book' : 'Save changes' }}
                </bl-button>
              </div>

              <bl-button
                v-if="!editing"
                variant="secondary"
                @click="$emit('edit')"
              >
                <template #prependIcon>
                  <IconEdit :size="ICON_SIZE_SMALL" stroke="1.5" />
                </template>
              </bl-button>
              <bl-modal
                v-if="!isNew && !editing"
                size="sm"
                @confirm="$emit('delete')"
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
          <div v-if="!isNew" class="flex flex-col justify-end leading-tight">
            <p>Added on</p>
            <h6 class="w-max">{{ formattedDate }}</h6>
          </div>
        </div>
      </div>
    </header>
    <div class="flex flex-1 flex-col gap-10 lg:flex-row lg:overflow-auto">
      <div class="flex flex-col gap-2">
        <div class="lg:w-80">
          <bl-book-image editing :book="book" :temp-cover-src="tempCoverSrc" />
        </div>
        <bl-multiselect class="w-full">
          <bl-multiselect-option
            v-for="item in DEFAULT_COLLECTIONS"
            :key="item"
            :value="item"
            :selected="!!selectedDefaultCollections[item]"
            @select="$emit('default-collection-change', item)"
          >
            <template #icon="iconProps">
              <component
                :is="
                  icons[
                    (selectedDefaultCollections[item]
                      ? DEFAULT_COLLECTION_ICONS_FILLED
                      : DEFAULT_COLLECTION_ICONS)[item]!!
                  ]
                "
                class="text-primary"
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
            @change="(step) => $emit('progress-change', step)"
          />
          <bl-modal v-model="stepperModalOpen" :with-close-button="false">
            <div class="flex flex-col gap-5">
              <div class="flex flex-col gap-3">
                <div class="flex justify-center gap-3">
                  <div
                    v-for="status in Object.values(PROGRESS_STATUS_MAP).filter(
                      ({ step }) => step === currentStep,
                    )"
                    :key="status.id"
                    class="border-stroke hover:bg-surface-subtle flex size-32 cursor-pointer flex-col items-center justify-center rounded-xl border p-2"
                    @click="$emit('status-select', status.id)"
                  >
                    <component
                      :is="icons[status.icon]"
                      :size="32"
                      class="text-primary"
                    />
                    {{ status.description }}
                  </div>
                </div>
              </div>
              <div class="flex flex-col">
                <bl-checkbox
                  v-if="currentStep === 2"
                  v-model="startReadingBookToday"
                  align="left"
                >
                  Update start reading date to today
                </bl-checkbox>
                <bl-checkbox
                  v-if="currentStep === 3"
                  v-model="finishReadingBookToday"
                  align="left"
                >
                  Update finish reading date to today
                </bl-checkbox>
              </div>
              <bl-button
                variant="secondary"
                expand
                @click="stepperModalOpen = false"
              >
                Cancel
              </bl-button>
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
            @submit="$emit('save')"
          >
            <section class="book-section max-w-3xl">
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
                class="flex max-w-3xl flex-col items-center gap-3"
              >
                <p>This book is not assigned any collections.</p>
              </div>
              <div
                v-if="!!collectionsDisplayed.length"
                class="grid h-min w-full grid-cols-1 flex-wrap gap-x-6 gap-y-8 overflow-x-hidden overflow-y-auto p-3 md:grid-cols-[repeat(auto-fill,minmax(9rem,1fr))]"
              >
                <bl-collection-tile
                  v-for="collection in collectionsDisplayed"
                  :key="collection.id"
                  :collection="collection"
                  :selectable="managingCollections"
                  collection-type="collections"
                  :icon="DEFAULT_COLLECTION_ICONS_FILLED[collection.id]"
                  @select="(payload) => $emit('collection-select', payload)"
                />
              </div>
            </section>

            <section v-if="!externalBooks.length && false" class="book-section">
              <template v-if="!externalBooks.length && false">
                <h4>Find books</h4>
                <bl-button @click="$emit('fetch-google-books')"
                  >Fetch</bl-button
                >
              </template>
              <div
                v-if="externalBooks.length"
                class="relative flex size-max gap-x-6 p-3 transition duration-100 ease-out"
              >
                <bl-book-card
                  v-for="b in externalBooks"
                  :key="b.title"
                  :book="b"
                  class="w-36!"
                />
              </div>
            </section>
          </FormKit>
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
import { IconArrowLeft, IconEdit, icons, IconTrash } from '@tabler/icons-vue'
import {
  BOOK_FORMAT_MAP,
  DEFAULT_COLLECTIONS,
  DEFAULT_COLLECTION_ICONS,
  DEFAULT_COLLECTION_ICONS_FILLED,
  PROGRESS_STATUS_MAP,
} from '~/utils/constants'
import type { Book, BookProgressStatus } from '~/types/book'

const book = defineModel<Book>('book', { required: true })
const currentStep = defineModel<number | undefined>('currentStep')
const stepperModalOpen = defineModel<boolean>('stepperModalOpen', {
  default: false,
})
const startReadingBookToday = defineModel<boolean>('startReadingBookToday', {
  default: false,
})
const finishReadingBookToday = defineModel<boolean>('finishReadingBookToday', {
  default: false,
})

defineProps<{
  isNew: boolean
  editing: boolean
  authorName?: string
  formattedDate: string | undefined
  tempCoverSrc: string
  selectedDefaultCollections: Record<string, boolean>
  progressSteps: { step: number; title?: string; description?: string }[]
  managingCollections: boolean
  authorSelectOptions: { label: string; value: string }[]
  languageSelectOptions: { label: string; value: string }[]
  collectionsDisplayed: T[]
  externalBooks: Book[]
  dateFormatter: (date: Date | undefined) => string | undefined
  onSelectRating: (rating: number) => Promise<void>
  onSelectGenre: (
    genre: string | undefined,
    index: number,
  ) => void | Promise<void>
  onRemoveGenre: (index: number) => void | Promise<void>
}>()

defineEmits<{
  (
    e: 'back' | 'cancel' | 'save' | 'edit' | 'delete' | 'fetch-google-books',
  ): void
  (e: 'default-collection-change', collectionId: string): void
  (e: 'progress-change', step: number): void
  (e: 'status-select', status: BookProgressStatus): void
  (
    e: 'collection-select',
    payload: { collectionId: string; selected: boolean },
  ): void
}>()
</script>

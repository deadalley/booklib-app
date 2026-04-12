<template>
  <section
    class="flex min-h-0 flex-1 flex-col gap-8 overflow-hidden 2xl:w-8/12"
  >
    <div class="flex items-center justify-between">
      <!-- Breadcrumbs -->
      <bl-breadcrumbs
        :items="[
          { label: 'Library', to: '../../' },
          { label: primaryCollectionName, to: '../' },
          { label: book.title },
        ]"
      />
      <!-- Actions -->
      <div class="flex items-center gap-2 self-start">
        <bl-modal size="sm" @confirm="$emit('delete')">
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
        <bl-button variant="secondary" @click="$emit('edit')">
          <template #prependIcon>
            <IconEdit :size="ICON_SIZE_SMALL" stroke="1.5" />
          </template>
        </bl-button>
      </div>
    </div>

    <div
      class="grid h-full min-h-0 flex-1 gap-16 xl:grid-cols-[24rem_minmax(0,1fr)] 2xl:grid-cols-[24rem_minmax(0,1fr)]"
    >
      <aside class="flex flex-col gap-4">
        <bl-book-page-cover :book="book" editing />

        <bl-book-page-default-collections
          :selected-default-collections="selectedDefaultCollections"
          @default-collection-change="
            $emit('default-collection-change', $event)
          "
        />

        <bl-book-page-reading-progress
          :progress="readingProgress"
          :subtitle="readingProgressSubtitle"
          :stats="readingStats"
        />
      </aside>

      <div class="flex h-full min-h-0 flex-col gap-6 overflow-y-auto pr-1">
        <section class="main-content-section">
          <bl-book-page-header
            :book="book"
            :primary-collection-name="primaryCollectionName"
            :author-name="authorName"
            :rating-summary="ratingSummary"
            :formatted-date="formattedDate"
          />
        </section>

        <section class="main-content-section">
          <bl-book-page-fields :fields="bookFields" />
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
          <bl-book-page-status-progress
            :current-step="currentStep"
            :current-status="book.progressStatus ?? 'not-owned'"
            :badge-label="lifecycleBadgeLabel"
            :steps="progressSteps"
            :state-options="lifecycleStateOptions"
            @step-change="(step) => $emit('step-change', step)"
            @status-select="(status) => $emit('status-select', status)"
          />
        </section>

        <section class="main-content-section">
          <div class="flex flex-col gap-4">
            <p class="section-title">Notes</p>

            <bl-book-page-notes
              :book="book"
              @add-note="(note) => $emit('add-note', note)"
              @update-note="(note) => $emit('update-note', note)"
              @delete-note="(note) => $emit('delete-note', note)"
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
</template>

<script setup lang="ts">
import type { icons } from '@tabler/icons-vue'
import { IconEdit, IconTrash } from '@tabler/icons-vue'
import {
  BOOK_FORMAT_MAP,
  DEFAULT_COLLECTION_ICONS_FILLED,
  ICON_SIZE_SMALL,
} from '~/utils/constants'
import { toFullDateCompact } from '~/utils/date'
import type { Book, BookProgressStatus } from '~/types/book'
import type { Collection } from '~/types/collection'
import type { Goal } from '~/types/goal'
import languageOptions from '~/public/languages-2.json'
import type { Author } from '~/types/author'

const props = defineProps<{
  book: Book
  authors: Author[]
  primaryCollectionName: string
  isFavorite: boolean
  authorName?: string
  currentStep: number
  lifecycleBadgeLabel: string
  progressSteps: { step: number; title?: string; description?: string }[]
  lifecycleStateOptions: {
    id: BookProgressStatus
    label: string
    icon: keyof typeof icons
  }[]
  readingProgress: number
  readingProgressSubtitle: string
  readingSecondaryLabel: string
  readingSecondaryValue: string
  selectedDefaultCollections: Record<string, boolean>
  collectionsDisplayed: (Collection & { selected?: boolean })[]
  bookGoals: Goal[]
  onSelectRating: (rating: number) => Promise<void>
}>()

const emit = defineEmits<{
  (e: 'share' | 'favorite-toggle' | 'edit' | 'delete'): void
  (e: 'add-note', payload: { content: string; page?: number }): void
  (
    e: 'update-note',
    payload: { index: number; content: string; page?: number },
  ): void
  (e: 'delete-note', payload: { index: number }): void
  (e: 'step-change', step: number): void
  (e: 'status-select', status: BookProgressStatus): void
  (e: 'default-collection-change', collectionId: string): void
}>()

const ratingSummary = computed(() => {
  const rating = props.book.rating

  if (!rating) return '-'

  const formattedRating = Number.isInteger(rating)
    ? rating.toFixed(0)
    : rating.toFixed(1)

  return formattedRating
})

const formattedDate = computed(() => toFullDateCompact(props.book.createdAt))

const bookFields = computed(() => {
  return [
    { label: 'Publisher', value: props.book.publisher },
    {
      label: 'Language',
      value: props.book.language
        ? (languageOptions[
            props.book.language as keyof typeof languageOptions
          ] ?? props.book.language)
        : undefined,
    },
    { label: 'Year', value: props.book.year?.toString() },
    { label: 'Original Title', value: props.book.originalTitle },
    {
      label: 'Original Language',
      value: props.book.originalLanguage
        ? (languageOptions[
            props.book.originalLanguage as keyof typeof languageOptions
          ] ?? props.book.originalLanguage)
        : undefined,
    },
    { label: 'Pages', value: props.book.pages?.toString() },
    {
      label: 'Format',
      value: props.book.format
        ? BOOK_FORMAT_MAP[props.book.format]?.description
        : undefined,
      icon: props.book.format
        ? (BOOK_FORMAT_MAP[props.book.format]?.icon as keyof typeof icons)
        : undefined,
    },
  ]
})

const readingStats = computed(() => {
  const totalPages = props.book.pages
  const pagesRead = totalPages
    ? Math.round((totalPages * props.readingProgress) / 100)
    : undefined
  const pagesRemaining =
    totalPages && pagesRead !== undefined
      ? Math.max(totalPages - pagesRead, 0)
      : undefined

  return [
    {
      label: 'Pages Read',
      value:
        totalPages && pagesRead !== undefined
          ? `${pagesRead} / ${totalPages}`
          : 'Unknown',
    },
    {
      label: 'Remaining',
      value:
        pagesRemaining !== undefined ? `${pagesRemaining} pages` : 'Unknown',
    },
    {
      label: 'Started Reading',
      value: props.book.startedAt
        ? toFullDateCompact(props.book.startedAt)
        : 'Not started',
    },
    {
      label: 'Finished Reading',
      value: props.book.finishedAt
        ? toFullDateCompact(props.book.finishedAt)
        : 'In progress',
    },
  ]
})
</script>

<style scoped>
@reference '../../assets/css/main.css';

.section-title {
  @apply text-primary text-base font-semibold tracking-widest uppercase;
}

.main-content-section {
  @apply border-stroke-subtle flex flex-col gap-4 border-b pb-6;
}
</style>

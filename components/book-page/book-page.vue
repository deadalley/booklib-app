<template>
  <section class="flex flex-1 flex-col gap-8 2xl:w-9/12 2xl:overflow-auto">
    <div class="flex items-center justify-between">
      <!-- Breadcrumbs -->
      <div
        class="tracking-caps flex items-center gap-2 text-xs font-semibold uppercase"
      >
        <span class="text-ink-muted">Library</span>
        <span class="text-ink-muted"><IconChevronRight :size="13" /></span>
        <span class="text-ink-muted">{{ primaryCollectionName }}</span>
        <span class="text-ink-muted"><IconChevronRight :size="13" /></span>
        <span class="text-primary font-bold">{{ book.title }}</span>
      </div>
      <!-- Actions -->
      <div class="flex items-center gap-2 self-start">
        <bl-button variant="secondary" @click="$emit('edit')">
          <template #prependIcon>
            <IconEdit :size="ICON_SIZE_SMALL" stroke="1.5" />
          </template>
          Edit
        </bl-button>
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
      </div>
    </div>

    <div
      class="grid gap-16 xl:grid-cols-[20rem_minmax(0,1fr)] 2xl:grid-cols-[22rem_minmax(0,1fr)]"
    >
      <aside class="flex flex-col gap-4">
        <!-- Cover -->
        <div>
          <div class="rounded-scholarly bg-surface-canvas shadow-md">
            <bl-book-image
              :book="book"
              img-size-class="h-[29rem]! sm:h-[33rem]!"
            />
          </div>
        </div>

        <!-- Action -->
        <bl-button expand @click="onPrimaryAction">
          <template #prependIcon>
            <component
              :is="icons[primaryAction.icon]"
              :size="ICON_SIZE_SMALL"
              stroke="1.75"
            />
          </template>
          {{ primaryAction.label }}
        </bl-button>
      </aside>

      <div class="flex flex-col gap-6 pr-1">
        <bl-book-page-header
          :book="book"
          :primary-collection-name="primaryCollectionName"
          :author-name="authorName"
          :rating-summary="ratingSummary"
        />

        <!-- <bl-book-lifecycle-card
          :current-step="currentStep"
          :current-status="book.progressStatus ?? 'not-owned'"
          :badge-label="lifecycleBadgeLabel"
          :steps="progressSteps"
          :state-options="lifecycleStateOptions"
          @step-change="(step) => $emit('step-change', step)"
          @status-select="(status) => $emit('status-select', status)"
        /> -->

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

        <bl-book-reading-summary-card
          :progress="readingProgress"
          :subtitle="readingProgressSubtitle"
          :stats="readingStats"
        />

        <div class="grid gap-4 md:grid-cols-2">
          <bl-book-details-card :items="bookFactsPrimary" />
          <bl-book-details-card :items="bookFactsSecondary" />
        </div>
      </div>
    </div>

    <section
      v-if="collectionsDisplayed.length"
      class="border-stroke-subtle flex flex-col gap-4 border-t pt-8"
    >
      <p
        class="text-ink-muted tracking-caps text-[11px] font-semibold uppercase"
      >
        Collections
      </p>
      <div
        class="grid h-min w-full grid-cols-1 gap-x-6 gap-y-8 overflow-x-hidden overflow-y-auto md:grid-cols-[repeat(auto-fill,minmax(9rem,1fr))]"
      >
        <bl-collection-tile
          v-for="collection in collectionsDisplayed"
          :key="collection.id"
          :collection="collection"
          collection-type="collections"
          :icon="DEFAULT_COLLECTION_ICONS_FILLED[collection.id]"
        />
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import {
  icons,
  IconChevronRight,
  IconEdit,
  IconHeart,
  IconHeartFilled,
  IconShare3,
  IconTrash,
} from '@tabler/icons-vue'
import {
  DEFAULT_COLLECTION_ICONS_FILLED,
  ICON_SIZE_SMALL,
  PROGRESS_STATUS_MAP,
} from '~/utils/constants'
import type { Book, BookProgressStatus } from '~/types/book'
import type { Collection } from '~/types/collection'

const stepperModalOpen = defineModel<boolean>('stepperModalOpen', {
  default: false,
})
const startReadingBookToday = defineModel<boolean>('startReadingBookToday', {
  default: false,
})
const finishReadingBookToday = defineModel<boolean>('finishReadingBookToday', {
  default: false,
})

const props = defineProps<{
  book: Book
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
  bookFactsPrimary: { label: string; value: string | number }[]
  bookFactsSecondary: { label: string; value: string | number }[]
  readingProgress: number
  readingProgressSubtitle: string
  readingSecondaryLabel: string
  readingSecondaryValue: string
  collectionsDisplayed: (Collection & { selected?: boolean })[]
  onSelectRating: (rating: number) => Promise<void>
}>()

const emit = defineEmits<{
  (e: 'share' | 'favorite-toggle' | 'edit' | 'delete'): void
  (e: 'step-change', step: number): void
  (e: 'status-select', status: BookProgressStatus): void
}>()

const ratingSummary = computed(() => {
  const rating = props.book.rating

  if (!rating) return '-'

  const formattedRating = Number.isInteger(rating)
    ? rating.toFixed(0)
    : rating.toFixed(1)

  return formattedRating
})

const primaryAction = computed(() => {
  const status = props.book.progressStatus ?? 'not-owned'

  if (status === 'not-owned') {
    return {
      label: 'Mark as Owned',
      caption:
        'Move this book into your active library before you start reading.',
      icon: PROGRESS_STATUS_MAP.owned.icon,
      nextStatus: 'owned' as BookProgressStatus,
    }
  }

  if (status === 'owned') {
    return {
      label: 'Start Reading',
      caption:
        'Begin tracking progress and move this title into your reading flow.',
      icon: PROGRESS_STATUS_MAP.reading.icon,
      nextStatus: 'reading' as BookProgressStatus,
    }
  }

  if (status === 'read') {
    return {
      label: 'Read Again',
      caption: 'Jump back into this book and reopen progress tracking.',
      icon: PROGRESS_STATUS_MAP.reading.icon,
      nextStatus: 'reading' as BookProgressStatus,
    }
  }

  return {
    label: 'Resume Reading',
    caption:
      'Keep the session moving and continue from the current reading state.',
    icon: PROGRESS_STATUS_MAP.reading.icon,
    nextStatus: 'reading' as BookProgressStatus,
  }
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
      label: props.readingSecondaryLabel,
      value: props.readingSecondaryValue,
    },
  ]
})

function onPrimaryAction() {
  emit('status-select', primaryAction.value.nextStatus)
}
</script>

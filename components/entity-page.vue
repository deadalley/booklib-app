<template>
  <section class="@container mx-auto flex w-full max-w-[90rem] flex-col gap-8">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <bl-breadcrumbs
        :items="[
          { label: 'Library', to: '/library' },
          { label: isCollection ? 'Collections' : 'Authors', to: listHref },
          { label: entity.name },
        ]"
      />

      <div class="flex items-center gap-2">
        <bl-button :to="editHref" variant="secondary">
          <template #prependIcon>
            <IconEdit :size="ICON_SIZE_SMALL" stroke="1.5" />
          </template>
          Edit
        </bl-button>
        <bl-delete-collection-modal
          v-if="canDelete"
          :name="entity.name"
          @confirm="(deleteBooks) => $emit('delete', deleteBooks)"
        >
          <template #trigger>
            <bl-button
              variant="secondary"
              :aria-label="`Delete ${kind}`"
              :title="`Delete ${kind}`"
            >
              <template #prependIcon>
                <IconTrash :size="ICON_SIZE_SMALL" stroke="1.5" />
              </template>
            </bl-button>
          </template>
        </bl-delete-collection-modal>
      </div>
    </div>

    <header class="book-page-hero">
      <div class="book-page-hero-cover book-page-cover-frame">
        <bl-entity-cover-mosaic :books="books" :empty-icon="emptyIcon" />
      </div>

      <div class="flex min-w-0 flex-col gap-4">
        <div class="flex flex-col gap-2">
          <p class="book-page-section-title inline-flex items-center gap-1.5">
            <component
              :is="icons[kickerIcon]"
              v-if="kickerIcon"
              :size="16"
              stroke="1.6"
            />
            {{ kicker }}
          </p>
          <h1 class="book-page-title">{{ entity.name }}</h1>
        </div>

        <div
          class="text-ink-primary flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.9375rem] font-semibold"
        >
          <div class="inline-flex items-center gap-2">
            <span>{{ books.length }}</span>
            <span class="text-ink-muted font-medium">
              {{ books.length === 1 ? 'book' : 'books' }}
            </span>
          </div>
          <template v-if="isCollection && authorCount">
            <span class="bg-stroke h-4 w-px" aria-hidden="true" />
            <div class="inline-flex items-center gap-2">
              <span>{{ authorCount }}</span>
              <span class="text-ink-muted font-medium">
                {{ authorCount === 1 ? 'author' : 'authors' }}
              </span>
            </div>
          </template>
          <span class="bg-stroke h-4 w-px" aria-hidden="true" />
          <div
            class="inline-flex items-center gap-2"
            :title="rating ? `Average ${rating} out of 5` : undefined"
          >
            <bl-rating :rating="rating ?? 0" :icon-size="16" />
            <span>{{ rating ? rating.toFixed(1) : 'Not rated' }}</span>
          </div>
          <template v-if="entity.createdAt">
            <span class="bg-stroke h-4 w-px" aria-hidden="true" />
            <div class="inline-flex items-center gap-2">
              <span class="text-ink-muted font-medium">Added</span>
              <span>{{ toFullDateCompact(entity.createdAt) }}</span>
            </div>
          </template>
        </div>

        <div v-if="genres.length" class="flex flex-wrap gap-2">
          <bl-chip v-for="genre in genres" :key="genre" rounded>
            {{ genre }}
          </bl-chip>
        </div>
      </div>
    </header>

    <div class="book-page-body">
      <div class="book-page-body-progress">
        <bl-entity-progress-card :books="books" />
      </div>

      <div class="book-page-body-main">
        <section class="book-page-section">
          <div
            class="flex min-h-7 flex-wrap items-center justify-between gap-3"
          >
            <p class="book-page-section-title">
              {{ books.length }} {{ books.length === 1 ? 'Book' : 'Books' }}
            </p>
            <div v-if="books.length" class="flex flex-wrap items-center gap-2">
              <bl-button
                v-if="pickable && !reordering"
                variant="secondary"
                @click="$emit('pick')"
              >
                <template #prependIcon="iconProps">
                  <IconDice5 v-bind="iconProps" />
                </template>
                Pick next read
              </bl-button>
              <bl-button
                v-if="reorderable && books.length > 1"
                :variant="reordering ? 'primary' : 'secondary'"
                @click="toggleReordering"
              >
                <template #prependIcon="iconProps">
                  <IconCheck v-if="reordering" v-bind="iconProps" />
                  <IconArrowsSort v-else v-bind="iconProps" />
                </template>
                {{ reordering ? 'Done' : 'Reorder' }}
              </bl-button>
              <bl-view-switch v-if="!reordering" v-model:view="view" />
            </div>
          </div>
          <p v-if="reordering" class="notice" role="status">
            <IconInfoCircle :size="16" stroke="1.8" class="flex-none" />
            {{ reorderHint }}
          </p>

          <template v-if="books.length">
            <bl-books-grid
              v-if="reordering"
              v-model="ordered"
              draggable
              data-testid="reorder-grid"
              @drag="onReorder"
            />
            <bl-books-grid v-else-if="view === 'cards'" :model-value="books" />
            <div v-else class="overflow-x-auto">
              <bl-books-table
                :books="books"
                :selected-table-columns="TABLE_COLUMNS"
                interactive
                row-clickable
              />
            </div>
          </template>
          <div
            v-else
            class="border-stroke bg-surface-subtle flex flex-col items-center gap-4 rounded-xl border border-dashed px-4 py-16"
          >
            <p class="text-ink-secondary">
              {{
                isCollection
                  ? 'There are no books in this collection.'
                  : 'There are no books by this author.'
              }}
            </p>
            <bl-button :to="editHref" variant="secondary">
              <template #prependIcon="iconProps">
                <IconPlus v-bind="iconProps" />
              </template>
              Add books
            </bl-button>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  IconArrowsSort,
  IconCheck,
  IconDice5,
  IconEdit,
  IconInfoCircle,
  IconPlus,
  IconTrash,
  icons,
} from '@tabler/icons-vue'
import type { Book, ViewBook } from '~/types/book'
import type { View } from '~/types/ui'
import { toFullDateCompact } from '~/utils/date'

const props = defineProps<{
  kind: 'collection' | 'author'
  entity: { id: string; name: string; createdAt?: string }
  books: ViewBook[]
  canDelete?: boolean
  // Collections: books can be dragged into order (e.g. reading priority)
  reorderable?: boolean
  // Shows "Pick next read"
  pickable?: boolean
}>()

const emit = defineEmits<{
  (e: 'delete', deleteBooks: boolean): void
  (e: 'pick'): void
  // The books' ids in their new order
  (e: 'reorder', bookIds: Book['id'][]): void
}>()

const TABLE_COLUMNS: {
  [key in keyof Book]?: { label: string; checked: boolean }
} = {
  coverSrc: { label: 'Cover', checked: false },
  publisher: { label: 'Publisher', checked: false },
  language: { label: 'Language', checked: false },
  year: { label: 'Year', checked: true },
  pages: { label: 'Pages', checked: true },
  rating: { label: 'Rating', checked: true },
  originalTitle: { label: 'Original Title', checked: false },
  originalLanguage: { label: 'Original Language', checked: false },
  isbn: { label: 'ISBN', checked: false },
  progress: { label: 'Status', checked: true },
}

const view = ref<View>('cards')

// Reordering works on a copy, numbered from 1, saved after every move
const reordering = ref(false)
const ordered = ref<ViewBook[]>([])

const reorderHint = computed(() =>
  props.entity.id === TBR_COLLECTION_ID
    ? 'Drag books into the order you want to read them, or focus a handle and use the arrow keys. The first unstarted book is up next.'
    : 'Drag books into order, or focus a handle and use the arrow keys.',
)

function toggleReordering() {
  reordering.value = !reordering.value
  if (reordering.value) {
    ordered.value = props.books.map((book, order) => ({ ...book, order }))
  }
}

function onReorder() {
  ordered.value = ordered.value.map((book, order) => ({ ...book, order }))
  emit(
    'reorder',
    ordered.value.map(({ id }) => id),
  )
}

const isCollection = computed(() => props.kind === 'collection')
const listHref = computed(() =>
  isCollection.value ? '/library/collections' : '/library/authors',
)
const editHref = computed(() => `${listHref.value}/${props.entity.id}/edit`)

const isDefaultCollection = computed(
  () => isCollection.value && DEFAULT_COLLECTIONS.includes(props.entity.id),
)

const kicker = computed(() => {
  if (!isCollection.value) return 'Author'
  return isDefaultCollection.value ? 'Default collection' : 'Collection'
})

const kickerIcon = computed(() =>
  isDefaultCollection.value
    ? DEFAULT_COLLECTION_ICONS_FILLED[props.entity.id]
    : undefined,
)

const emptyIcon = computed(() =>
  isCollection.value ? 'IconArchive' : 'IconFeather',
)

const authorCount = computed(
  () => new Set(props.books.map(({ author }) => author).filter(Boolean)).size,
)

const rating = computed(() => getAverageRating(props.books))

const genres = computed(() =>
  [...new Set(props.books.flatMap(({ genres }) => genres ?? []))].slice(0, 6),
)
</script>

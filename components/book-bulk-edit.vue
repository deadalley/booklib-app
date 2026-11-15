<template>
  <bl-modal
    v-model="open"
    size="md"
    sheet
    allow-overflow
    :confirm-disabled="!change"
    @confirm="change && emit('change', change)"
  >
    <template #title>Edit {{ pluralBooks(books.length) }}</template>
    <template #subtitle>Change one field for every selected book.</template>

    <div class="bulk-edit" data-testid="bulk-action-form">
      <!-- The selection -->
      <div class="bulk-edit-selection">
        <div class="bulk-edit-covers" aria-hidden="true">
          <span
            v-for="book in coverBooks"
            :key="book.id"
            class="bulk-edit-cover"
          >
            <NuxtImg
              v-if="book.coverSrc"
              :src="book.coverSrc"
              alt=""
              class="size-full object-cover"
            />
            <IconBook v-else :size="14" stroke="1.6" />
          </span>
          <span v-if="moreCount" class="bulk-edit-cover more">
            +{{ moreCount }}
          </span>
        </div>
        <div class="min-w-0">
          <p class="bulk-edit-selection-title">
            {{ pluralBooks(books.length) }} selected
          </p>
          <p class="bulk-edit-selection-names">{{ names }}</p>
        </div>
      </div>

      <!-- Which field -->
      <section class="bulk-edit-section">
        <p id="bulk-edit-field" class="bulk-edit-label">
          What do you want to change?
        </p>
        <div
          class="bulk-edit-fields"
          role="radiogroup"
          aria-labelledby="bulk-edit-field"
        >
          <bl-option-card
            v-for="item in FIELDS"
            :key="item.id"
            layout="stack"
            size="sm"
            icon-well="square"
            indicator="check"
            :icon="item.icon"
            :title="item.title"
            :description="item.description"
            :selected="field === item.id"
            role="radio"
            :aria-checked="field === item.id"
            :aria-label="item.title"
            @click="field = item.id"
          />
        </div>
      </section>

      <!-- Status -->
      <section v-if="field === 'status'" class="bulk-edit-section">
        <p id="bulk-edit-status" class="bulk-edit-label">New status</p>
        <div
          class="bulk-edit-statuses"
          role="radiogroup"
          aria-labelledby="bulk-edit-status"
        >
          <bl-option-card
            v-for="(option, index) in STATUS_OPTIONS"
            :key="option.value"
            icon-well="round"
            indicator="radio"
            :icon="option.icon"
            :title="option.title"
            :description="option.description"
            :selected="status === option.value"
            :class="index < 3 ? 'span-2' : 'span-3'"
            role="radio"
            :aria-checked="status === option.value"
            :aria-label="option.title"
            @click="status = option.value"
          />
        </div>
      </section>

      <!-- Author -->
      <section v-else-if="field === 'author'" class="bulk-edit-section">
        <p class="bulk-edit-label">New author</p>
        <div v-if="pickedAuthor" class="bulk-edit-picked">
          <span class="bulk-edit-avatar large" :class="pickedAuthor.tone">
            {{ pickedAuthor.initials }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="bulk-edit-option-title">{{ pickedAuthor.name }}</p>
            <p class="bulk-edit-option-meta">{{ pickedAuthor.meta }}</p>
          </div>
          <bl-icon-button
            variant="tertiary"
            size="sm"
            aria-label="Choose a different author"
            @click="clearAuthor"
          >
            <template #default="iconProps">
              <IconX v-bind="iconProps" />
            </template>
          </bl-icon-button>
        </div>
        <bl-raw-autocomplete
          v-else
          v-model="author"
          v-model:search-term="authorSearch"
          :options="authorOptions"
          can-create-new
          placeholder="Search your authors, or type a new name"
        >
          <template #prepend>
            <IconSearch class="text-ink-muted" :size="18" stroke="1.6" />
          </template>
          <template #item="{ option }">
            <span class="flex items-center gap-3">
              <span class="bulk-edit-avatar" :class="authorTone(option.value)">
                {{ initials(option.label) }}
              </span>
              <span class="flex min-w-0 flex-col">
                <span class="bulk-edit-option-title">{{ option.label }}</span>
                <span class="bulk-edit-option-meta">
                  {{ authorMeta(option.value) }}
                </span>
              </span>
            </span>
          </template>
        </bl-raw-autocomplete>
      </section>

      <!-- Genre -->
      <template v-else-if="field === 'genre'">
        <bl-switch v-model="genreMode" aria-label="Genre action">
          <bl-switch-option
            v-for="mode in GENRE_MODES"
            :key="mode.value"
            :value="mode.value"
            :selected-value="genreMode"
          >
            <template #icon>
              <component :is="mode.icon" :size="16" stroke="1.8" />
            </template>
            <template #label>{{ mode.label }}</template>
          </bl-switch-option>
        </bl-switch>

        <section v-if="genreMode === 'add'" class="bulk-edit-section">
          <p class="bulk-edit-label">Genre to add</p>
          <bl-raw-autocomplete
            v-model="genre"
            v-model:search-term="genreSearch"
            :options="genreOptions"
            can-create-new
            placeholder="Choose or type a genre"
          >
            <template #prepend>
              <IconTags class="text-ink-muted" :size="18" stroke="1.6" />
            </template>
          </bl-raw-autocomplete>
          <template v-if="suggestedGenres.length">
            <p class="bulk-edit-hint">Suggested from your library</p>
            <div class="flex flex-wrap gap-2">
              <bl-pill
                v-for="item in suggestedGenres"
                :key="item.name"
                as="button"
                variant="primary"
                :selected="genreValue === item.name"
                @click="pickGenre(item.name)"
              >
                {{ item.name }}
                <span v-if="item.count" class="bulk-edit-count">
                  on {{ item.count }} of {{ books.length }}
                </span>
              </bl-pill>
            </div>
          </template>
        </section>

        <section v-else class="bulk-edit-section">
          <div class="bulk-edit-label-row">
            <p id="bulk-edit-genre" class="bulk-edit-label">
              Genres on these books
            </p>
            <span v-if="selectedGenres.length" class="bulk-edit-hint">
              Pick one to remove
            </span>
          </div>
          <div
            v-if="selectedGenres.length"
            class="flex flex-wrap gap-2"
            role="radiogroup"
            aria-labelledby="bulk-edit-genre"
          >
            <bl-pill
              v-for="item in selectedGenres"
              :key="item.name"
              as="button"
              variant="primary"
              :selected="genre === item.name"
              role="radio"
              :aria-checked="genre === item.name"
              @click="genre = item.name"
            >
              {{ item.name }}
              <span class="bulk-edit-count">
                · {{ pluralBooks(item.count) }}
              </span>
            </bl-pill>
          </div>
          <p v-else class="bulk-edit-hint">
            None of these books have a genre yet.
          </p>
        </section>
      </template>

      <!-- Format -->
      <section v-else-if="field === 'format'" class="bulk-edit-section">
        <p id="bulk-edit-format" class="bulk-edit-label">New format</p>
        <div
          class="bulk-edit-formats"
          role="radiogroup"
          aria-labelledby="bulk-edit-format"
        >
          <bl-option-card
            v-for="item in FORMATS"
            :key="item.id"
            layout="stack"
            size="sm"
            icon-well="round"
            centered
            :icon="item.icon"
            :title="item.description"
            :selected="format === item.id"
            role="radio"
            :aria-checked="format === item.id"
            @click="format = item.id"
          />
        </div>
      </section>

      <!-- Rating -->
      <template v-else-if="field === 'rating'">
        <bl-switch v-model="ratingMode" aria-label="Rating action">
          <bl-switch-option
            v-for="mode in RATING_MODES"
            :key="mode.value"
            :value="mode.value"
            :selected-value="ratingMode"
          >
            <template #icon>
              <component :is="mode.icon" :size="16" stroke="1.8" />
            </template>
            <template #label>{{ mode.label }}</template>
          </bl-switch-option>
        </bl-switch>
        <section v-if="ratingMode === 'set'" class="bulk-edit-section">
          <div class="bulk-edit-label-row">
            <p class="bulk-edit-label">New rating</p>
            <span class="bulk-edit-hint max-sm:hidden">
              Tap a star, or the left half of a star for a half rating
            </span>
          </div>
          <div class="bulk-edit-rating">
            <bl-rating-input
              :rating="rating"
              :icon-size="isMobile ? 40 : 44"
              :show-value="false"
              @commit="(value) => (rating = value)"
            />
            <p class="bulk-edit-rating-value">
              <b>{{ rating ?? '–' }}</b>
              <span>out of 5</span>
            </p>
          </div>
        </section>
      </template>

      <!-- What will happen -->
      <div v-if="preview" class="bulk-edit-preview" role="status">
        <span class="bulk-edit-preview-icon" aria-hidden="true">
          <IconSparkles :size="18" stroke="1.6" />
        </span>
        <div class="flex min-w-0 flex-col gap-2">
          <p class="bulk-edit-label secondary">What will happen</p>
          <p class="flex flex-wrap items-center gap-2">
            <bl-chip size="sm" rounded>{{ preview.from }}</bl-chip>
            <IconArrowRight
              class="text-secondary-700"
              :size="16"
              stroke="1.8"
              aria-label="becomes"
            />
            <bl-chip size="sm" rounded variant="primary">
              {{ preview.to }}
            </bl-chip>
          </p>
          <p v-if="preview.detail" class="bulk-edit-preview-detail">
            {{ preview.detail }}
          </p>
        </div>
      </div>
      <div v-else class="bulk-edit-preview ghost">
        <span class="bulk-edit-preview-icon" aria-hidden="true">
          <IconSparkles :size="18" stroke="1.6" />
        </span>
        <p class="bulk-edit-preview-detail">{{ previewHint }}</p>
      </div>
    </div>

    <template #cancel-label>Cancel</template>
    <template #action-label>{{ preview?.action ?? 'Apply change' }}</template>
  </bl-modal>
</template>

<script setup lang="ts">
import {
  IconArrowRight,
  IconBook,
  IconEraser,
  IconMinus,
  IconPlus,
  IconSearch,
  IconSparkles,
  IconStar,
  IconTags,
  IconX,
  type icons,
} from '@tabler/icons-vue'
import type { Book, BookFormat, BookProgressStatus } from '~/types/book'
import type { BulkBookChange } from '~/types/ui'

type Field = 'status' | 'author' | 'genre' | 'format' | 'rating'
type Icon = keyof typeof icons

const FIELDS: { id: Field; title: string; description: string; icon: Icon }[] =
  [
    {
      id: 'status',
      title: 'Status',
      description: 'Where books are in your reading',
      icon: 'IconProgress',
    },
    {
      id: 'author',
      title: 'Author',
      description: 'Credit all to one author',
      icon: 'IconFeather',
    },
    {
      id: 'genre',
      title: 'Genre',
      description: 'Add or remove a genre',
      icon: 'IconTags',
    },
    {
      id: 'format',
      title: 'Format',
      description: 'Print, e-book or audio',
      icon: 'IconBooks',
    },
    {
      id: 'rating',
      title: 'Rating',
      description: 'Set or clear the stars',
      icon: 'IconStar',
    },
  ]

// The radio needs a string value for "not started"
const NOT_STARTED = 'not-started'
const STATUS_DESCRIPTIONS: Record<BookProgressStatus, string> = {
  reading: 'Clears any finish date',
  paused: 'Keeps your place',
  read: 'Records a finish date',
  'not-finished': 'Records a finish date',
}
const STATUS_OPTIONS: {
  value: string
  title: string
  description: string
  icon: Icon
}[] = [
  {
    value: NOT_STARTED,
    title: 'Not started',
    description: 'Resets progress',
    icon: 'IconCircleDashed',
  },
  ...Object.values(PROGRESS_STATUS_MAP).map(({ id, description, icon }) => ({
    value: id,
    title: description,
    description: STATUS_DESCRIPTIONS[id],
    icon,
  })),
]
const FORMATS = Object.values(BOOK_FORMAT_MAP)

const GENRE_MODES = [
  { value: 'add', label: 'Add a genre', icon: IconPlus },
  { value: 'remove', label: 'Remove a genre', icon: IconMinus },
] as const
const RATING_MODES = [
  { value: 'set', label: 'Set rating', icon: IconStar },
  { value: 'clear', label: 'Clear rating', icon: IconEraser },
] as const

const AVATAR_TONES = ['tone-primary', 'tone-secondary', 'tone-neutral']
const MAX_COVERS = 5

const props = defineProps<{
  // The selected books
  books: Book[]
  // Every author, with how many books they have in the library
  authors: { id: string; name: string; count: number }[]
  // Every genre in the library, with its book count
  genres: { name: string; count: number }[]
}>()

const open = defineModel<boolean>({ default: false })

const emit = defineEmits<{ (e: 'change', change: BulkBookChange): void }>()

const { isMobile } = useBreakpoints()

const field = ref<Field | null>(null)
const status = ref<string>()
// An author id, or a new author's name (created when applied)
const author = ref<string>()
const authorSearch = ref<string>()
const genreMode = ref<'add' | 'remove'>('add')
const genre = ref<string>()
const genreSearch = ref<string>()
const format = ref<BookFormat>()
const ratingMode = ref<'set' | 'clear'>('set')
const rating = ref<number | null>(null)

// Starts fresh every time it opens
watch(open, (isOpen) => {
  if (!isOpen) return
  field.value = null
  status.value = undefined
  clearAuthor()
  genreMode.value = 'add'
  genre.value = undefined
  genreSearch.value = undefined
  format.value = undefined
  ratingMode.value = 'set'
  rating.value = null
})

watch(genreMode, () => {
  genre.value = undefined
  genreSearch.value = undefined
})

const coverBooks = computed(() => props.books.slice(0, MAX_COVERS))
const moreCount = computed(() => Math.max(0, props.books.length - MAX_COVERS))
const names = computed(() => {
  const titles = props.books.slice(0, 3).map(({ title }) => title)
  const rest = props.books.length - titles.length
  return rest > 0
    ? `${titles.join(', ')} and ${rest} more`
    : joinWithAnd(titles)
})

// Authors
const authorsById = computed(
  () => new Map(props.authors.map((item) => [item.id, item])),
)
const authorOptions = computed(() =>
  props.authors.map(({ id, name }) => ({ value: id, label: name })),
)

function initials(name: string) {
  const words = name.split(/\s+/).filter(Boolean)
  const letters =
    words.length > 1 ? [words[0], words.at(-1)] : [words[0] ?? '?']
  return letters.map((word) => word![0]!.toUpperCase()).join('')
}

function authorTone(id: string) {
  const index = props.authors.findIndex((item) => item.id === id)
  return AVATAR_TONES[Math.max(0, index) % AVATAR_TONES.length]
}

function authorMeta(id: string) {
  const count = authorsById.value.get(id)?.count ?? 0
  return count ? `${pluralBooks(count)} in your library` : 'No books yet'
}

const pickedAuthor = computed(() => {
  if (!author.value) return null
  const existing = authorsById.value.get(author.value)
  const name = existing?.name ?? author.value
  return {
    name,
    initials: initials(name),
    tone: existing ? authorTone(existing.id) : AVATAR_TONES[0],
    meta: existing ? authorMeta(existing.id) : 'New author',
  }
})

function clearAuthor() {
  author.value = undefined
  authorSearch.value = undefined
}

// Genres
const genreOptions = computed(() =>
  props.genres.map(({ name }) => ({ value: name, label: name })),
)
// When adding, a typed new genre counts without picking "Add …"
const genreValue = computed(() =>
  (
    genre.value ?? (genreMode.value === 'add' ? genreSearch.value : undefined)
  )?.trim(),
)

const countOnSelection = (name: string) =>
  props.books.filter((book) => book.genres?.includes(name)).length

// Library genres, most used first, that not every selected book has yet
const suggestedGenres = computed(() =>
  props.genres
    .map(({ name, count }) => ({
      name,
      count: countOnSelection(name),
      total: count,
    }))
    .filter(({ count }) => count < props.books.length)
    .sort((a, b) => b.count - a.count || b.total - a.total)
    .slice(0, 5),
)

const selectedGenres = computed(() =>
  [...new Set(props.books.flatMap((book) => book.genres ?? []))]
    .filter(Boolean)
    .map((name) => ({ name, count: countOnSelection(name) }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
)

function pickGenre(name: string) {
  genre.value = name
  genreSearch.value = name
}

/** The change to apply, or null while the form is incomplete */
const change = computed<BulkBookChange | null>(() => {
  switch (field.value) {
    case 'status':
      return status.value
        ? {
            field: 'status',
            status:
              status.value === NOT_STARTED
                ? null
                : (status.value as BookProgressStatus),
          }
        : null
    case 'author': {
      // A typed new name counts without picking "Add …"
      const value = (author.value ?? authorSearch.value)?.trim()
      return value ? { field: 'author', author: value } : null
    }
    case 'genre':
      return genreValue.value
        ? { field: 'genre', genre: genreValue.value, mode: genreMode.value }
        : null
    case 'format':
      return format.value ? { field: 'format', format: format.value } : null
    case 'rating':
      if (ratingMode.value === 'clear') return { field: 'rating', rating: null }
      return rating.value ? { field: 'rating', rating: rating.value } : null
    default:
      return null
  }
})

const preview = computed(() =>
  change.value
    ? previewBulkChange(change.value, props.books, {
        authors: props.authors,
        genres: props.genres.map(({ name }) => name),
      })
    : null,
)

const previewHint = computed(() => {
  switch (field.value) {
    case 'status':
      return 'Pick a status to preview the change.'
    case 'author':
      return 'Pick or add an author to preview the change.'
    case 'genre':
      return genreMode.value === 'add'
        ? 'Pick or type a genre to preview the change.'
        : 'Pick a genre to preview the change.'
    case 'format':
      return 'Pick a format to preview the change.'
    case 'rating':
      return 'Pick a rating to preview the change.'
    default:
      return 'Your change is previewed here before anything is saved.'
  }
})
</script>

<style scoped>
@reference '../assets/css/main.css';

.bulk-edit {
  @apply flex flex-col gap-5 max-sm:gap-4;
}
.bulk-edit-section {
  @apply flex min-w-0 flex-col gap-2.5;
}
.bulk-edit-label {
  @apply text-primary text-xs leading-none font-bold tracking-[0.12em] uppercase;
}
.bulk-edit-label.secondary {
  @apply text-secondary-700;
}
.bulk-edit-label-row {
  @apply flex items-center justify-between gap-3;
}
.bulk-edit-hint {
  @apply text-ink-muted text-xs;
}
.bulk-edit-count {
  @apply text-xs font-semibold opacity-75;
}

/* The selection */
.bulk-edit-selection {
  @apply bg-surface-subtle border-stroke flex items-center gap-4 rounded-xl border px-4 py-3;
}
.bulk-edit-covers {
  @apply flex flex-none pl-2.5;
}
.bulk-edit-cover {
  @apply border-surface-subtle bg-surface-container text-ink-muted -ml-2.5 grid h-[50px] w-[34px] flex-none place-items-center overflow-hidden rounded border-2 shadow-[0_2px_6px_rgba(27,28,28,0.25)];
}
.bulk-edit-cover.more {
  @apply border-stroke-strong bg-surface-elevated text-ink-primary font-display border text-[0.9rem] font-semibold shadow-none;
}
.bulk-edit-selection-title {
  @apply text-[1.07rem] font-bold;
}
.bulk-edit-selection-names {
  @apply text-ink-muted truncate text-[0.9rem];
}

/* Fields: a row of five, scrolling sideways on phones */
.bulk-edit-fields {
  @apply grid grid-cols-5 gap-2.5;
  @apply max-sm:-mr-5 max-sm:flex max-sm:overflow-x-auto max-sm:pr-5 max-sm:pb-1;
}
.bulk-edit-fields > * {
  @apply min-h-28 max-sm:w-[132px] max-sm:flex-none;
}

/* Statuses: three, then two wider */
.bulk-edit-statuses {
  @apply grid grid-cols-6 gap-2.5 max-sm:grid-cols-1 max-sm:gap-1.5;
}
.bulk-edit-statuses > .span-2 {
  @apply col-span-2 max-sm:col-span-1;
}
.bulk-edit-statuses > .span-3 {
  @apply col-span-3 max-sm:col-span-1;
}

.bulk-edit-formats {
  @apply grid grid-cols-5 gap-2.5 max-sm:grid-cols-3;
}
.bulk-edit-formats > * {
  @apply py-5;
}

/* Authors */
.bulk-edit-avatar {
  @apply grid size-[34px] flex-none place-items-center rounded-full text-xs font-extrabold tracking-wide;
}
.bulk-edit-avatar.large {
  @apply size-11 text-sm;
}
.tone-primary {
  @apply bg-primary-100 text-primary;
}
.tone-secondary {
  @apply bg-secondary-50 text-secondary-700 border-secondary-200 border;
}
.tone-neutral {
  @apply bg-surface-subtle text-ink-secondary border-stroke-strong border;
}
.bulk-edit-option-title {
  @apply text-ink-primary truncate text-sm font-bold;
}
.bulk-edit-option-meta {
  @apply text-ink-muted text-xs;
}
.bulk-edit-picked {
  @apply border-primary bg-primary-50 flex items-center gap-3.5 rounded-xl border-[1.5px] px-3.5 py-3;
}

/* Rating */
.bulk-edit-rating {
  @apply bg-surface-subtle border-stroke flex items-center gap-5 rounded-xl border px-5 py-4;
  @apply max-sm:flex-col max-sm:gap-2.5 max-sm:p-4;
}
.bulk-edit-rating-value {
  @apply ml-auto flex items-baseline gap-1.5 max-sm:ml-0;
}
.bulk-edit-rating-value b {
  @apply font-display text-[2.85rem] leading-none font-semibold;
}
.bulk-edit-rating-value span {
  @apply text-ink-muted text-[0.93rem];
}

/* What will happen */
.bulk-edit-preview {
  @apply bg-secondary-50 border-secondary-200 flex items-start gap-3.5 rounded-xl border px-4 py-3.5;
}
.bulk-edit-preview-icon {
  @apply bg-surface-elevated border-secondary-200 text-secondary-700 grid size-[34px] flex-none place-items-center rounded-full border;
}
.bulk-edit-preview-detail {
  @apply text-ink-secondary text-[0.93rem] leading-snug;
}
.bulk-edit-preview.ghost {
  @apply border-stroke-strong items-center border-[1.5px] border-dashed bg-transparent;
}
.bulk-edit-preview.ghost .bulk-edit-preview-icon {
  @apply bg-surface-subtle border-stroke text-ink-muted;
}
.bulk-edit-preview.ghost .bulk-edit-preview-detail {
  @apply text-ink-muted;
}
</style>

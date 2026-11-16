<template>
  <bl-modal v-model="open" size="md" sheet allow-overflow>
    <template #title>What should I read next?</template>
    <template #subtitle>{{ subtitle }}</template>

    <div class="flex flex-col gap-5" data-testid="next-read-picker">
      <!-- Nothing to pick from -->
      <bl-empty v-if="!sourceCandidates.length" icon="IconBooks">
        <template #label>
          <span class="flex flex-col items-center gap-2">
            <span class="pk-empty-title">
              Nothing waiting in {{ source?.label }}
            </span>
            <span class="pk-empty-text">
              Every book in {{ source?.label }} has already been started. Add a
              new book{{
                otherSource
                  ? `, or pick from the ${pluralBooks(unstartedCount(otherSource))} in ${otherSource.label === 'All books' ? 'your library' : otherSource.label}`
                  : ''
              }}.
            </span>
          </span>
        </template>
        <template #action>
          <div class="flex flex-wrap justify-center gap-2">
            <bl-button @click="addBook">
              <template #prependIcon="iconProps">
                <IconPlus v-bind="iconProps" />
              </template>
              Add a book
            </bl-button>
            <bl-button
              v-if="otherSource && unstartedCount(otherSource)"
              variant="secondary"
              @click="sourceId = otherSource.id"
            >
              Pick from {{ otherSource.label.toLowerCase() }}
            </bl-button>
          </div>
        </template>
      </bl-empty>

      <!-- Settings -->
      <template v-else-if="view === 'settings'">
        <section v-if="sources.length > 1" class="pk-section">
          <p class="pk-label">Pick from</p>
          <bl-switch
            v-model="sourceId"
            aria-label="Pick from"
            class="pk-source"
          >
            <bl-switch-option
              v-for="item in sources"
              :key="item.id"
              :value="item.id"
              :selected-value="sourceId"
            >
              <template #label>
                {{ item.label }}
                <span class="pk-source-count">{{ unstartedCount(item) }}</span>
              </template>
            </bl-switch-option>
          </bl-switch>
        </section>

        <section class="pk-section">
          <p id="pk-mode" class="pk-label">How to pick</p>
          <div class="pk-modes" role="radiogroup" aria-labelledby="pk-mode">
            <bl-option-card
              v-for="item in MODES"
              :key="item.value"
              icon-well="round"
              indicator="radio"
              :icon="item.icon"
              :title="item.label"
              :description="item.description"
              :selected="mode === item.value"
              role="radio"
              :aria-checked="mode === item.value"
              :aria-label="item.label"
              class="items-start!"
              @click="mode = item.value"
            />
          </div>
        </section>

        <bl-alert v-if="source?.queue && mode === 'weighted'" tone="neutral">
          <b class="text-ink-primary">Your queue order counts.</b>
          Books nearer the top of {{ source.label }} are more likely to come up.
        </bl-alert>

        <section class="pk-section">
          <div class="flex flex-wrap items-center gap-2">
            <bl-button
              variant="secondary"
              size="sm"
              :pressed="filtersOpen"
              :aria-expanded="filtersOpen"
              @click="filtersOpen = !filtersOpen"
            >
              <template #prependIcon="iconProps">
                <IconAdjustmentsHorizontal v-bind="iconProps" />
              </template>
              Filters
              <span v-if="activeFilters.length" class="pk-filter-count">
                {{ activeFilters.length }}
              </span>
              <template #appendIcon="iconProps">
                <IconChevronDown
                  v-bind="iconProps"
                  class="transition-transform"
                  :class="{ 'rotate-180': filtersOpen }"
                />
              </template>
            </bl-button>
            <bl-chip
              v-for="filter in activeFilters"
              :key="filter.key"
              size="sm"
              rounded
              variant="secondary"
              removable
              :remove-label="`Remove the ${filter.name.toLowerCase()} filter`"
              @remove="clearFilter(filter.key)"
            >
              {{ filter.label }}
            </bl-chip>
            <button
              v-if="activeFilters.length"
              type="button"
              class="link ml-auto text-sm"
              @click="resetFilters"
            >
              Reset filters
            </button>
          </div>
          <div v-if="filtersOpen" class="pk-filters">
            <label v-for="field in FILTERS" :key="field.key" class="pk-filter">
              <span class="form-label">{{ field.name }}</span>
              <bl-raw-select
                v-model="filters[field.key]"
                :options="filterOptions[field.key]"
                :aria-label="field.name"
              />
            </label>
          </div>
        </section>

        <bl-empty v-if="!candidates.length" icon="IconFilterOff">
          <template #label>
            <span class="flex flex-col items-center gap-2" role="status">
              <span class="pk-empty-title">No books match these filters</span>
              <span class="pk-empty-text">
                Nothing unstarted in {{ source?.label }} is
                {{ filterSentence }}. Remove a filter, or start fresh.
              </span>
            </span>
          </template>
          <template #action>
            <bl-button variant="secondary" @click="resetFilters">
              <template #prependIcon="iconProps">
                <IconRefresh v-bind="iconProps" />
              </template>
              Reset filters
            </bl-button>
          </template>
        </bl-empty>
      </template>

      <!-- The pick -->
      <template v-else-if="pick">
        <div class="pk-summary" :class="{ stale }">
          <component
            :is="stale ? IconAlertTriangle : IconAdjustmentsHorizontal"
            :size="18"
            stroke="1.7"
            class="pk-summary-icon"
          />
          <p class="pk-summary-text">
            {{ pickedSettings.source }}
            <span>{{ pickedSettings.mode }}</span>
            <span v-if="pickedSettings.filters">
              {{ pickedSettings.filters }}
            </span>
          </p>
          <bl-button variant="secondary" size="sm" @click="view = 'settings'">
            {{ isMobile ? 'Change' : 'Change settings' }}
          </bl-button>
        </div>

        <bl-alert
          v-if="stale"
          tone="secondary"
          icon="IconAlertTriangle"
          role="status"
        >
          <b class="text-ink-primary">Settings changed.</b>
          {{ pick.book.title }} was picked with your earlier settings.
          {{ pluralBooks(candidates.length) }}
          {{ candidates.length === 1 ? 'matches' : 'match' }} now.
        </bl-alert>

        <div
          :key="pick.book.id"
          class="pk-result"
          :class="{ dim: stale }"
          role="status"
          data-testid="next-read-pick"
        >
          <NuxtLink
            :to="`/library/books/${pick.book.id}`"
            class="pk-cover-glow pk-rise"
            :aria-label="`Open ${pick.book.title}`"
          >
            <bl-home-book-cover
              :book="pick.book"
              :icon-size="isMobile ? 20 : 28"
              class="pk-cover p-3! sm:p-5!"
            />
          </NuxtLink>
          <div class="pk-info pk-fade">
            <p class="pk-label">Your next read</p>
            <h3 class="pk-title">{{ pick.book.title }}</h3>
            <p v-if="authorName(pick.book)" class="pk-by">
              by {{ authorName(pick.book) }}
            </p>
            <p v-if="pickMeta.length" class="pk-meta">
              <span v-for="item in pickMeta" :key="item">{{ item }}</span>
            </p>
            <div v-if="pick.reasons.length" class="flex flex-col gap-2 pt-1">
              <p class="text-ink-muted text-xs">Why this one</p>
              <div class="flex flex-wrap gap-2">
                <bl-chip
                  v-for="reason in pick.reasons"
                  :key="reason.text"
                  size="sm"
                  rounded
                  bold
                  v-bind="REASON_CHIPS[reason.kind]"
                >
                  {{ reason.text }}
                </bl-chip>
              </div>
            </div>
          </div>
        </div>

        <bl-alert v-if="allShown && !stale" tone="neutral">
          <b class="text-ink-primary">That was every match.</b>
          Start over to see them again in a new order, or loosen the filters to
          include more books.
        </bl-alert>

        <div class="pk-progress" data-testid="next-read-progress">
          <p class="flex items-center justify-between gap-3">
            <span class="font-bold">
              {{ shownBooks.length }} of {{ roundSize }} shown
            </span>
            <span class="text-ink-muted text-xs">
              {{
                allShown
                  ? 'All seen'
                  : `${roundSize - shownBooks.length} still to see`
              }}
            </span>
          </p>
          <bl-progress-bar
            :progress-value="(shownBooks.length / roundSize) * 100"
            size="xs"
          />
          <div class="flex items-center gap-2">
            <span
              v-for="(book, index) in shownBooks.slice(-HISTORY_SIZE)"
              :key="book.id"
              class="pk-thumb"
              :class="{
                current:
                  index === Math.min(shownBooks.length, HISTORY_SIZE) - 1,
              }"
              :title="book.title"
            >
              <bl-home-book-cover
                :book="book"
                :show-title="false"
                :icon-size="10"
                class="size-full rounded-none! p-0.5!"
              />
            </span>
            <small class="text-ink-muted ml-1 text-xs">Already shown</small>
          </div>
          <small v-if="!allShown" class="text-ink-muted text-xs">
            A book never comes up twice until all
            {{ pluralBooks(roundSize).replace(/ books?$/, '') }}
            {{ roundSize === 1 ? 'match has' : 'matches have' }} been shown.
          </small>
        </div>
      </template>
    </div>

    <template #footer>
      <div class="pk-footer">
        <p
          v-if="showCount"
          class="pk-count"
          :class="{ zero: !candidates.length }"
          data-testid="next-read-count"
        >
          <span class="pk-count-number">{{ candidates.length }}</span>
          {{ ' ' }}
          <span class="pk-count-text">
            {{ candidates.length === 1 ? 'book matches' : 'books match' }}
            {{ ' ' }}
            <span>of {{ sourceCandidates.length }} in {{ source?.label }}</span>
          </span>
        </p>
        <bl-button
          v-if="view === 'result' && !stale"
          variant="tertiary"
          class="pk-cancel"
          @click="open = false"
        >
          Cancel
        </bl-button>
        <span class="pk-spacer" />
        <bl-button
          v-if="view === 'settings' || stale || !sourceCandidates.length"
          variant="tertiary"
          class="pk-cancel"
          @click="open = false"
        >
          {{ sourceCandidates.length ? 'Cancel' : 'Close' }}
        </bl-button>

        <template v-if="sourceCandidates.length">
          <!-- Settings: back to the book already picked -->
          <bl-button
            v-if="view === 'settings' && pick"
            variant="secondary"
            class="pk-secondary"
            @click="view = 'result'"
          >
            Back to {{ pick.book.title }}
          </bl-button>
          <bl-button
            v-if="view === 'settings'"
            class="pk-primary"
            :disabled="!candidates.length"
            @click="newRound"
          >
            <template #prependIcon="iconProps">
              <IconDice5 v-bind="iconProps" />
            </template>
            Show me my next read
          </bl-button>

          <template v-else-if="stale">
            <bl-button
              class="pk-primary"
              :disabled="!candidates.length"
              @click="newRound"
            >
              <template #prependIcon="iconProps">
                <IconDice5 v-bind="iconProps" />
              </template>
              Show me a new pick
            </bl-button>
          </template>

          <template v-else>
            <bl-button
              v-if="roundSize > 1"
              variant="secondary"
              class="pk-secondary"
              @click="allShown ? newRound() : roll()"
            >
              <template #prependIcon="iconProps">
                <IconHistory v-if="allShown" v-bind="iconProps" />
                <IconRefresh v-else v-bind="iconProps" />
              </template>
              {{ allShown ? 'Start over' : 'Show me another' }}
            </bl-button>
            <bl-button class="pk-primary" :loading="starting" @click="start">
              <template #prependIcon="iconProps">
                <IconPlayerPlay v-bind="iconProps" />
              </template>
              Start reading
            </bl-button>
          </template>
        </template>
      </div>
    </template>
  </bl-modal>
</template>

<script setup lang="ts">
import {
  IconAdjustmentsHorizontal,
  IconAlertTriangle,
  IconChevronDown,
  IconDice5,
  IconHistory,
  IconPlayerPlay,
  IconPlus,
  IconRefresh,
} from '@tabler/icons-vue'
import type { icons } from '@tabler/icons-vue'
import type { Author } from '~/types/author'
import type { Book, BookFormat } from '~/types/book'
import { pluralBooks } from '~/utils/bulk-edit'
import {
  BOOK_LENGTHS,
  filterNextReads,
  isUnstarted,
  pickNextRead,
  type BookLength,
  type NextReadMode,
  type NextReadPick,
  type NextReadReason,
} from '~/utils/next-read'

export type NextReadSource = {
  id: string
  label: string
  books: Book[]
  // An ordered queue (To Be Read): Smart pick favours its top
  queue?: boolean
}

type FilterKey = 'genre' | 'length' | 'format' | 'authorId'

const ANY = 'any'
const HISTORY_SIZE = 8
const MODES: {
  value: NextReadMode
  label: string
  description: string
  icon: keyof typeof icons
}[] = [
  {
    value: 'weighted',
    label: 'Smart pick',
    description:
      'Favors the top of your To Be Read, authors you rate highly and books that have waited longest.',
    icon: 'IconWand',
  },
  {
    value: 'random',
    label: 'Surprise me',
    description: 'Completely random. Every matching book has the same chance.',
    icon: 'IconDice5',
  },
]
const FILTERS: { key: FilterKey; name: string }[] = [
  { key: 'genre', name: 'Genre' },
  { key: 'length', name: 'Length' },
  { key: 'format', name: 'Format' },
  { key: 'authorId', name: 'Author' },
]
const REASON_CHIPS: Record<
  NextReadReason['kind'],
  { variant?: 'secondary'; color?: 'primary' | 'secondary' }
> = {
  tbr: { variant: 'secondary', color: 'primary' },
  author: { variant: 'secondary', color: 'secondary' },
  shelf: {},
}

const props = defineProps<{
  // Where to pick from; the first is the default
  sources: NextReadSource[]
  authors: Author[]
  // Every book, for the reader's ratings
  library: Book[]
  // To Be Read book ids, in priority order
  tbrIds: string[]
}>()

const open = defineModel<boolean>({ default: false })

const emit = defineEmits<{ (e: 'started', book: Book): void }>()

const { updateBook } = useBookLibrary()
const { openAddBook } = useAddBook()
const { isMobile } = useBreakpoints()

const view = ref<'settings' | 'result'>('settings')
const sourceId = ref(props.sources[0]?.id ?? '')
const mode = ref<NextReadMode>('weighted')
const filtersOpen = ref(false)
const filters = reactive<Record<FilterKey, string>>({
  genre: ANY,
  length: ANY,
  format: ANY,
  authorId: ANY,
})
const pick = shallowRef<NextReadPick | null>(null)
// Books shown this round, in order; the last one is the current pick
const shown = ref<string[]>([])
// The settings the round was picked with, to tell when they changed
const roundSettings = ref('')
const roundSize = ref(0)
const starting = ref(false)

const today = toLocalDay(new Date().toISOString())

const source = computed(
  () => props.sources.find(({ id }) => id === sourceId.value) ?? null,
)
const otherSource = computed(
  () => props.sources.find(({ id }) => id !== sourceId.value) ?? null,
)
const unstartedCount = (item: NextReadSource) =>
  item.books.filter(isUnstarted).length

const sourceCandidates = computed(() =>
  (source.value?.books ?? []).filter(isUnstarted),
)
const candidates = computed(() =>
  filterNextReads(sourceCandidates.value, {
    genre: filters.genre === ANY ? null : filters.genre,
    format: filters.format === ANY ? null : (filters.format as BookFormat),
    authorId: filters.authorId === ANY ? null : filters.authorId,
    length: filters.length as BookLength,
  }),
)

const subtitle = computed(() => {
  const count = sourceCandidates.value.length
  return count
    ? `${count} unstarted ${count === 1 ? 'book' : 'books'} in ${source.value?.label}`
    : `No unstarted books in ${source.value?.label}`
})

// Options come from the books that can be picked, so none leads nowhere
const filterOptions = computed<
  Record<FilterKey, { value: string; label: string }[]>
>(() => {
  const books = sourceCandidates.value
  const authorIds = new Set(books.map(({ author }) => author))
  return {
    genre: [
      { value: ANY, label: 'Any genre' },
      ...[...new Set(books.flatMap(({ genres }) => genres ?? []))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))
        .map((name) => ({ value: name, label: name })),
    ],
    length: [
      { value: ANY, label: 'Any length' },
      ...Object.entries(BOOK_LENGTHS).map(([value, { label }]) => ({
        value,
        label,
      })),
    ],
    format: [
      { value: ANY, label: 'Any format' },
      ...Object.values(BOOK_FORMAT_MAP)
        .filter(({ id }) => books.some(({ format }) => format === id))
        .map(({ id, description }) => ({ value: id, label: description })),
    ],
    authorId: [
      { value: ANY, label: 'Any author' },
      ...props.authors
        .filter(({ id }) => authorIds.has(id))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(({ id, name }) => ({ value: id, label: name })),
    ],
  }
})

const activeFilters = computed(() =>
  FILTERS.filter(({ key }) => filters[key] !== ANY).map(({ key, name }) => ({
    key,
    name,
    label:
      filterOptions.value[key].find(({ value }) => value === filters[key])
        ?.label ?? filters[key],
  })),
)

/** "Poetry, over 450 pages and an audiobook" */
const filterSentence = computed(() =>
  joinWithAnd(
    activeFilters.value.map(({ key, label }) => {
      if (key === 'length') return label.toLowerCase()
      if (key === 'format')
        return `a${/^[aeiou]/i.test(label) ? 'n' : ''} ${label.toLowerCase()}`
      if (key === 'authorId') return `by ${label}`
      return label
    }),
  ),
)

const settingsKey = computed(() =>
  JSON.stringify([sourceId.value, mode.value, filters]),
)
const stale = computed(
  () => view.value === 'result' && settingsKey.value !== roundSettings.value,
)
const allShown = computed(() => shown.value.length >= roundSize.value)

// What the shown book was picked with, for the summary strip
const pickedSettings = ref({ source: '', mode: '', filters: '' })

const showCount = computed(
  () =>
    sourceCandidates.value.length > 0 &&
    (view.value === 'settings' || stale.value),
)

const libraryById = computed(
  () => new Map(props.library.map((book) => [book.id, book])),
)
const shownBooks = computed(() =>
  shown.value.flatMap((id) => libraryById.value.get(id) ?? []),
)

const authorName = (book: Book) =>
  props.authors.find(({ id }) => id === book.author)?.name

const pickMeta = computed(() => {
  const book = pick.value?.book
  if (!book) return []
  return [
    book.pages ? `${book.pages} pages` : null,
    book.genres?.[0],
    book.format ? BOOK_FORMAT_MAP[book.format].description : null,
  ].filter((item): item is string => !!item)
})

function roll() {
  pick.value = pickNextRead(
    candidates.value,
    { tbrIds: props.tbrIds, library: props.library, today },
    { mode: mode.value, exclude: shown.value },
  )
  if (pick.value) shown.value = [...shown.value, pick.value.book.id]
  view.value = 'result'
}

/** A fresh round with the current settings */
function newRound() {
  shown.value = []
  roundSettings.value = settingsKey.value
  roundSize.value = candidates.value.length
  pickedSettings.value = {
    source: source.value?.label ?? '',
    mode: MODES.find(({ value }) => value === mode.value)?.label ?? '',
    filters: activeFilters.value.map(({ label }) => label).join(' · '),
  }
  roll()
}

function clearFilter(key: FilterKey) {
  filters[key] = ANY
}

function resetFilters() {
  FILTERS.forEach(({ key }) => clearFilter(key))
}

function addBook() {
  open.value = false
  openAddBook()
}

async function start() {
  const book = pick.value?.book
  if (!book || starting.value) return
  starting.value = true
  try {
    await updateBook(book.id, {
      progress: withProgressStatus(book.progress, 'reading'),
    })
    open.value = false
    emit('started', book)
  } finally {
    starting.value = false
  }
}

// Filters from another source may not exist in this one
watch(sourceId, resetFilters)

watch(open, (isOpen) => {
  if (!isOpen) return
  view.value = 'settings'
  sourceId.value = props.sources[0]?.id ?? ''
  mode.value = 'weighted'
  filtersOpen.value = false
  resetFilters()
  pick.value = null
  shown.value = []
})
</script>

<style scoped>
@reference '../assets/css/main.css';

.pk-section {
  @apply flex min-w-0 flex-col gap-2.5;
}
.pk-label {
  @apply text-primary text-xs leading-none font-bold tracking-[0.12em] uppercase;
}
.pk-source-count {
  @apply text-ink-muted ml-1 text-xs font-semibold;
}
.pk-source {
  @apply max-sm:w-full;
}

.pk-modes {
  @apply grid grid-cols-2 gap-2.5 max-sm:grid-cols-1 max-sm:gap-2;
}

.pk-filter-count {
  @apply bg-primary text-ink-inverse grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-xs font-bold;
}
.pk-filters {
  @apply bg-surface-subtle border-stroke grid grid-cols-2 gap-x-3.5 gap-y-3 rounded-xl border p-4;
  @apply max-sm:gap-x-2.5 max-sm:p-3;
}
.pk-filter {
  @apply flex min-w-0 flex-col gap-1.5;
}

.pk-empty-title {
  @apply font-display text-ink-primary text-[1.375rem] leading-tight font-semibold;
}
.pk-empty-text {
  @apply text-ink-secondary max-w-md text-sm leading-normal;
}

/* Summary of the settings a book was picked with */
.pk-summary {
  @apply border-stroke bg-surface-elevated flex items-center gap-3 rounded-xl border py-2.5 pr-3 pl-3.5;
}
.pk-summary.stale {
  @apply border-secondary-200 bg-secondary-50;
}
.pk-summary-icon {
  @apply text-ink-muted flex-none;
}
.pk-summary.stale .pk-summary-icon {
  @apply text-secondary-700;
}
.pk-summary-text {
  @apply flex min-w-0 flex-1 flex-wrap items-center gap-x-2.5 gap-y-0.5 text-sm font-bold;
}
.pk-summary-text span {
  @apply text-ink-muted font-medium;
}

/* The revealed book */
.pk-result {
  @apply grid grid-cols-[10.5rem_1fr] items-center gap-8 px-2 pt-3.5 pb-2 transition-[opacity,filter];
  @apply max-sm:grid-cols-[6.5rem_1fr] max-sm:items-start max-sm:gap-4 max-sm:px-0;
}
.pk-result.dim {
  @apply opacity-40 saturate-50;
}
.pk-cover-glow {
  @apply relative block;
}
.pk-cover-glow::before {
  content: '';
  @apply absolute -inset-5 -z-0 rounded-[1.875rem] opacity-75;
  background: radial-gradient(closest-side, var(--primary-100), transparent);
}
.pk-cover {
  @apply relative z-10 aspect-[2/3] w-full overflow-hidden rounded-md shadow-[0_18px_32px_-10px_rgba(27,28,28,0.5),0_4px_8px_rgba(27,28,28,0.25)];
}
.pk-info {
  @apply flex min-w-0 flex-col gap-3;
}
.pk-title {
  @apply font-display text-ink-primary text-[2rem] leading-[1.1] font-semibold max-sm:text-[1.5rem];
}
.pk-by {
  @apply text-ink-secondary -mt-1 text-[1.07rem];
}
.pk-meta {
  @apply text-ink-muted flex flex-wrap gap-x-3.5 gap-y-1 text-sm;
}
.pk-meta span + span::before {
  content: '·';
  @apply text-stroke-strong mr-3.5;
}

/* A short reveal; none for reduced motion */
.pk-rise {
  animation: pk-rise 0.8s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}
.pk-fade {
  animation: pk-fade 0.6s 0.3s ease both;
}
@keyframes pk-rise {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.96);
  }
}
@keyframes pk-fade {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .pk-rise,
  .pk-fade {
    animation: none;
  }
}

/* Progress through the round */
.pk-progress {
  @apply bg-surface-subtle border-stroke flex flex-col gap-2.5 rounded-xl border px-4 py-3.5 text-sm;
}
.pk-thumb {
  @apply grid h-9 w-6 flex-none overflow-hidden rounded-sm shadow-[0_1px_3px_rgba(27,28,28,0.3)];
}
.pk-thumb.current {
  @apply outline-primary outline-2 outline-offset-2;
}

/* Footer: live count, then the actions; stacked on phones */
.pk-footer {
  @apply border-stroke flex items-center gap-2.5 border-t pt-4;
  @apply max-sm:flex-col max-sm:items-stretch max-sm:gap-2;
}
.pk-spacer {
  @apply flex-1 max-sm:hidden;
}
.pk-count {
  @apply flex min-w-0 items-center gap-3 max-sm:pb-1;
}
.pk-count-number {
  @apply font-display text-[1.9rem] leading-none font-semibold;
}
.pk-count.zero .pk-count-number {
  @apply text-secondary-700;
}
.pk-count-text {
  @apply flex flex-col gap-0.5 text-sm leading-tight font-bold;
}
.pk-count-text span {
  @apply text-ink-muted text-xs font-medium;
}
.pk-footer :deep(.button) {
  @apply max-sm:w-full max-sm:justify-center;
}
.pk-primary {
  @apply max-sm:order-1;
}
.pk-secondary {
  @apply max-sm:order-2;
}
.pk-cancel {
  @apply max-sm:order-3;
}
</style>

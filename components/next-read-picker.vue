<template>
  <bl-modal v-model="open" size="md" sheet allow-overflow>
    <template #title>What should I read next?</template>
    <template #subtitle>
      {{ pluralBooks(candidates.length) }} to choose from
      {{ source ? `in ${source.label}` : '' }}
    </template>

    <div class="flex flex-col gap-5" data-testid="next-read-picker">
      <!-- What to pick from, and how -->
      <div class="flex flex-wrap items-center gap-3">
        <bl-switch
          v-if="sources.length > 1"
          v-model="sourceId"
          aria-label="Pick from"
        >
          <bl-switch-option
            v-for="item in sources"
            :key="item.id"
            :value="item.id"
            :selected-value="sourceId"
          >
            <template #label>{{ item.label }}</template>
          </bl-switch-option>
        </bl-switch>
        <bl-switch v-model="mode" aria-label="How to pick">
          <bl-switch-option
            v-for="item in MODES"
            :key="item.value"
            :value="item.value"
            :selected-value="mode"
          >
            <template #icon>
              <component :is="item.icon" :size="16" stroke="1.8" />
            </template>
            <template #label>{{ item.label }}</template>
            <template #tooltip>{{ item.hint }}</template>
          </bl-switch-option>
        </bl-switch>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <bl-raw-select
          v-model="genre"
          :options="genreOptions"
          aria-label="Genre"
        />
        <bl-raw-select
          v-model="length"
          :options="LENGTH_OPTIONS"
          aria-label="Length"
        />
        <bl-raw-select
          v-model="format"
          :options="formatOptions"
          aria-label="Format"
        />
        <bl-raw-select
          v-model="authorId"
          :options="authorOptions"
          aria-label="Author"
        />
      </div>

      <!-- The pick -->
      <div v-if="pick" class="pick" role="status" data-testid="next-read-pick">
        <NuxtLink :to="`/library/books/${pick.book.id}`" class="pick-cover">
          <bl-home-book-cover
            :book="pick.book"
            :icon-size="18"
            class="size-full rounded-none! p-1.5!"
          />
        </NuxtLink>
        <div class="flex min-w-0 flex-col gap-2">
          <div class="flex flex-col gap-0.5">
            <NuxtLink :to="`/library/books/${pick.book.id}`" class="pick-title">
              {{ pick.book.title }}
            </NuxtLink>
            <p class="text-ink-secondary text-sm">{{ pickDetails }}</p>
          </div>
          <div v-if="pick.reasons.length" class="flex flex-wrap gap-1.5">
            <bl-chip
              v-for="reason in pick.reasons"
              :key="reason"
              size="sm"
              rounded
              color="secondary"
            >
              {{ reason }}
            </bl-chip>
          </div>
          <div class="mt-1 flex flex-wrap gap-2">
            <bl-button size="sm" :loading="starting" @click="start">
              <template #prependIcon="iconProps">
                <IconPlayerPlay v-bind="iconProps" />
              </template>
              Start reading
            </bl-button>
            <bl-button
              v-if="candidates.length > 1"
              size="sm"
              variant="secondary"
              @click="roll"
            >
              <template #prependIcon="iconProps">
                <IconRefresh v-bind="iconProps" />
              </template>
              Pick another
            </bl-button>
          </div>
        </div>
      </div>
      <div v-else class="pick-empty" role="status">
        <IconBooksOff :size="26" stroke="1.5" class="text-ink-muted" />
        <p class="font-semibold">Nothing to pick</p>
        <p class="text-ink-muted text-sm">
          {{
            sourceCandidates.length
              ? 'No unstarted books match these filters. Try fewer filters.'
              : `There are no unstarted books ${source ? `in ${source.label}` : ''}.`
          }}
        </p>
      </div>
    </div>

    <template #cancel-label>Close</template>
  </bl-modal>
</template>

<script setup lang="ts">
import {
  IconBooksOff,
  IconDice5,
  IconPlayerPlay,
  IconRefresh,
  IconSparkles,
} from '@tabler/icons-vue'
import type { Author } from '~/types/author'
import type { Book, BookFormat } from '~/types/book'
import {
  BOOK_LENGTHS,
  filterNextReads,
  isUnstarted,
  pickNextRead,
  type BookLength,
  type NextReadMode,
  type NextReadPick,
} from '~/utils/next-read'
import { pluralBooks } from '~/utils/bulk-edit'

export type NextReadSource = { id: string; label: string; books: Book[] }

const ANY = 'any'
const MODES = [
  {
    value: 'weighted',
    label: 'Smart pick',
    hint: 'Favours the top of your To Be Read, authors you rate highly and books waiting longest',
    icon: IconSparkles,
  },
  {
    value: 'random',
    label: 'Surprise me',
    hint: 'Any book, at random',
    icon: IconDice5,
  },
] as const
const LENGTH_OPTIONS = [
  { value: ANY, label: 'Any length' },
  ...Object.entries(BOOK_LENGTHS).map(([value, { label }]) => ({
    value,
    label,
  })),
]

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

const sourceId = ref(props.sources[0]?.id ?? '')
const mode = ref<NextReadMode>('weighted')
const genre = ref(ANY)
const length = ref<string>(ANY)
const format = ref(ANY)
const authorId = ref(ANY)
const pick = shallowRef<NextReadPick | null>(null)
const offered = ref<string[]>([])
const starting = ref(false)

const today = toLocalDay(new Date().toISOString())

const source = computed(
  () => props.sources.find(({ id }) => id === sourceId.value) ?? null,
)
const sourceCandidates = computed(() =>
  (source.value?.books ?? []).filter(isUnstarted),
)
const candidates = computed(() =>
  filterNextReads(sourceCandidates.value, {
    genre: genre.value === ANY ? null : genre.value,
    format: format.value === ANY ? null : (format.value as BookFormat),
    authorId: authorId.value === ANY ? null : authorId.value,
    length: length.value as BookLength,
  }),
)

// Options come from the books that can be picked, so none leads nowhere
const genreOptions = computed(() => [
  { value: ANY, label: 'Any genre' },
  ...[...new Set(sourceCandidates.value.flatMap(({ genres }) => genres ?? []))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ value: name, label: name })),
])
const formatOptions = computed(() => [
  { value: ANY, label: 'Any format' },
  ...Object.values(BOOK_FORMAT_MAP)
    .filter(({ id }) => sourceCandidates.value.some((b) => b.format === id))
    .map(({ id, description }) => ({ value: id, label: description })),
])
const authorOptions = computed(() => {
  const ids = new Set(sourceCandidates.value.map(({ author }) => author))
  return [
    { value: ANY, label: 'Any author' },
    ...props.authors
      .filter(({ id }) => ids.has(id))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(({ id, name }) => ({ value: id, label: name })),
  ]
})

const pickDetails = computed(() => {
  const book = pick.value?.book
  if (!book) return ''
  return [
    props.authors.find(({ id }) => id === book.author)?.name,
    book.pages && `${book.pages} pages`,
    book.genres?.[0],
  ]
    .filter(Boolean)
    .join(' · ')
})

/** A new pick, avoiding books already offered */
function roll() {
  pick.value = pickNextRead(
    candidates.value,
    { tbrIds: props.tbrIds, library: props.library, today },
    { mode: mode.value, exclude: offered.value },
  )
  if (!pick.value) return
  const id = pick.value.book.id
  // Once everything was offered, start the round again
  offered.value =
    offered.value.length >= candidates.value.length
      ? [id]
      : [...offered.value, id]
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

// A new source or filter starts a fresh round
watch([sourceId, mode, genre, length, format, authorId], () => {
  offered.value = []
  roll()
})
// Filters that no longer exist in the new source fall back to "any"
watch(sourceId, () => {
  genre.value = ANY
  format.value = ANY
  authorId.value = ANY
})

watch(open, (isOpen) => {
  if (!isOpen) return
  sourceId.value = props.sources[0]?.id ?? ''
  offered.value = []
  roll()
})
</script>

<style scoped>
@reference '../assets/css/main.css';

.pick {
  @apply bg-surface-subtle border-stroke flex items-start gap-4 rounded-xl border p-4;
}
.pick-cover {
  @apply bg-surface-container grid h-32 w-[5.5rem] flex-none overflow-hidden rounded shadow-[0_2px_6px_rgba(27,28,28,0.25)];
}
.pick-title {
  @apply font-display text-ink-primary hover:text-primary text-xl leading-tight font-semibold transition-colors;
}
.pick-empty {
  @apply border-stroke-strong flex flex-col items-center gap-1.5 rounded-xl border border-dashed px-4 py-8 text-center;
}
</style>

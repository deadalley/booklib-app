<template>
  <bl-modal v-model="open" size="lg" icon="IconBooks">
    <template #title>
      <span>
        Log a book
        <span class="goal-modal-sub">{{ goal.title }}</span>
      </span>
    </template>

    <div class="flex min-h-0 flex-col gap-4">
      <div class="flex flex-wrap items-center gap-3">
        <div class="search">
          <bl-search-bar
            placeholder="Search all books"
            aria-label="Search all books"
            @input="onSearch"
          />
        </div>
        <bl-switch v-if="!query.trim() && finished.length" v-model="scope">
          <bl-switch-option value="period" :selected-value="scope">
            <template #label>
              Finished in period ({{ finished.length }})
            </template>
            <template #tooltip>Books you finished during this goal</template>
          </bl-switch-option>
          <bl-switch-option value="all" :selected-value="scope">
            <template #label>All books</template>
            <template #tooltip>Every book you haven’t logged yet</template>
          </bl-switch-option>
        </bl-switch>
        <span class="flex-1" />
        <bl-view-switch v-model:view="view" />
      </div>

      <div class="results">
        <template v-if="shown.length">
          <bl-books-grid
            v-if="view === 'cards'"
            :model-value="shown"
            selectable
            @select="({ bookId }) => pick(bookId)"
          />
          <bl-books-table
            v-else
            :books="shown"
            :selected-table-columns="TABLE_COLUMNS"
            with-check
            row-clickable
            @click:row="(book: ViewBook) => pick(book.id)"
            @select:rows="onSelectRows"
          />
        </template>
        <p v-else class="text-ink-muted py-8 text-center text-sm">
          {{
            query.trim()
              ? `No books match “${query.trim()}”.`
              : 'Every book is already logged.'
          }}
        </p>
      </div>

      <div class="footer">
        <p class="chosen">
          <template v-if="selectedBook">
            <IconCheck :size="16" stroke="2.2" class="text-primary shrink-0" />
            <b class="text-ink-primary truncate">{{ selectedBook.title }}</b>
            <span v-if="selectedBook.authorName" class="truncate">
              · {{ selectedBook.authorName }}
            </span>
          </template>
          <span v-else class="text-ink-muted text-sm">Select a book</span>
        </p>
        <label class="form-wrapper w-44 flex-none">
          <span class="form-label">Finished on</span>
          <span class="form-inner">
            <input v-model="date" type="date" class="form-input" />
          </span>
        </label>
        <bl-button variant="secondary" @click="open = false">Cancel</bl-button>
        <bl-button :disabled="!selectedId" @click="save">
          <template #prependIcon="iconProps">
            <IconPlus v-bind="iconProps" />
          </template>
          Log book
        </bl-button>
      </div>
    </div>
  </bl-modal>
</template>

<script setup lang="ts">
import { IconCheck, IconPlus } from '@tabler/icons-vue'
import { v4 as uuidv4 } from 'uuid'
import type { Book, ViewBook } from '~/types/book'
import type { BookGoalEntry, Goal } from '~/types/goal'
import type { View } from '~/types/ui'

const props = defineProps<{ goal: Goal; books: ViewBook[] }>()

const emit = defineEmits<{ (e: 'save', entry: BookGoalEntry): void }>()

const open = defineModel<boolean>({ default: false })

const TABLE_COLUMNS: {
  [key in keyof Book]?: { label: string; checked: boolean }
} = {
  coverSrc: { label: 'Cover', checked: false },
  publisher: { label: 'Publisher', checked: false },
  language: { label: 'Language', checked: false },
  year: { label: 'Year', checked: true },
  pages: { label: 'Pages', checked: false },
  rating: { label: 'Rating', checked: false },
  originalTitle: { label: 'Original Title', checked: false },
  originalLanguage: { label: 'Original Language', checked: false },
  isbn: { label: 'ISBN', checked: false },
  progress: { label: 'Status', checked: true },
}

const logged = computed(
  () =>
    new Set(
      props.goal.entries.map((entry) => ('book' in entry ? entry.book : '')),
    ),
)

const pool = computed(() =>
  props.books.filter((book) => !logged.value.has(book.id)),
)

const finished = computed(() => getGoalFinishedBooks(props.goal, pool.value))

const query = ref('')
const scope = ref<'period' | 'all'>('all')
const view = ref<View>('cards')
const selectedId = ref<string | null>(null)
const date = ref(toSimpleDate(now()))

watch(
  open,
  (isOpen) => {
    if (!isOpen) return
    query.value = ''
    scope.value = finished.value.length ? 'period' : 'all'
    selectedId.value = null
    date.value = toSimpleDate(now())
  },
  { immediate: true },
)

const shown = computed(() => {
  const search = query.value.trim().toLowerCase()
  const base = search
    ? pool.value.filter((book) =>
        `${book.title} ${book.authorName ?? ''} ${book.publisher ?? ''}`
          .toLowerCase()
          .includes(search),
      )
    : scope.value === 'period'
      ? finished.value
      : pool.value

  return base.map((book) => ({
    ...book,
    selected: book.id === selectedId.value,
  }))
})

const selectedBook = computed(() =>
  props.books.find(({ id }) => id === selectedId.value),
)

function onSearch(event: Event) {
  query.value = (event.target as HTMLInputElement)?.value ?? ''
}

function pick(id: string) {
  selectedId.value = selectedId.value === id ? null : id

  const finishedAt = props.books.find((book) => book.id === id)?.progress
    .finishedAt
  if (selectedId.value && finishedAt) {
    date.value = toSimpleDate(finishedAt)
  }
}

function onSelectRows(selection: Record<string, boolean>) {
  const changed = shown.value.find(
    (book) => !!selection[String(book.id)] !== book.selected,
  )
  if (changed) pick(changed.id)
}

function save() {
  if (!selectedId.value) return
  emit('save', { id: uuidv4(), book: selectedId.value, createdAt: date.value })
  open.value = false
}
</script>

<style scoped>
@reference '../assets/css/main.css';

.search {
  @apply w-88 max-w-full;
}
.search > :deep(.form-inner) {
  @apply w-full;
}
.results {
  @apply -mx-0.5 max-h-[min(56vh,36rem)] overflow-y-auto p-0.5;
}
.results :deep(.books-grid) {
  @apply grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-4;
}
.results :deep(.book-tile-cover) {
  @apply h-44!;
}
.footer {
  @apply border-stroke-subtle flex flex-wrap items-end gap-3 border-t pt-4;
}
.chosen {
  @apply text-ink-secondary flex min-w-48 flex-[1_1_14rem] items-center gap-1.5 self-center overflow-hidden text-[0.9375rem] whitespace-nowrap;
}
</style>

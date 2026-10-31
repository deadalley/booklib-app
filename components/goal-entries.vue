<template>
  <div class="flex flex-col gap-3">
    <div v-if="unlogged.length" class="banner">
      <IconBooks :size="18" stroke="1.7" class="shrink-0" />
      <span class="min-w-48 flex-1">
        {{
          unlogged.length === 1
            ? '1 book you finished in this period isn’t logged.'
            : `${unlogged.length} books you finished in this period aren’t logged.`
        }}
      </span>
      <bl-button variant="tertiary" size="sm" @click="logUnlogged">
        Log {{ unlogged.length === 1 ? 'it' : 'all' }}
      </bl-button>
    </div>

    <p v-if="!sortedEntries.length" class="text-ink-muted py-2 text-sm">
      No entries yet. Use “Log” above to add your first one.
    </p>

    <ul v-else class="entry-list">
      <li
        v-for="entry in sortedEntries"
        :key="entry.id"
        :class="{ editing: entry.id === editId }"
      >
        <form
          v-if="entry.id === editId"
          class="entry-form"
          @submit.prevent="saveEdit"
          @keydown.esc.stop="editId = null"
        >
          <div class="flex flex-col gap-4 sm:flex-row">
            <label class="form-wrapper">
              <span class="form-label">
                {{
                  goal.type === 'books'
                    ? 'Book'
                    : GOAL_TYPE_MAP[goal.type].description
                }}
              </span>
              <span class="form-inner">
                <select
                  v-if="goal.type === 'books'"
                  v-model="form.book"
                  class="form-input"
                >
                  <option
                    v-for="book in sortedBooks"
                    :key="book.id"
                    :value="book.id"
                  >
                    {{ book.title
                    }}{{ book.authorName ? ` — ${book.authorName}` : '' }}
                  </option>
                </select>
                <input
                  v-else
                  v-model="form.amount"
                  type="number"
                  min="0"
                  :step="goal.type === 'hours' ? 0.5 : 1"
                  class="form-input"
                />
              </span>
            </label>
            <label class="form-wrapper">
              <span class="form-label">
                {{ goal.type === 'books' ? 'Finished on' : 'Read on' }}
              </span>
              <span class="form-inner">
                <input v-model="form.date" type="date" class="form-input" />
              </span>
            </label>
          </div>
          <div class="flex justify-end gap-2">
            <bl-button variant="secondary" size="sm" @click="editId = null">
              Cancel
            </bl-button>
            <bl-button size="sm" :disabled="!formValid" @click="saveEdit">
              Save entry
            </bl-button>
          </div>
        </form>

        <template v-else>
          <span class="flex min-w-0 flex-col">
            <span class="text-ink-primary truncate font-semibold">
              {{ entryLabel(entry) }}
            </span>
            <span
              v-if="goal.type === 'books' && bookFor(entry)?.authorName"
              class="text-ink-muted text-[0.8125rem] font-medium"
            >
              {{ bookFor(entry)?.authorName }}
            </span>
          </span>
          <span class="entry-date">{{ formatGoalDate(entry.createdAt) }}</span>
          <span
            v-if="isAuto(entry)"
            class="auto-tag"
            title="Counted from your library"
          >
            Auto
          </span>
          <span v-else class="entry-tools">
            <bl-icon-button
              variant="tertiary"
              aria-label="Edit entry"
              @click="startEdit(entry)"
            >
              <template #default="iconProps">
                <IconEdit v-bind="iconProps" />
              </template>
            </bl-icon-button>
            <bl-icon-button
              variant="tertiary"
              aria-label="Delete entry"
              @click="deleteEntry(entry)"
            >
              <template #default="iconProps">
                <IconTrash v-bind="iconProps" />
              </template>
            </bl-icon-button>
          </span>
        </template>
      </li>
    </ul>

    <p v-if="goal.type === 'books' && goal.auto" class="text-ink-muted text-sm">
      Books you mark as read in this period are counted automatically.
    </p>
  </div>
</template>

<script setup lang="ts">
import { IconBooks, IconEdit, IconTrash } from '@tabler/icons-vue'
import { v4 as uuidv4 } from 'uuid'
import type { ViewBook } from '~/types/book'
import type { Goal } from '~/types/goal'

type Entry = Goal['entries'][number]

const props = defineProps<{ goal: Goal; books: ViewBook[] }>()

const emit = defineEmits<{ (e: 'update', goal: Goal): void }>()

const editId = ref<string | null>(null)
const form = reactive({ book: '', amount: '', date: '' })

const booksById = computed(() =>
  Object.fromEntries(props.books.map((book) => [book.id, book])),
)

const sortedBooks = computed(() =>
  [...props.books].sort((a, b) => a.title.localeCompare(b.title)),
)

const sortedEntries = computed(() =>
  [...props.goal.entries].sort((a, b) =>
    toSimpleDate(b.createdAt).localeCompare(toSimpleDate(a.createdAt)),
  ),
)

const unlogged = computed(() => getUnloggedGoalBooks(props.goal, props.books))

const formValid = computed(() =>
  props.goal.type === 'books' ? !!form.book : +form.amount > 0,
)

function isAuto(entry: Entry) {
  return 'auto' in entry && !!entry.auto
}

function bookFor(entry: Entry) {
  return 'book' in entry ? booksById.value[entry.book] : undefined
}

function entryLabel(entry: Entry) {
  if (props.goal.type === 'books') {
    return bookFor(entry)?.title ?? 'Unknown book'
  }
  const value = getGoalEntryValue(props.goal, entry)
  return `${formatGoalNumber(value)} ${getGoalUnit(props.goal, value)}`
}

function startEdit(entry: Entry) {
  editId.value = entry.id
  form.book = 'book' in entry ? entry.book : ''
  form.amount = String(getGoalEntryValue(props.goal, entry))
  form.date = toSimpleDate(entry.createdAt)
}

function withEntries(entries: Entry[]): Goal {
  return { ...props.goal, entries } as Goal
}

function saveEdit() {
  if (!formValid.value || !editId.value) return

  const entries = props.goal.entries.map((entry) => {
    if (entry.id !== editId.value) return entry
    return props.goal.type === 'books'
      ? { ...entry, book: form.book, createdAt: form.date }
      : { ...entry, [props.goal.type]: +form.amount, createdAt: form.date }
  })

  emit('update', withEntries(entries as Entry[]))
  editId.value = null
}

function deleteEntry(entry: Entry) {
  emit(
    'update',
    withEntries(props.goal.entries.filter(({ id }) => id !== entry.id)),
  )
}

function logUnlogged() {
  emit(
    'update',
    withEntries([
      ...props.goal.entries,
      ...unlogged.value.map((book) => ({
        id: uuidv4(),
        book: book.id,
        createdAt: toSimpleDate(book.progress.finishedAt!),
      })),
    ] as Entry[]),
  )
}
</script>

<style scoped>
@reference '../assets/css/main.css';

.banner {
  @apply border-primary-100 bg-primary-50 text-primary-700 rounded-scholarly flex flex-wrap items-center gap-2.5 border px-3 py-2 text-sm font-semibold;
}
.entry-list {
  @apply border-stroke-subtle flex flex-col overflow-hidden rounded-xl border;
}
.entry-list li {
  @apply grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 px-4 py-2.5;
}
.entry-list li + li {
  @apply border-stroke-subtle border-t;
}
.entry-list li:hover {
  @apply bg-surface-canvas;
}
.entry-list li.editing {
  @apply block p-2;
}
.entry-form {
  @apply border-stroke bg-surface-canvas flex flex-col gap-3 rounded-xl border p-4;
}
.entry-date {
  @apply text-ink-secondary text-sm font-medium whitespace-nowrap;
}
.entry-tools {
  @apply flex gap-0.5 opacity-55;
}
.entry-list li:hover .entry-tools,
.entry-tools:focus-within {
  @apply opacity-100;
}
.auto-tag {
  @apply bg-surface-container text-ink-secondary justify-self-end rounded-full px-2 py-0.5 text-[0.6875rem] font-bold tracking-widest uppercase;
}
</style>

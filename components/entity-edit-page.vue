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
          {{ isNew ? `Create ${kind}` : 'Save changes' }}
        </bl-button>
      </div>
    </div>

    <header class="flex flex-col gap-2">
      <p class="book-page-section-title">
        {{ isNew ? `New ${kind}` : 'Editing' }}
      </p>
      <h2 class="book-page-title">{{ name.trim() || untitledLabel }}</h2>
    </header>

    <div class="book-page-edit-grid">
      <aside class="flex min-w-0 flex-col gap-6">
        <div class="w-48 @min-[720px]:w-56">
          <div class="book-page-cover-frame">
            <bl-entity-cover-mosaic
              :books="selectedBooks"
              :empty-icon="isCollection ? 'IconArchive' : 'IconFeather'"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2.5">
          <p class="form-label">Cover</p>
          <p class="hint">
            Built from the first four books{{
              isCollection ? ' in this collection' : ''
            }}.
          </p>
        </div>

        <div class="flex flex-col items-start gap-2.5">
          <p class="form-label">Selected</p>
          <p class="text-ink-secondary text-[0.9375rem]">
            <b
              class="font-display text-ink-primary mr-1 text-2xl font-semibold"
            >
              {{ selected.length }}
            </b>
            {{ selected.length === 1 ? 'book' : 'books' }}
          </p>
          <button
            v-if="selected.length"
            type="button"
            class="text-ink-muted hover:text-primary cursor-pointer text-[0.8125rem] font-semibold underline"
            @click="selected = []"
          >
            Clear selection
          </button>
        </div>
      </aside>

      <form
        class="flex max-w-3xl min-w-0 flex-col gap-6"
        novalidate
        @submit.prevent="onSave"
      >
        <section class="book-page-section">
          <p class="book-page-section-title">
            {{ isCollection ? 'Collection' : 'Author' }}
          </p>
          <bl-input
            id="entity-name"
            v-model="name"
            label="Name"
            placeholder="Name"
            :autofocus="isNew"
            :delay="0"
            :error="nameError"
          />
        </section>

        <section class="book-page-section">
          <div class="flex min-h-7 items-center justify-between gap-3">
            <p class="book-page-section-title">Books</p>
            <bl-total-tag>
              {{ selected.length }} of {{ orderedBooks.length }}
            </bl-total-tag>
          </div>
          <p v-if="!isCollection" class="hint">
            Books can have one author — ticking a book here moves it to
            {{ name.trim() || 'this author' }}.
          </p>
          <div class="search">
            <bl-search-bar
              placeholder="Search books"
              aria-label="Search books"
              @input="onSearch"
            />
          </div>
          <div v-if="visibleBooks.length" class="overflow-x-auto">
            <bl-books-table
              :books="visibleBooks"
              :selected-table-columns="TABLE_COLUMNS"
              with-check
              row-clickable
              @click:row="(book: ViewBook) => toggle(book.id)"
              @select:rows="onSelectRows"
            />
          </div>
          <p v-else class="hint">No books match “{{ query }}”.</p>
        </section>

        <div class="flex flex-wrap justify-end gap-2">
          <bl-button variant="secondary" @click="$emit('cancel')">
            {{ isNew ? 'Cancel' : 'Discard changes' }}
          </bl-button>
          <bl-button :disabled="!dirty" @click="onSave">
            <template #prependIcon="iconProps">
              <IconDeviceFloppy v-bind="iconProps" />
            </template>
            {{ isNew ? `Create ${kind}` : 'Save changes' }}
          </bl-button>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-vue'
import type { Book, ViewBook } from '~/types/book'

const props = defineProps<{
  kind: 'collection' | 'author'
  isNew?: boolean
  initialName: string
  books: ViewBook[]
  initialSelectedIds: Book['id'][]
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'save', payload: { name: string; selectedIds: Book['id'][] }): void
}>()

const TABLE_COLUMNS: {
  [key in keyof Book]?: { label: string; checked: boolean }
} = {
  coverSrc: { label: 'Cover', checked: true },
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

const isCollection = computed(() => props.kind === 'collection')
const untitledLabel = computed(() =>
  isCollection.value ? 'Untitled collection' : 'Unnamed author',
)

const name = ref(props.initialName)
const selected = ref<Book['id'][]>([...props.initialSelectedIds])
const query = ref('')
const submitAttempted = ref(false)

const initialSelected = new Set(props.initialSelectedIds)

// Ordered once so rows don't jump around while ticking
const orderedBooks = [...props.books].sort(
  (a, b) =>
    Number(initialSelected.has(b.id)) - Number(initialSelected.has(a.id)) ||
    a.title.localeCompare(b.title, undefined, { numeric: true }),
)

const selectedSet = computed(() => new Set(selected.value))

const visibleBooks = computed(() => {
  const search = query.value.trim().toLowerCase()

  return orderedBooks
    .filter(
      ({ title, authorName }) =>
        !search ||
        `${title} ${authorName ?? ''}`.toLowerCase().includes(search),
    )
    .map((book) => ({ ...book, selected: selectedSet.value.has(book.id) }))
})

const selectedBooks = computed(() =>
  selected.value.flatMap((id) => {
    const book = orderedBooks.find((b) => b.id === id)
    return book ? [book] : []
  }),
)

const nameError = computed(
  () => submitAttempted.value && !name.value.trim() && 'Name is required',
)

const dirty = computed(
  () =>
    !!props.isNew ||
    name.value !== props.initialName ||
    selected.value.length !== initialSelected.size ||
    selected.value.some((id) => !initialSelected.has(id)),
)

function setSelected(id: Book['id'], value: boolean) {
  const isSelected = selectedSet.value.has(id)

  if (value && !isSelected) {
    selected.value = [...selected.value, id]
  } else if (!value && isSelected) {
    selected.value = selected.value.filter((selectedId) => selectedId !== id)
  }
}

function toggle(id: Book['id']) {
  setSelected(id, !selectedSet.value.has(id))
}

function onSelectRows(selection: Record<string, boolean>) {
  visibleBooks.value.forEach(({ id }) =>
    setSelected(id, !!selection[String(id)]),
  )
}

function onSearch(event: Event) {
  query.value = (event.target as HTMLInputElement)?.value ?? ''
}

function onSave() {
  submitAttempted.value = true

  if (!dirty.value || nameError.value) return

  emit('save', { name: name.value.trim(), selectedIds: selected.value })
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
@reference '../assets/css/main.css';

.hint {
  @apply text-ink-muted text-sm leading-normal;
}

.search > .form-inner {
  @apply w-full;
}
</style>

<template>
  <Transition name="bulk-actions-float">
    <div
      v-if="open"
      class="pointer-events-none fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 flex justify-center px-4 sm:bottom-6"
    >
      <div
        class="bulk-actions-bar pointer-events-auto"
        role="toolbar"
        aria-label="Bulk actions"
      >
        <div class="bulk-actions-section">
          <span class="bulk-actions-count">{{ selectedBooksCount }}</span>
          <div class="flex flex-col gap-0.5">
            <p class="bulk-actions-title">
              {{ selectedBooksCount === 1 ? 'Item' : 'Items' }} Selected
            </p>
            <div class="flex min-h-4 gap-3">
              <button
                v-if="selectedBooksCount < totalBooksCount"
                type="button"
                class="bulk-actions-link"
                @click="emit('select-all')"
              >
                Select all {{ totalBooksCount }}
              </button>
              <button
                v-if="selectedBooksCount > 0"
                type="button"
                class="bulk-actions-link"
                @click="emit('clear')"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div class="bulk-actions-divider" />

        <div class="bulk-actions-section flex-wrap justify-center">
          <button
            v-for="item in ACTIONS"
            :key="item.id"
            class="bulk-action-btn"
            :class="{ 'bulk-action-btn-danger': item.id === 'delete' }"
            type="button"
            :disabled="!hasSelectedBooks"
            @click="openAction(item.id)"
          >
            <component :is="item.icon" :size="16" stroke="1.75" />
            {{ item.label }}
          </button>
        </div>

        <div class="bulk-actions-divider" />

        <button
          class="bulk-action-close"
          type="button"
          aria-label="Close bulk actions"
          @click="onClose"
        >
          <IconX :size="20" stroke="1.8" />
        </button>
      </div>
    </div>
  </Transition>

  <bl-modal
    :model-value="!!action"
    size="sm"
    @update:model-value="(value) => !value && (action = null)"
    @confirm="onConfirm"
  >
    <template #title>{{ title }}</template>

    <div class="flex flex-col gap-4" data-testid="bulk-action-form">
      <!-- Collection -->
      <template v-if="action === 'collection'">
        <bl-switch v-model="collectionMode" aria-label="Add or remove">
          <bl-switch-option
            v-for="mode in MODES"
            :key="mode.value"
            :value="mode.value"
            :selected-value="collectionMode"
          >
            <template #label>{{ mode.label }}</template>
          </bl-switch-option>
        </bl-switch>
        <bl-raw-select
          v-model="collectionId"
          :options="collectionOptions"
          :with-wrapper="false"
          placeholder="Choose collection"
        />
      </template>

      <!-- Status -->
      <bl-raw-select
        v-else-if="action === 'status'"
        v-model="statusValue"
        :options="STATUS_OPTIONS"
        :with-wrapper="false"
        placeholder="Choose status"
      />

      <!-- Edit: one field at a time -->
      <template v-else-if="action === 'edit'">
        <bl-switch v-model="editField" aria-label="Field">
          <bl-switch-option
            v-for="field in EDIT_FIELDS"
            :key="field.value"
            :value="field.value"
            :selected-value="editField"
          >
            <template #label>{{ field.label }}</template>
          </bl-switch-option>
        </bl-switch>

        <bl-raw-select
          v-if="editField === 'author'"
          v-model="authorId"
          :options="authorOptions"
          :with-wrapper="false"
          placeholder="Choose author"
        />

        <template v-else-if="editField === 'genre'">
          <bl-switch v-model="genreMode" aria-label="Add or remove">
            <bl-switch-option
              v-for="mode in MODES"
              :key="mode.value"
              :value="mode.value"
              :selected-value="genreMode"
            >
              <template #label>{{ mode.label }}</template>
            </bl-switch-option>
          </bl-switch>
          <bl-raw-autocomplete
            v-model="genre"
            v-model:search-term="genreSearch"
            :options="genreOptions"
            :can-create-new="genreMode === 'add'"
            placeholder="Choose a genre"
          />
        </template>

        <bl-raw-select
          v-else-if="editField === 'format'"
          v-model="format"
          :options="FORMAT_OPTIONS"
          :with-wrapper="false"
          placeholder="Choose format"
        />

        <div v-else-if="editField === 'rating'" class="flex items-center">
          <bl-rating-input
            :rating="rating"
            @commit="(value) => (rating = value)"
          />
        </div>
      </template>

      <!-- Export -->
      <bl-switch
        v-else-if="action === 'export'"
        v-model="exportFormat"
        aria-label="Format"
      >
        <bl-switch-option
          v-for="option in EXPORT_FORMATS"
          :key="option.value"
          :value="option.value"
          :selected-value="exportFormat"
        >
          <template #label>{{ option.label }}</template>
        </bl-switch-option>
      </bl-switch>

      <p v-if="action === 'delete'" class="text-ink-secondary text-sm">
        This action cannot be undone.
      </p>
      <p v-else-if="!ready" class="text-ink-muted text-sm">
        {{ hint }}
      </p>
    </div>

    <template #cancel-label>Cancel</template>
    <template #action-label>{{ actionLabel }}</template>
  </bl-modal>
</template>

<script setup lang="ts">
import {
  IconDownload,
  IconFolder,
  IconPencil,
  IconProgress,
  IconTrash,
  IconX,
} from '@tabler/icons-vue'
import type { BookFormat, BookProgressStatus } from '~/types/book'
import type { BulkBookChange } from '~/types/ui'

type ActionOption = { value: string; label: string }
type Action = 'collection' | 'status' | 'edit' | 'export' | 'delete'
type EditField = 'author' | 'genre' | 'format' | 'rating'
type Mode = 'add' | 'remove'

const ACTIONS = [
  { id: 'collection', label: 'Collection', icon: IconFolder },
  { id: 'status', label: 'Status', icon: IconProgress },
  { id: 'edit', label: 'Edit', icon: IconPencil },
  { id: 'export', label: 'Export', icon: IconDownload },
  { id: 'delete', label: 'Remove', icon: IconTrash },
] as const

const MODES: { value: Mode; label: string }[] = [
  { value: 'add', label: 'Add' },
  { value: 'remove', label: 'Remove' },
]
const EDIT_FIELDS: { value: EditField; label: string }[] = [
  { value: 'author', label: 'Author' },
  { value: 'genre', label: 'Genre' },
  { value: 'format', label: 'Format' },
  { value: 'rating', label: 'Rating' },
]
// The select needs a string value for "not started"
const NOT_STARTED = 'not-started'
const STATUS_OPTIONS: ActionOption[] = [
  { value: NOT_STARTED, label: 'Not started' },
  ...Object.values(PROGRESS_STATUS_MAP).map(({ id, description }) => ({
    value: id,
    label: description,
  })),
]
const FORMAT_OPTIONS: ActionOption[] = Object.values(BOOK_FORMAT_MAP).map(
  ({ id, description }) => ({ value: id, label: description }),
)
const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
] as const

const props = defineProps<{
  selectedBooksCount: number
  totalBooksCount: number
  hasSelectedBooks: boolean
  collectionOptions: ActionOption[]
  authorOptions: ActionOption[]
  genreOptions: ActionOption[]
}>()

const open = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  (e: 'close' | 'delete' | 'select-all' | 'clear'): void
  (e: 'change', change: BulkBookChange): void
  (e: 'export', format: 'csv' | 'json'): void
}>()

const action = ref<Action | null>(null)
const collectionMode = ref<Mode>('add')
const collectionId = ref<string>()
const statusValue = ref<string>()
const editField = ref<EditField>('author')
const authorId = ref<string>()
const genreMode = ref<Mode>('add')
const genre = ref<string>()
const genreSearch = ref<string>()
const format = ref<string>()
const rating = ref<number | null>(null)
const exportFormat = ref<'csv' | 'json'>('csv')

function reset() {
  collectionMode.value = 'add'
  collectionId.value = undefined
  statusValue.value = undefined
  editField.value = 'author'
  authorId.value = undefined
  genreMode.value = 'add'
  genre.value = undefined
  genreSearch.value = undefined
  format.value = undefined
  rating.value = null
  exportFormat.value = 'csv'
}

function openAction(next: Action) {
  reset()
  action.value = next
}

watch(open, (isOpen) => {
  if (!isOpen) action.value = null
})

const books = computed(
  () =>
    `${props.selectedBooksCount} ${props.selectedBooksCount === 1 ? 'book' : 'books'}`,
)

const title = computed(() => {
  switch (action.value) {
    case 'collection':
      return collectionMode.value === 'add'
        ? `Add ${books.value} to a collection`
        : `Remove ${books.value} from a collection`
    case 'status':
      return `Set the status of ${books.value}`
    case 'edit':
      return `Edit ${books.value}`
    case 'export':
      return `Export ${books.value}`
    case 'delete':
      return `Delete ${books.value}?`
    default:
      return ''
  }
})

const actionLabel = computed(() => {
  switch (action.value) {
    case 'collection':
      return collectionMode.value === 'add' ? 'Add' : 'Remove'
    case 'export':
      return 'Download'
    case 'delete':
      return 'Delete'
    default:
      return 'Apply'
  }
})

/** The change to apply, or null while the form is incomplete */
const change = computed<BulkBookChange | null>(() => {
  switch (action.value) {
    case 'collection':
      return collectionId.value
        ? {
            field: 'collection',
            collectionId: collectionId.value,
            mode: collectionMode.value,
          }
        : null
    case 'status':
      return statusValue.value
        ? {
            field: 'status',
            status:
              statusValue.value === NOT_STARTED
                ? null
                : (statusValue.value as BookProgressStatus),
          }
        : null
    case 'edit':
      switch (editField.value) {
        case 'author':
          return authorId.value
            ? { field: 'author', authorId: authorId.value }
            : null
        case 'genre': {
          // When adding, a typed new genre counts without picking "Add …"
          const value = (
            genre.value ??
            (genreMode.value === 'add' ? genreSearch.value : undefined)
          )?.trim()
          return value
            ? { field: 'genre', genre: value, mode: genreMode.value }
            : null
        }
        case 'format':
          return format.value
            ? { field: 'format', format: format.value as BookFormat }
            : null
        case 'rating':
          return { field: 'rating', rating: rating.value }
      }
      return null
    default:
      return null
  }
})

const ready = computed(
  () =>
    action.value === 'export' || action.value === 'delete' || !!change.value,
)

const hint = computed(() => {
  if (action.value === 'collection') return 'Choose a collection first.'
  if (action.value === 'status') return 'Choose a status first.'
  return `Choose a ${editField.value} first.`
})

function onConfirm() {
  if (!props.hasSelectedBooks) return
  if (action.value === 'delete') emit('delete')
  else if (action.value === 'export') emit('export', exportFormat.value)
  else if (change.value) emit('change', change.value)
}

function onKeydown(event: KeyboardEvent) {
  if (
    event.key !== 'Escape' ||
    !open.value ||
    action.value ||
    document.querySelector('[role="dialog"]')
  ) {
    return
  }

  onClose()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))

function onClose() {
  open.value = false
  emit('close')
}
</script>

<style scoped>
@reference '../assets/css/main.css';

.bulk-actions-bar {
  /* Always dark, so its text stays light in both themes */
  --ink-inverse: var(--ink-on-dark);
  @apply bg-surface-inverse text-ink-inverse flex max-w-full flex-wrap items-center justify-center gap-6 rounded-xl px-6 py-4 shadow-2xl;
  @apply max-sm:gap-3 max-sm:px-4 max-sm:py-3;
}

.bulk-actions-section {
  @apply flex items-center gap-3;
}

.bulk-actions-count {
  @apply bg-primary text-ink-inverse inline-flex size-10 shrink-0 items-center justify-center rounded-full text-lg font-semibold;
}

.bulk-actions-title {
  @apply text-ink-inverse text-base font-medium tracking-wider whitespace-nowrap;
}

.bulk-actions-link {
  @apply text-ink-inverse/65 hover:text-ink-inverse cursor-pointer text-xs font-semibold tracking-wide underline underline-offset-2;
}

.bulk-actions-subtitle {
  @apply text-ink-inverse/60 text-[10px] font-semibold tracking-wider uppercase;
}

.bulk-actions-divider {
  @apply bg-ink-inverse/15 h-10 w-px max-sm:hidden;
}

.bulk-action-btn {
  @apply text-ink-inverse hover:text-ink-inverse/70 disabled:text-ink-inverse/35 inline-flex cursor-pointer items-center gap-2 px-2 py-1 text-sm font-medium tracking-wider uppercase transition-colors disabled:cursor-not-allowed;
}

.bulk-action-btn-danger {
  @apply text-primary hover:text-primary/70 disabled:text-primary/40;
}

.bulk-action-close {
  @apply text-ink-inverse hover:text-ink-inverse/70 inline-flex cursor-pointer items-center justify-center p-1 pl-0 transition-colors;
}

.bulk-actions-float-enter-active,
.bulk-actions-float-leave-active {
  transition:
    opacity 220ms ease,
    transform 220ms ease;
}

.bulk-actions-float-enter-from,
.bulk-actions-float-leave-to {
  opacity: 0;
  transform: translateY(18px);
}

.bulk-actions-float-enter-to,
.bulk-actions-float-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>

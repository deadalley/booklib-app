<template>
  <div class="reader" data-testid="reader">
    <header class="reader-bar">
      <NuxtLink :to="`/library/books/${bookId}`" class="link-back min-h-10!">
        <IconArrowLeft :size="ICON_SIZE_SMALL" stroke="1.5" />
        <span class="max-sm:hidden">Back to book</span>
      </NuxtLink>
      <div class="flex min-w-0 flex-1 flex-col items-center text-center">
        <p class="reader-title">{{ book?.title }}</p>
        <p class="text-ink-muted text-xs" data-testid="reader-position">
          {{ positionLabel }}
        </p>
      </div>
      <div class="flex items-center gap-1">
        <template v-if="format === 'epub'">
          <bl-icon-button
            variant="tertiary"
            size="sm"
            aria-label="Smaller text"
            :disabled="fontSize <= MIN_FONT"
            @click="setFontSize(fontSize - 10)"
          >
            <template #default="iconProps">
              <IconTextDecrease v-bind="iconProps" />
            </template>
          </bl-icon-button>
          <bl-icon-button
            variant="tertiary"
            size="sm"
            aria-label="Larger text"
            :disabled="fontSize >= MAX_FONT"
            @click="setFontSize(fontSize + 10)"
          >
            <template #default="iconProps">
              <IconTextIncrease v-bind="iconProps" />
            </template>
          </bl-icon-button>
          <bl-icon-button
            v-if="toc.length"
            variant="tertiary"
            size="sm"
            aria-label="Contents"
            @click="tocOpen = true"
          >
            <template #default="iconProps">
              <IconList v-bind="iconProps" />
            </template>
          </bl-icon-button>
        </template>
      </div>
    </header>

    <main class="reader-stage">
      <bl-alert
        v-if="error"
        icon="IconAlertTriangle"
        role="alert"
        class="m-auto max-w-md"
      >
        {{ error }}
      </bl-alert>
      <bl-loading v-else-if="!data" class="m-auto" />
      <template v-else>
        <bl-icon-button
          variant="tertiary"
          class="reader-turn left-2"
          aria-label="Previous page"
          @click="view?.prev()"
        >
          <template #default="iconProps">
            <IconChevronLeft v-bind="iconProps" />
          </template>
        </bl-icon-button>
        <div class="reader-page">
          <bl-epub-view
            v-if="format === 'epub'"
            ref="view"
            :data="data"
            :location="startLocation"
            :font-size="fontSize"
            :highlights="highlightLocations"
            @ready="({ toc: items }) => (toc = items)"
            @relocated="onRelocated"
            @selected="(value) => (selection = value)"
          />
          <bl-pdf-view
            v-else
            ref="view"
            :data="data"
            :location="startLocation"
            @relocated="onRelocated"
            @selected="(value) => (selection = value)"
          />
        </div>
        <bl-icon-button
          variant="tertiary"
          class="reader-turn right-2"
          aria-label="Next page"
          @click="view?.next()"
        >
          <template #default="iconProps">
            <IconChevronRight v-bind="iconProps" />
          </template>
        </bl-icon-button>
      </template>
    </main>

    <footer class="reader-foot">
      <bl-progress-bar :progress-value="progress * 100" size="xs" />
      <!-- Phones have no side buttons: turn pages from here -->
      <div v-if="data" class="mt-2 flex justify-between gap-3 sm:hidden">
        <bl-button variant="secondary" size="sm" @click="view?.prev()">
          <template #prependIcon="iconProps">
            <IconChevronLeft v-bind="iconProps" />
          </template>
          Previous
        </bl-button>
        <bl-button variant="secondary" size="sm" @click="view?.next()">
          Next
          <template #appendIcon="iconProps">
            <IconChevronRight v-bind="iconProps" />
          </template>
        </bl-button>
      </div>
    </footer>

    <!-- Selected text: save it as a highlight -->
    <Transition name="reader-pop">
      <div
        v-if="selection"
        class="reader-selection"
        role="dialog"
        aria-label="Selected text"
      >
        <p class="reader-quote">“{{ selection.text }}”</p>
        <div class="flex flex-none gap-2">
          <bl-button size="sm" variant="tertiary" @click="clearSelection">
            Cancel
          </bl-button>
          <bl-button size="sm" :loading="saving" @click="saveHighlight">
            <template #prependIcon="iconProps">
              <IconHighlight v-bind="iconProps" />
            </template>
            Highlight
          </bl-button>
        </div>
      </div>
    </Transition>

    <bl-modal v-model="tocOpen" size="sm" sheet>
      <template #title>Contents</template>
      <ul class="flex max-h-[60vh] flex-col overflow-y-auto">
        <li v-for="item in toc" :key="item.href">
          <button
            type="button"
            class="reader-toc-item"
            :style="{ paddingLeft: `${0.75 + item.depth}rem` }"
            @click="goTo(item.href)"
          >
            {{ item.label }}
          </button>
        </li>
      </ul>
    </bl-modal>

    <bl-toast :message="toast" />
  </div>
</template>

<script setup lang="ts">
import {
  IconArrowLeft,
  IconChevronLeft,
  IconChevronRight,
  IconHighlight,
  IconList,
  IconTextDecrease,
  IconTextIncrease,
} from '@tabler/icons-vue'
import { v4 as uuidv4 } from 'uuid'
import type { TocItem } from '~/components/reader/epub-view.vue'
import type { Book } from '~/types/book'

const FONT_KEY = 'booklib.reader.fontSize'
const MIN_FONT = 80
const MAX_FONT = 160
const SAVE_AFTER_MS = 1200
const MAX_QUOTE = 2000

const route = useRoute()
const bookId = route.params.id as string
const { getBook, readEbook, saveReadingPosition, updateBook } = useBookLibrary()

type ReaderView = {
  next: () => void
  prev: () => void
  goTo: (location: string) => void
  clearSelection: () => void
}

const book = ref<Book | null>(null)
const data = shallowRef<Uint8Array | null>(null)
const error = ref<string | null>(null)
const view = ref<ReaderView>()
const toc = ref<TocItem[]>([])
const tocOpen = ref(false)
const progress = ref(0)
const positionLabel = ref('')
const selection = ref<{ location: string; text: string } | null>(null)
const saving = ref(false)
const toast = ref<string | null>(null)
const fontSize = ref(readFontSize())

const format = computed(() => book.value?.ebook?.format ?? null)
// A highlight's link opens there; otherwise where reading stopped
const startLocation = computed(
  () =>
    (route.query.at as string | undefined) ??
    book.value?.ebook?.location ??
    null,
)
const highlightLocations = computed(() =>
  (book.value?.progress.notes ?? []).flatMap((note) =>
    note.highlight && !note.highlight.location.startsWith('page:')
      ? [note.highlight.location]
      : [],
  ),
)

function readFontSize() {
  try {
    return Number(localStorage.getItem(FONT_KEY)) || 100
  } catch {
    return 100
  }
}

function setFontSize(value: number) {
  fontSize.value = Math.min(MAX_FONT, Math.max(MIN_FONT, value))
  try {
    localStorage.setItem(FONT_KEY, String(fontSize.value))
  } catch {
    // Remembered for this session only
  }
}

// ── Saving the position ───────────────────────────────────────────────────

let pending: { location: string; progress: number; page?: number } | null = null
let saveTimer: ReturnType<typeof setTimeout> | undefined

async function flush() {
  clearTimeout(saveTimer)
  if (!pending) return
  const position = pending
  pending = null
  await saveReadingPosition(bookId, position)
}

function onRelocated(position: {
  location: string
  progress: number
  page?: number
  label: string
}) {
  progress.value = position.progress
  positionLabel.value = position.label
  // An EPUB has no pages; estimate one from the book's page count
  const page =
    position.page ??
    (book.value?.pages
      ? Math.max(1, Math.round(position.progress * book.value.pages))
      : undefined)
  pending = { location: position.location, progress: position.progress, page }
  clearTimeout(saveTimer)
  saveTimer = setTimeout(flush, SAVE_AFTER_MS)
}

// ── Highlights ───────────────────────────────────────────────────────────

function clearSelection() {
  view.value?.clearSelection()
  selection.value = null
}

async function saveHighlight() {
  const current = selection.value
  if (!current || !book.value || saving.value) return
  saving.value = true
  try {
    const fresh = await getBook(bookId)
    if (!fresh) return
    const page =
      pending?.page ??
      (current.location.startsWith('page:')
        ? Number(current.location.slice(5))
        : undefined)
    const notes = [
      ...fresh.progress.notes,
      {
        id: uuidv4(),
        createdAt: fromSimpleDate(todaySimpleDate()),
        ...(page ? { page } : {}),
        content: current.text.slice(0, MAX_QUOTE),
        highlight: { location: current.location },
      },
    ]
    await updateBook(bookId, { progress: { ...fresh.progress, notes } })
    book.value = { ...fresh, progress: { ...fresh.progress, notes } }
    clearSelection()
    showToast('Highlight saved to your notes')
  } finally {
    saving.value = false
  }
}

let toastTimer: ReturnType<typeof setTimeout> | undefined
function showToast(message: string) {
  toast.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = null), 2600)
}

function goTo(target: string) {
  tocOpen.value = false
  view.value?.goTo(target)
}

// ── Keys and loading ─────────────────────────────────────────────────────

function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  if (target?.closest('input, textarea, [role="dialog"]')) return
  if (event.key === 'ArrowRight' || event.key === 'PageDown') view.value?.next()
  if (event.key === 'ArrowLeft' || event.key === 'PageUp') view.value?.prev()
}

onMounted(async () => {
  window.addEventListener('keydown', onKeydown)
  try {
    book.value = await getBook(bookId)
    if (!book.value?.ebook) {
      error.value = 'This book has no ebook file. Add one on the book’s page.'
      return
    }
    progress.value = book.value.ebook.progress
    data.value = await readEbook(bookId)
  } catch (caught) {
    error.value =
      caught instanceof Error
        ? `The ebook couldn’t be opened: ${caught.message}`
        : 'The ebook couldn’t be opened.'
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  clearTimeout(toastTimer)
  flush()
})

useHead({
  title: computed(() =>
    book.value ? `${book.value.title} | BookLib` : 'BookLib | Reader',
  ),
})
</script>

<style scoped>
@reference '../../assets/css/main.css';

.reader {
  @apply bg-surface-canvas text-ink-primary fixed inset-0 flex flex-col;
}
.reader-bar {
  @apply border-stroke-subtle flex items-center gap-3 border-b px-4 py-2 sm:px-6;
}
.reader-title {
  @apply font-display max-w-full truncate text-base font-semibold;
}
.reader-stage {
  @apply relative flex min-h-0 flex-1;
}
.reader-page {
  @apply mx-auto h-full w-full max-w-4xl px-12 py-6 max-sm:px-3;
}
.reader-turn {
  @apply absolute top-1/2 z-10 -translate-y-1/2 max-sm:hidden;
}
.reader-foot {
  @apply px-6 pt-1 pb-4;
}
.reader-selection {
  @apply bg-surface-elevated border-stroke fixed bottom-6 left-1/2 z-40 flex w-[min(40rem,calc(100vw-2rem))] -translate-x-1/2 items-center gap-3 rounded-xl border px-4 py-3 shadow-[0_24px_48px_-12px_rgba(27,28,28,0.35)];
  @apply max-sm:flex-col max-sm:items-stretch;
}
.reader-quote {
  @apply font-display text-ink-secondary line-clamp-2 min-w-0 flex-1 text-sm italic;
}
.reader-toc-item {
  @apply hover:bg-surface-subtle w-full cursor-pointer rounded-lg py-2 pr-3 text-left text-sm;
}
.reader-pop-enter-active,
.reader-pop-leave-active {
  transition:
    opacity 0.15s,
    transform 0.15s;
}
.reader-pop-enter-from,
.reader-pop-leave-to {
  opacity: 0;
  transform: translate(-50%, 6px);
}
</style>

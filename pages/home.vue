<template>
  <NuxtLayout name="dashboard" title="Home">
    <div v-if="!loaded" class="grid place-items-center py-24">
      <bl-loading />
    </div>

    <div v-else-if="isEmpty" class="mx-auto flex w-full max-w-[90rem] flex-col">
      <div class="mb-8 flex flex-col gap-1">
        <span class="section-label text-primary">Home</span>
        <h3>Welcome to your new library</h3>
      </div>
      <div class="flex flex-col items-center gap-4">
        <img
          :src="getAssetPath('/book-graphics.svg')"
          alt="Book"
          class="h-56 object-cover object-center sm:h-80"
        />
        <h4>Your library is empty.</h4>
        <p class="text-center text-lg">
          It looks like you don't have any books yet in your library.
          <br />
          Let's add your first book.
        </p>
        <bl-button to="/library/books/new" class="mt-4 w-full sm:w-72">
          <template #prependIcon="prependIcon">
            <IconPlus v-bind="prependIcon" />
          </template>
          Add first book to library
        </bl-button>
        <div
          class="[&_hr]:text-ink-muted flex w-full max-w-sm items-center justify-center gap-6 py-3 [&_hr]:w-full"
        >
          <hr />
          <h6>OR</h6>
          <hr />
        </div>
        <bl-button
          to="/data-management"
          variant="secondary"
          class="w-full sm:w-72"
        >
          <template #prependIcon="prependIcon">
            <IconUpload v-bind="prependIcon" />
          </template>
          Import books from file
        </bl-button>
      </div>
    </div>

    <div v-else class="home">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-primary text-xs font-bold tracking-[0.18em] uppercase">
            {{ dateLabel }}
          </p>
          <h3 class="text-ink-primary">{{ greeting }}</h3>
        </div>
        <bl-button to="/library/books/new">
          <template #prependIcon="prependIcon">
            <IconPlus v-bind="prependIcon" />
          </template>
          Add book
        </bl-button>
      </div>

      <div class="top">
        <bl-home-suggestions
          :items="suggestions"
          :busy="busy"
          @act="onAct"
          @dismiss="dismiss"
        />
        <bl-home-library-links :books="books" :collections="collections" />
      </div>

      <div class="main">
        <bl-home-continue-reading
          class="span-7"
          :books="reading"
          :authors="authors"
        />
        <bl-home-goals class="span-5" :goals="activeGoals" />
        <bl-home-year-stats :books="books" />
        <bl-home-recent-books
          :books="latest"
          :authors="authors"
          :today="today"
        />
      </div>
    </div>

    <Transition name="fade">
      <div v-if="toast" class="toast" role="status">
        <IconCheck :size="16" stroke="2.2" />
        {{ toast }}
      </div>
    </Transition>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { IconCheck, IconPlus, IconUpload } from '@tabler/icons-vue'
import { useLocalStorage } from '@vueuse/core'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'
import type { Author } from '~/types/author'
import type { Book } from '~/types/book'
import type { Collection } from '~/types/collection'
import type { Goal } from '~/types/goal'
import { useBookLibrary } from '~/composables/use-book-library'
import { getAssetPath } from '~/utils/assets'
import { now, todaySimpleDate, toSimpleDate } from '~/utils/date'
import { getGoalStatus, resolveGoal, stripAutoEntries } from '~/utils/goal'
import {
  activeDismissals,
  buildSuggestions,
  getBookPercentage,
  getGreeting,
  snoozeUntil,
  type Suggestion,
} from '~/utils/suggestions'

const TOAST_MS = 2600

const {
  isLibraryEmpty,
  getAuthors,
  getBooks,
  getCollections,
  getGoals,
  createGoal,
  updateBook,
} = useBookLibrary()

const loaded = ref(false)
const isEmpty = ref(false)
const authors = ref<Author[]>([])
const books = ref<Book[]>([])
const collections = ref<Collection[]>([])
const goals = ref<Goal[]>([])

const busy = ref<string | null>(null)
const toast = ref<string | null>(null)

// Dismissed suggestion ids and when they may come back
const dismissed = useLocalStorage<Record<string, number>>(
  'bl-home-dismissed',
  {},
)

const today = todaySimpleDate()
const dateLabel = dayjs().format('dddd, MMMM D')
const greeting = getGreeting(dayjs().hour())

async function load() {
  const [empty, authorData, bookData, collectionData, goalData] =
    await Promise.all([
      isLibraryEmpty(),
      getAuthors(),
      getBooks(),
      getCollections(),
      getGoals(),
    ])
  isEmpty.value = empty
  authors.value = authorData
  books.value = bookData
  collections.value = collectionData
  goals.value = goalData
  loaded.value = true
}

onMounted(() => {
  dismissed.value = activeDismissals(dismissed.value, Date.now())
  load()
})

const suggestions = computed(() =>
  buildSuggestions({
    books: books.value,
    authors: authors.value,
    goals: goals.value,
    today,
  }).filter(({ id }) => !(id in dismissed.value)),
)

const reading = computed(() =>
  books.value
    .filter(({ progress }) => progress.status === 'reading')
    .sort((a, b) => getBookPercentage(b) - getBookPercentage(a)),
)

const latest = computed(() =>
  [...books.value]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6),
)

const activeGoals = computed(() =>
  goals.value
    .map((goal) => resolveGoal(goal, books.value))
    .filter((goal) => getGoalStatus(goal) === 'tracking')
    .sort((a, b) =>
      toSimpleDate(a.finishAt).localeCompare(toSimpleDate(b.finishAt)),
    ),
)

function dismiss(id: string) {
  dismissed.value = { ...dismissed.value, [id]: snoozeUntil(Date.now()) }
}

let toastTimer: ReturnType<typeof setTimeout> | undefined

function showToast(message: string) {
  toast.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = null), TOAST_MS)
}

onBeforeUnmount(() => clearTimeout(toastTimer))

async function onAct(item: Suggestion) {
  const { action } = item

  if (action.type === 'open') {
    await navigateTo(`/library/books/${action.bookId}`)
    return
  }

  busy.value = item.id
  try {
    if (action.type === 'start') {
      await updateBook(action.bookId, {
        progress: {
          ...item.book.progress,
          status: 'reading',
          startedAt: now(),
          finishedAt: null,
        },
      })
      dismiss(item.id)
      showToast(`Started ${item.book.title}`)
    } else {
      const goal = goals.value.find(({ id }) => id === action.goalId)
      const finishedAt = item.book.progress.finishedAt
      if (!goal || goal.type !== 'books' || !finishedAt) return
      await createGoal(
        stripAutoEntries({
          ...goal,
          entries: [
            ...goal.entries,
            {
              id: uuidv4(),
              book: action.bookId,
              createdAt: toSimpleDate(finishedAt),
            },
          ],
        }),
      )
      showToast(`Logged ${item.book.title}`)
    }
    await load()
  } finally {
    busy.value = null
  }
}

useHead({
  title: 'BookLib | Home',
})
</script>

<style scoped>
@reference '../assets/css/main.css';

.home {
  @apply mx-auto flex w-full max-w-[90rem] flex-col gap-5;
  container-type: inline-size;
}
.home :deep(:is(button, a):focus-visible) {
  @apply outline-primary! outline-offset-2!;
  outline-style: solid !important;
  outline-width: 2px !important;
}
.top {
  @apply grid grid-cols-[minmax(0,1fr)] gap-4;
}
.main {
  @apply grid grid-cols-[minmax(0,1fr)] gap-4;
}
@container (min-width: 900px) {
  .top {
    @apply grid-cols-[minmax(0,1fr)_17rem];
  }
  .main {
    @apply grid-cols-12;
  }
  .main > * {
    grid-column: 1 / -1;
  }
  .main > .span-7 {
    grid-column: span 7;
  }
  .main > .span-5 {
    grid-column: span 5;
  }
}
.toast {
  @apply bg-ink-primary text-ink-inverse fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-[0_8px_24px_rgba(0,0,0,0.2)];
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

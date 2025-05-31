<template>
  <transition name="fade" mode="out-in">
    <bl-tile v-if="selectedOption" :key="index" class="flex-1">
      <template #title>{{ selectedOption.title }}</template>
      <div
        v-if="loading || success || rating"
        class="flex size-full flex-col items-center justify-center gap-3"
      >
        <template v-if="loading">
          <bl-loading class="!size-12" />
          <p>Loading...</p>
        </template>
        <template v-if="success">
          <IconCircleCheck size="48px" class="text-main" />
          <p>Success!</p>
        </template>
        <template v-if="rating">
          <bl-rating editing :rating="0" :on-commit="onRateBook" />
          <p>Rate {{ selectedOption.book.title }}</p>
        </template>
      </div>
      <template v-if="!loading && !success && !rating">
        <NuxtLink
          :to="`/library/books/${selectedOption.book.id}`"
          class="w-full"
        >
          <bl-book-image :book="selectedOption.book" img-size-class="!w-full" />
        </NuxtLink>
        <div>
          <h6>{{ selectedOption.book.title }}</h6>
          <p v-if="selectedOption.book.authorName">
            {{ selectedOption.book.authorName }}
          </p>
        </div>
        <bl-button expand @click="onClick">
          {{ selectedOption.buttonLabel }}
          <template #appendIcon="iconProps">
            <component :is="selectedOption.icon" v-bind="iconProps" />
          </template>
        </bl-button>
      </template>
    </bl-tile>
  </transition>
</template>

<script setup lang="ts">
import { icons, IconCircleCheck } from '@tabler/icons-vue'
import { indexBy } from 'ramda'
import type { Author } from '~/types/author'
import type { Book, ViewBook } from '~/types/book'

const props = defineProps<{
  authors: Author[]
  books: Book[]
  reloadBooks: () => Promise<void>
}>()

const authorsById = computed(() =>
  props.authors ? indexBy(({ id }) => String(id), props.authors) : {},
)

const viewBooks = ref<ViewBook[]>(getBooksWithAuthorNames(props.books))

const loading = ref<boolean>(false)
const success = ref<boolean>(false)
const rating = ref<boolean>(false)

const options = computed(() => {
  const _books = viewBooks.value ?? []

  const unreadBooks = _books.filter(
    ({ progressStatus }) =>
      progressStatus === 'owned' || progressStatus === 'not-read',
  )
  const unreadBook = unreadBooks[getRandomIndex(unreadBooks)]

  const readingBooks = _books.filter(
    ({ progressStatus }) => progressStatus === 'reading',
  )
  const readingBook = readingBooks[getRandomIndex(readingBooks)]

  const finishedBooksWithNoRating = _books.filter(
    ({ progressStatus, rating }) =>
      progressStatus === 'read' && rating === null,
  )
  const finishedBookWithNoRating =
    finishedBooksWithNoRating[getRandomIndex(finishedBooksWithNoRating)]

  const pausedBooks = _books.filter(
    ({ progressStatus }) => progressStatus === 'paused',
  )
  const pausedBook = pausedBooks[getRandomIndex(pausedBooks)]

  return [
    {
      id: 'startNewBook',
      title: 'How about starting a new book?',
      icon: icons[PROGRESS_STATUS_MAP.read.icon],
      buttonLabel: 'Start reading',
      book: unreadBook,
    },
    {
      id: 'finishCurrentBook',
      title: `Are you still reading ${readingBook?.title}?`,
      icon: icons[PROGRESS_STATUS_MAP.reading.icon],
      buttonLabel: 'Mark as finished',
      book: readingBook,
    },
    {
      id: 'rateFinishedBook',
      title: `What did you think of ${finishedBookWithNoRating?.title}?`,
      icon: icons['IconStar'],
      buttonLabel: 'Rate book',
      book: finishedBookWithNoRating,
    },
    {
      id: 'resumePausedBook',
      title: `Want to ${pausedBook?.title} another try?`,
      icon: icons[PROGRESS_STATUS_MAP.paused.icon],
      buttonLabel: 'Resume reading',
      book: pausedBook,
    },
  ].filter((option) => option.book !== undefined)
})

const { index, start, stop } = useAutoIncrementIndex(options.value.length, 8)

watch(index, () => {
  if (success.value) {
    success.value = false
  }
})

const selectedOption = computed(() => options.value[index.value])

// TODO: return author name with book from server
function getBooksWithAuthorNames(_books: Book[] | null): ViewBook[] {
  return (_books ?? []).map((book) => ({
    ...book,
    authorName: book.author
      ? authorsById.value[String(book.author)]?.name
      : undefined,
  }))
}

async function onClick() {
  stop()
  switch (selectedOption.value.id) {
    case 'startNewBook':
      await onUpdateBook({
        ...selectedOption.value.book,
        progressStatus: 'reading',
      })
      break
    case 'finishCurrentBook':
      await onUpdateBook({
        ...selectedOption.value.book,
        progressStatus: 'read',
      })
      break
    case 'rateFinishedBook':
      rating.value = true
      break
    case 'resumePausedBook':
      await onUpdateBook({
        ...selectedOption.value.book,
        progressStatus: 'reading',
      })
      break
    default:
      return
  }
  start()
}

async function onUpdateBook(bookValues: Book) {
  loading.value = true
  try {
    const updatedBook = await $fetch<Book>('/api/books', {
      method: 'post',
      body: bookValues,
    })

    await props.reloadBooks()
    success.value = true

    return updatedBook
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

async function onRateBook(ratingValue: number) {
  stop()
  await onUpdateBook({
    ...selectedOption.value.book,
    rating: ratingValue > 0 ? ratingValue : null,
  })
  rating.value = false
  start()
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  @apply transition-opacity duration-300;
}
.fade-enter-from,
.fade-leave-to {
  @apply opacity-0;
}
</style>

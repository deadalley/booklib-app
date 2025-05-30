<template>
  <transition name="fade" mode="out-in">
    <bl-tile :key="index" class="flex-1">
      <template #title>{{ selectedOption.title }}</template>
      <NuxtLink :to="`/library/books/${selectedOption.book.id}`">
        <bl-book-image
          :book="selectedOption.book"
          img-size-class="!h-[300px]"
        />
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
    </bl-tile>
  </transition>
</template>

<script setup lang="ts">
import { icons } from '@tabler/icons-vue'
import { indexBy } from 'ramda'
import type { Author } from '~/types/author'
import type { Book, ViewBook } from '~/types/book'

const props = defineProps<{
  authors: Author[]
  books: Book[]
}>()

const authorsById = computed(() =>
  props.authors ? indexBy(({ id }) => String(id), props.authors) : {},
)

const viewBooks = ref<ViewBook[]>(getBooksWithAuthorNames(props.books))

const options = computed(() => {
  const _books = viewBooks.value ?? []

  const unreadBooks = _books.filter(
    ({ progressStatus }) => progressStatus === 'owned',
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
      title: `What did you think of ${finishedBookWithNoRating.title}?`,
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

const index = useAutoIncrementIndex(options.value.length, 8)

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

function onClick() {
  switch (selectedOption.value.id) {
    case 'startNewBook':
    case 'finishCurrentBook':
    case 'rateFinishedBook':
    case 'resumePausedBook':
    default:
      return
  }
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

<template>
  <bl-bar-chart
    :height="height"
    :items="series"
    :unit="bookProperty === 'averageRatingAuthor' ? '★' : 'books'"
  />
</template>

<script setup lang="ts">
import type { Book, BookFormat } from '~/types/book'
import type { Author } from '~/types/author'
import type { Collection } from '~/types/collection'
import languageOptions from '~/public/languages-2.json'

export type BooksBarChartProperty =
  | keyof Pick<
      Book,
      | 'author'
      | 'collections'
      | 'language'
      | 'originalLanguage'
      | 'publisher'
      | 'genres'
      | 'bookFormat'
    >
  | 'averageRatingAuthor'

const props = withDefaults(
  defineProps<{
    authors: Author[]
    collections: Collection[]
    books: Book[]
    bookProperty: BooksBarChartProperty
    height?: number
  }>(),
  { height: 340 },
)

const series = computed(() => {
  if (props.bookProperty === 'author') {
    const booksByAuthor = getBooksByAuthor(
      props.books,
      props.authors.concat().sort((b1, b2) => {
        return b1.name.localeCompare(b2.name)
      }),
    )

    return Object.entries(booksByAuthor)
      .map(([authorId, books]) => {
        const author = props.authors.find((a) => a.id === authorId)

        return {
          label: author?.name ?? '',
          value: books.length,
        }
      })
      .sort(({ value: aValue }, { value: bValue }) => bValue - aValue)
  }

  if (props.bookProperty === 'collections') {
    const booksByCollection = getBooksByCollection(
      props.books,
      sortCollections(props.collections),
      props.authors,
    )

    return Object.entries(booksByCollection)
      .map(([collectionId, books]) => {
        const collection = props.collections.find((c) => c.id === collectionId)

        return {
          label: collection?.name ?? '',
          value: books.length,
        }
      })
      .sort(({ value: aValue }, { value: bValue }) => bValue - aValue)
  }

  if (
    props.bookProperty === 'language' ||
    props.bookProperty === 'originalLanguage'
  ) {
    const booksByLanguage = getBooksByLanguage(props.books, props.bookProperty)

    return Object.entries(booksByLanguage)
      .map(([language, books]) => ({
        label:
          languageOptions[language as keyof typeof languageOptions] ?? language,
        value: books.length,
      }))
      .sort(({ value: aValue }, { value: bValue }) => bValue - aValue)
  }

  if (props.bookProperty === 'averageRatingAuthor') {
    return sortAuthorsByBookRatings(props.books, props.authors).map(
      ({ author, average }) => ({
        label: author.name,
        value: average,
      }),
    )
  }

  if (props.bookProperty === 'publisher') {
    const booksByPublisher = getBooksByPublisher(props.books)

    return Object.entries(booksByPublisher)
      .map(([publisher, books]) => ({
        label: publisher,
        value: books.length,
      }))
      .sort(({ value: aValue }, { value: bValue }) => bValue - aValue)
  }

  if (props.bookProperty === 'genres') {
    const booksByGenre = getBooksByGenre(props.books)

    return Object.entries(booksByGenre)
      .map(([genre, books]) => ({
        label: genre,
        value: books.length,
      }))
      .sort(({ value: aValue }, { value: bValue }) => bValue - aValue)
  }

  if (props.bookProperty === 'bookFormat') {
    const booksByFormat = getBooksByFormat(props.books)

    return Object.entries(booksByFormat)
      .map(([format, books]) => ({
        label: BOOK_FORMAT_MAP[format as BookFormat].description,
        value: books.length,
      }))
      .sort(({ value: aValue }, { value: bValue }) => bValue - aValue)
  }
  return []
})
</script>

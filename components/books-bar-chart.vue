<template>
  <bl-bar-chart
    :height="height"
    :items="series"
    :unit="bookProperty === 'averageRatingAuthor' ? '★' : 'books'"
  />
</template>

<script
  setup
  lang="ts"
  generic="
    T extends
      | keyof Pick<
          Book,
          | 'pages'
          | 'rating'
          | 'year'
          | 'author'
          | 'collections'
          | 'language'
          | 'originalLanguage'
        >
      | 'averageRatingAuthor'
  "
>
import type { Book } from '~/types/book'
import type { BarChartItem } from './bar-chart.client.vue'
import type { Author } from '~/types/author'
import type { Collection } from '~/types/collection'
import languageOptions from '~/public/languages-2.json'

const props = withDefaults(
  defineProps<{
    authors: Author[]
    collections: Collection[]
    books: Book[]
    bookProperty: T
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

  return sortBooksBy(props.books, props.bookProperty, 'desc')
    .map((book) => ({
      label: book.title,
      value: book[props.bookProperty as keyof Book],
    }))
    .filter((item): item is BarChartItem => item.value !== null)
})
</script>

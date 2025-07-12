<template>
  <NuxtLayout name="dashboard" title="Statistics">
    <h3 class="mb-3">Overview</h3>
    <div class="grid grid-cols-12 gap-4">
      <bl-kpi-tile class="col-span-6 lg:col-span-3">
        <template #icon="iconProps">
          <IconBooks v-bind="iconProps" />
        </template>
        <template #value>{{ totalReadBooks }}</template>
        <template #unit>books read</template>
      </bl-kpi-tile>
      <bl-kpi-tile class="col-span-6 lg:col-span-3">
        <template #icon="iconProps">
          <IconBook v-bind="iconProps" />
        </template>
        <template #value>{{ totalReadPages }}</template>
        <template #unit>pages read</template>
      </bl-kpi-tile>
      <bl-kpi-tile class="col-span-6 lg:col-span-3">
        <template #icon="iconProps">
          <IconFeather v-bind="iconProps" />
        </template>
        <template #value>{{ totalReadAuthors }}</template>
        <template #unit>authors read</template>
      </bl-kpi-tile>
      <bl-kpi-tile class="col-span-6 lg:col-span-3">
        <template #icon="iconProps">
          <IconHeartFilled v-bind="iconProps" />
        </template>
        <template #value>{{ totalFavoriteBooks }}</template>
        <template #unit>favorite books</template>
      </bl-kpi-tile>
      <bl-tile class="col-span-12 lg:col-span-6">
        <template #title>{{
          pieChartPropertyOptions.find(
            ({ value }) => value === pieChartProperty,
          )?.label
        }}</template>
        <template #actions>
          <div>
            <bl-raw-select
              v-model="pieChartProperty"
              align="end"
              :options="pieChartPropertyOptions"
              class="w-full sm:ml-4"
            />
          </div>
        </template>
        <bl-books-pie-chart
          v-if="books"
          :books="books"
          :book-property="pieChartProperty"
          :unit="
            pieChartPropertyOptions.find(
              ({ value }) => value === pieChartProperty,
            )?.unit
          "
        />
      </bl-tile>
      <bl-tile
        class="col-span-12 lg:col-span-6"
        align-header-vertical-on-small-screens
      >
        <template #title>{{ getRankedTitle() }}</template>
        <template #actions>
          <div
            class="flex w-full justify-end gap-1 sm:w-[unset] [&_div:last-child_.form-inner]:!w-28"
          >
            <bl-raw-select
              v-model="rankingChartProperty"
              align="end"
              :options="rankingChartPropertyOptions"
              class="!min-w-0 sm:min-w-[unset]"
            />
            <bl-raw-select
              v-model="rankingChartPropertyOrder"
              align="end"
              :options="rankingChartPropertyOrderOptions"
              class="!min-w-0 sm:min-w-[unset]"
            />
            <bl-input
              id="rankingChartQuantity"
              v-model="rankingChartQuantity"
              editing
              type="number"
              :min="1"
              :max="15"
            />
          </div>
        </template>
        <bl-ranking
          :items="rankedBooks"
          :label-position="+rankingChartQuantity < 8 ? 'bottom' : 'right'"
          :unit="getRankingUnit"
        />
      </bl-tile>
      <bl-tile class="col-span-12">
        <template #title>Books</template>
        <template #actions>
          <div>
            <bl-raw-select
              v-model="barChartProperty"
              align="end"
              :options="barChartPropertyOptions"
              class="w-full sm:ml-4"
            />
          </div>
        </template>
        <bl-books-bar-chart
          v-if="books && barChartProperty"
          :authors="authors ?? []"
          :collections="collections ?? []"
          :books="books"
          :book-property="barChartProperty"
        />
      </bl-tile>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  IconBook,
  IconBooks,
  IconFeather,
  IconHeartFilled,
} from '@tabler/icons-vue'
import { sum, uniq } from 'ramda'
import type { BooksBarChartProperty } from '~/components/books-bar-chart.vue'
import type { RankingItem } from '~/components/ranking.client.vue'
import type { SelectOption } from '~/components/raw-select.vue'
import type { Author } from '~/types/author'
import type { Book } from '~/types/book'
import type { Collection } from '~/types/collection'

const { data: authors } = await useFetch<Author[]>('/api/authors')
const { data: books } = await useFetch<Book[]>('/api/books')
const { data: collections } = await useFetch<Collection[]>('/api/collections')

const totalReadBooks = computed(() => {
  const totalBooks =
    books.value?.filter((book) => book.progressStatus === 'read').length ?? 0

  return totalBooks.toLocaleString('en-US', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })
})

const totalReadPages = computed(() => {
  const totalPages = sum(books.value?.map((book) => book.pages ?? 0) ?? [])

  return totalPages.toLocaleString('en-US', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })
})

const totalReadAuthors = computed(() => {
  const totalAuthors = uniq(
    books.value
      ?.filter((book) => !!book.author && book.progressStatus === 'read')
      .map((book) => book.author) ?? [],
  ).length

  return totalAuthors.toLocaleString('en-US', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })
})

const totalFavoriteBooks = computed(() => {
  const totalFavoriteBooks =
    books.value?.filter((book) =>
      book.collections.includes(FAVORITE_COLLECTION_ID),
    ).length ?? 0

  return totalFavoriteBooks.toLocaleString('en-US', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })
})

const pieChartPropertyOptions: (SelectOption & { unit?: string })[] = [
  { label: 'Rating', value: 'rating', unit: '★' },
  { label: 'Progress status', value: 'progressStatus' },
]
const pieChartProperty =
  ref<keyof Pick<Book, 'rating' | 'progressStatus'>>('rating')

const rankingChartPropertyOptions: (SelectOption & {
  value: 'rating' | 'year' | 'pages'
})[] = [
  { label: 'Rating', value: 'rating' },
  { label: 'Year', value: 'year' },
  { label: 'Pages', value: 'pages' },
]
const rankingChartProperty = ref<'rating' | 'year' | 'pages'>('rating')

const rankingChartPropertyOrderOptions: SelectOption[] = [
  { label: 'Top', value: 'top' },
  { label: 'Lowest', value: 'low' },
]
const rankingChartPropertyOrder = ref<'top' | 'low'>('top')

const rankingChartQuantity = ref<string>('5')

const rankedBooks = ref<RankingItem[]>(getRankedBooks())

watch(
  [
    books,
    rankingChartProperty,
    rankingChartPropertyOrder,
    rankingChartQuantity,
  ],
  () => {
    rankedBooks.value = getRankedBooks()
  },
)

const barChartPropertyOptions: SelectOption[] = [
  { label: 'Author', value: 'author' },
  { label: 'Collection', value: 'collections' },
  { label: 'Language', value: 'language' },
  { label: 'Original language', value: 'originalLanguage' },
  { label: 'Publisher', value: 'publisher' },
  { label: 'Genre', value: 'genres' },
  { label: 'Format', value: 'format' },
  { label: 'Average author rating', value: 'averageRatingAuthor' },
]
const barChartProperty = ref<BooksBarChartProperty>('author')

function getRankedBooks() {
  return sortBooksBy(
    books.value ?? [],
    rankingChartProperty.value,
    rankingChartPropertyOrder.value === 'top' ? 'desc' : 'asc',
  )
    .filter((book) => book[rankingChartProperty.value] != null)
    .map((book) => ({
      label: book.title,
      value: book[rankingChartProperty.value] ?? 0,
    }))
    .slice(0, +rankingChartQuantity.value)
}

function getRankedTitle() {
  switch (rankingChartProperty.value) {
    case 'rating':
      return rankingChartPropertyOrder.value === 'low'
        ? 'Lowest rated books'
        : 'Top rated books'
    case 'year':
      return rankingChartPropertyOrder.value === 'low'
        ? 'Oldest books'
        : 'Newest books'
    case 'pages':
      return rankingChartPropertyOrder.value === 'low'
        ? 'Shortest books'
        : 'Longest books'
    default:
      return ''
  }
}

function getRankingUnit(value: number) {
  if (rankingChartProperty.value === 'rating') {
    return getRatingUnit(value)
  }

  if (rankingChartProperty.value === 'pages') {
    return ' pages'
  }

  return ''
}

useHead({
  title: 'BookLib | Statistics',
})
</script>

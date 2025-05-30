<template>
  <NuxtLayout name="dashboard" title="Statistics">
    <h3 class="mb-3">Overview</h3>
    <div class="grid grid-cols-12 gap-4">
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
              :options="pieChartPropertyOptions"
              class="ml-4"
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
      <bl-tile class="col-span-12 lg:col-span-6">
        <template #title>{{ getRankedTitle() }}</template>
        <template #actions>
          <div class="flex justify-end gap-1">
            <bl-raw-select
              v-model="rankingChartProperty"
              :options="rankingChartPropertyOptions"
              class="ml-4 !w-32"
            />
            <bl-raw-select
              v-model="rankingChartPropertyOrder"
              :options="rankingChartPropertyOrderOptions"
              class="!w-32"
            />
            <bl-input
              id="isbn"
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
          :with-label="+rankingChartQuantity < 8"
          :unit="rankingChartProperty === 'rating' ? getRatingUnit : undefined"
        />
      </bl-tile>
      <bl-tile class="col-span-12">
        <template #title>Books</template>
        <template #actions>
          <div>
            <bl-raw-select
              v-model="barChartProperty"
              :options="barChartPropertyOptions"
              class="ml-4"
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
import type { RankingItem } from '~/components/ranking.client.vue'
import type { SelectOption } from '~/components/raw-select.vue'
import type { Author } from '~/types/author'
import type { Book } from '~/types/book'
import type { Collection } from '~/types/collection'

const { data: authors } = await useFetch<Author[]>('/api/authors')
const { data: books } = await useFetch<Book[]>('/api/books')
const { data: collections } = await useFetch<Collection[]>('/api/collections')

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
]
const barChartProperty =
  ref<
    keyof Pick<Book, 'author' | 'collections' | 'language' | 'originalLanguage'>
  >('author')

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

useHead({
  title: 'BookLib | Statistics',
})
</script>

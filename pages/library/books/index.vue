<template>
  <div
    class="relative flex size-full flex-col gap-8 overflow-hidden"
    v-bind="$attrs"
  >
    <div class="flex flex-col justify-between gap-5 lg:flex-row">
      <div class="flex items-baseline gap-3 lg:flex-col xl:flex-row">
        <NuxtLink to="/library/books">
          <h3>All Books</h3>
        </NuxtLink>
        <h6 class="flex gap-3 text-accent-dark">
          <span> TOTAL {{ books?.length }} </span>
          <span v-if="!!filterCount">—</span>
          <span v-if="!!filterCount"> SHOWING {{ sortedBooks.length }} </span>
        </h6>
      </div>
      <div
        class="flex flex-1 flex-col justify-end gap-3 transition-all ease-in-out lg:flex-row"
        :class="{ 'md:mr-[355px]': !!sidebarContent }"
      >
        <NuxtLink class="flex md:inline-flex" to="/library/books/new">
          <bl-button expand>
            <template #prependIcon="prependIcon">
              <IconPlus v-bind="prependIcon" />
            </template>
            Book
          </bl-button>
        </NuxtLink>
        <bl-search-bar @input="onSearch"></bl-search-bar>

        <div class="flex gap-3">
          <bl-button expand variant="secondary" @click="onFilterOpen">
            Filter {{ filterCount ? `(${filterCount})` : '' }}
          </bl-button>
          <bl-switch v-slot="props" v-model="view">
            <bl-switch-option value="cards" v-bind="props">
              <template #icon="iconProps">
                <IconLayoutDashboard v-bind="iconProps" />
              </template>
            </bl-switch-option>
            <bl-switch-option value="table" v-bind="props">
              <template #icon="iconProps">
                <IconTable v-bind="iconProps" />
              </template>
            </bl-switch-option>
          </bl-switch>
        </div>
      </div>
    </div>
    <div
      v-if="view === 'cards'"
      class="grid h-min w-full grid-cols-1 gap-x-6 gap-y-8 overflow-auto md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-12"
    >
      <bl-book-card v-for="book in sortedBooks" :key="book.title" :book="book">
      </bl-book-card>
    </div>
    <div v-if="view === 'table'" class="overflow-x-auto">
      <bl-books-table
        :books="sortedBooks"
        :selected-table-columns="selectedTableColumns"
      ></bl-books-table>
    </div>
  </div>
  <bl-sidebar
    :title="sidebarContent"
    :is-open="!!sidebarContent"
    :on-close="onCloseSidebar"
  >
    <bl-book-filter
      v-model:selectedPublishers="selectedPublishers"
      v-model:selectedLanguages="selectedLanguages"
      v-model:selectedOriginalLanguages="selectedOriginalLanguages"
      v-model:selectedYearRange="selectedYearRange"
      v-model:selectedPageRange="selectedPageRange"
      v-model:selected-table-columns="selectedTableColumns"
      :publishers="publishers"
      :languages="languages"
      :original-languages="originalLanguages"
      :min-max-year-range="[minYear, maxYear]"
      :min-max-page-range="[minPages, maxPages]"
      :books="books"
      :on-reset="onResetFilter"
    ></bl-book-filter>
  </bl-sidebar>
</template>

<script setup lang="ts">
import type { Book } from '~/types/book'
import { IconPlus, IconLayoutDashboard, IconTable } from '@tabler/icons-vue'

const router = useRouter()
const route = useRoute()

const { data: books } = await useFetch<Book[]>('/api/books')

const sidebarContent = ref()
const textSearch = ref()
const view = ref(route.query.view ?? 'cards')

watch(view, (v) => {
  router.push({ query: { view: v } })
})

watch(
  () => route.query.view,
  (v) => {
    view.value = (v as string) ?? 'cards'
  },
)

const defaultTableColumns = {
  coverSrc: { label: 'Cover', checked: true },
  publisher: { label: 'Publisher', checked: true },
  language: { label: 'Language', checked: true },
  year: { label: 'Year', checked: true },
  pages: { label: 'Pages', checked: true },
  rating: { label: 'Rating', checked: true },
  originalTitle: { label: 'Original Title', checked: true },
  originalLanguage: { label: 'Original Language', checked: true },
  isbn: { label: 'ISBN', checked: true },
}

const pages = computed(() => getUniqueElements(books.value ?? [], 'pages'))
const years = computed(() => getUniqueElements(books.value ?? [], 'year'))
const publishers = computed(() =>
  getUniqueElements(books.value ?? [], 'publisher'),
)
const languages = computed(() =>
  getUniqueElements(books.value ?? [], 'language'),
)
const originalLanguages = computed(() =>
  getUniqueElements(books.value ?? [], 'originalLanguage'),
)

const minPages = computed(() => Math.max(Math.min(...pages.value) - 100, 0))
const maxPages = computed(() => Math.max(...pages.value))

const minYear = computed(() => Math.min(...years.value))
const maxYear = computed(() => new Date().getFullYear())

const selectedPublishers = ref<string[]>([])
const selectedLanguages = ref<string[]>([])
const selectedOriginalLanguages = ref<string[]>([])
const selectedYearRange = ref<[number, number]>([minYear.value, maxYear.value])
const selectedPageRange = ref<[number, number]>([
  minPages.value,
  maxPages.value,
])
const selectedTableColumns = ref<{
  [key in keyof Book]?: { label: string; checked: boolean }
}>(defaultTableColumns)

const filterCount = computed(() => {
  let count = 0

  if (selectedPublishers.value.length) {
    count++
  }
  if (selectedLanguages.value.length) {
    count++
  }
  if (selectedOriginalLanguages.value.length) {
    count++
  }
  if (
    selectedYearRange.value[0] !== minYear.value ||
    selectedYearRange.value[1] !== maxYear.value
  ) {
    count++
  }
  if (
    selectedPageRange.value[0] !== minPages.value ||
    selectedPageRange.value[1] !== maxPages.value
  ) {
    count++
  }

  return count
})

const sortedBooks = computed(() => {
  const hasFilter =
    selectedPublishers.value.length ||
    selectedLanguages.value.length ||
    selectedOriginalLanguages.value.length

  let combinedFilters: Book[] = books.value ?? []

  if (hasFilter) {
    const filterByPublisher = filterElementsBySelectedArray(
      'publisher',
      books.value ?? [],
      selectedPublishers.value,
    )

    const filterByLanguage = filterElementsBySelectedArray(
      'language',
      books.value ?? [],
      selectedLanguages.value,
    )

    const filterByOriginalLanguage = filterElementsBySelectedArray(
      'originalLanguage',
      books.value ?? [],
      selectedOriginalLanguages.value,
    )

    combinedFilters = mergeAndFilter(
      'id',
      filterByPublisher,
      filterByLanguage,
      filterByOriginalLanguage,
    )
  }

  const filterByTextSearch = filterElementsBySearchParam(
    combinedFilters,
    textSearch.value,
    ['title'],
  )

  const filterByYear = filterElementsByRange(
    'year',
    filterByTextSearch,
    selectedYearRange.value,
  )

  const filterByPages = filterElementsByRange(
    'pages',
    filterByYear,
    selectedPageRange.value,
  )

  const sorted = filterByPages?.sort((b1, b2) =>
    b1.title.localeCompare(b2.title),
  )

  return sorted
})

function onSearch($event: Event) {
  textSearch.value = ($event.target as any)?.value as string
}

function onFilterOpen() {
  sidebarContent.value = 'Filter'
}

function onCloseSidebar() {
  sidebarContent.value = undefined
}

function onResetFilter() {
  selectedPublishers.value = []
  selectedLanguages.value = []
  selectedOriginalLanguages.value = []

  selectedYearRange.value = [minYear.value, maxYear.value]
  selectedPageRange.value = [minPages.value, maxPages.value]

  selectedTableColumns.value = defaultTableColumns
}

definePageMeta({
  middleware: 'auth',
})
</script>

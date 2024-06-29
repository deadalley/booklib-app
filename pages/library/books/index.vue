<template>
  <NuxtLayout
    name="library"
    title="All Books"
    :total="books?.length ?? 0"
    :sidebar-content="sidebarContent"
  >
    <template #navbar>
      <NuxtLink class="flex md:inline-flex" to="/library/books/new">
        <bl-button expand>
          <template #prependIcon="prependIcon">
            <IconPlus v-bind="prependIcon" />
          </template>
          Book
        </bl-button>
      </NuxtLink>
      <bl-search-bar @input="onSearch" />

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
    </template>
    <div
      v-if="view === 'cards'"
      class="grid h-min w-full grid-cols-1 gap-x-6 gap-y-8 overflow-auto md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-12"
    >
      <bl-book-card
        v-for="book in sortedBooks"
        :key="book.title"
        :book="book"
      />
    </div>
    <div v-if="view === 'table'" class="overflow-x-auto">
      <bl-books-table
        :books="sortedBooks"
        :selected-table-columns="selectedTableColumns"
      />
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
        v-model:selectedTableColumns="selectedTableColumns"
        v-model:selectedGenres="selectedGenres"
        :publishers="publishers"
        :languages="languages"
        :original-languages="originalLanguages"
        :genres="genres"
        :min-max-year-range="[minYear, maxYear]"
        :min-max-page-range="[minPages, maxPages]"
        :books="books"
        :on-reset="onResetFilter"
      />
    </bl-sidebar>
  </NuxtLayout>
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
const genres = computed(() => getUniqueElements(books.value ?? [], 'genres'))

const minPages = computed(() => Math.max(Math.min(...pages.value) - 100, 0))
const maxPages = computed(() => Math.max(...pages.value))

const minYear = computed(() => Math.min(...years.value))
const maxYear = computed(() => new Date().getFullYear())

const selectedPublishers = ref<string[]>([])
const selectedLanguages = ref<string[]>([])
const selectedOriginalLanguages = ref<string[]>([])
const selectedGenres = ref<string[]>([])
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
  if (selectedGenres.value.length) {
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
    selectedOriginalLanguages.value.length ||
    selectedGenres.value.length

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

    const filterByGenres = filterElementsBySelectedArray(
      'genres',
      books.value ?? [],
      [selectedGenres.value],
    )

    combinedFilters = mergeAndFilter(
      'id',
      filterByPublisher,
      filterByLanguage,
      filterByOriginalLanguage,
      filterByGenres,
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
  textSearch.value = ($event.target as HTMLInputElement)?.value
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

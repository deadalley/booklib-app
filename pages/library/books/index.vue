<template>
  <div
    class="relative flex w-full flex-col gap-8 overflow-hidden"
    v-bind="$attrs"
  >
    <div class="flex flex-col justify-between lg:flex-row">
      <div class="flex items-baseline gap-3 lg:flex-col xl:flex-row">
        <NuxtLink to="/library/books">
          <h3>All Books</h3>
        </NuxtLink>
        <h6 class="text-accent-dark">TOTAL {{ books?.length }}</h6>
      </div>
      <div class="flex flex-col gap-3 lg:flex-row">
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
            Filter
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
      class="grid w-full grid-cols-1 gap-x-3 gap-y-5 overflow-auto md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-12"
    >
      <bl-book-card v-for="book in sortedBooks" :key="book.title" :book="book">
      </bl-book-card>
    </div>
    <div class="overflow-x-auto">
      <bl-books-table v-if="view === 'table'" :books="books"></bl-books-table>
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
      :books="books"
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
const selectedPublishers = ref<string[]>([])
const selectedLanguages = ref<string[]>([])
const selectedOriginalLanguages = ref<string[]>([])
const selectedYearRange = ref<[number, number]>([0, 9999])
const selectedPageRange = ref<[number, number]>([0, 9999])

watch(view, (v) => {
  router.push({ query: { view: v } })
})

watch(
  () => route.query.view,
  (v) => {
    view.value = (v as string) ?? 'cards'
  },
)

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

  console.log(selectedPageRange.value)

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

useHead({
  title: 'BookLib | My Library',
})

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
})
</script>

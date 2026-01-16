<template>
  <bl-tile class="flex-1">
    <template #title>Your current reading goal</template>
    <template v-if="goal">
      <div class="pt-8">
        <bl-goal-tile-title :goal="goal" />
      </div>
      <div class="pt-8">
        <bl-goal-progress-bar :goal="goal" />
      </div>
      <bl-goal-progress-line-chart
        :goal="goal"
        :books="viewBooks"
        :sorted-entries="sortedEntries"
        :reload-goals="loadData"
      />
    </template>
    <template v-else>
      <div class="h-full">
        <bl-empty icon="IconNotebook">
          <template #label>No goals found</template>
          <template #action>
            <NuxtLink to="/tracking">
              <bl-button>Create a new goal</bl-button>
            </NuxtLink>
          </template>
        </bl-empty>
      </div>
    </template>
  </bl-tile>
</template>

<script setup lang="ts">
import { indexBy } from 'ramda'
import type { Author } from '~/types/author'
import type { Book, ViewBook } from '~/types/book'
import type { Goal } from '~/types/goal'
import { sortGoals } from '~/utils/sorting'

const { getAuthors, getBooks, getGoals } = useBookLibrary()

const authors = ref<Author[]>([])
const books = ref<Book[]>([])
const goals = ref<Goal[]>([])

const loadData = async () => {
  authors.value = await getAuthors()
  books.value = await getBooks()
  goals.value = await getGoals()
}

onMounted(loadData)

const viewBooks = ref<ViewBook[]>(getBooksWithAuthorNames(books.value))

const goal = computed(() => sortGoals(goals.value ?? [])[0])

const authorsById = computed(() =>
  authors.value ? indexBy(({ id }) => String(id), authors.value) : {},
)

const sortedEntries = computed(() => {
  return (goal.value?.entries ?? []).concat().sort((a, b) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })
})

watch(books, (newBooks) => {
  viewBooks.value = getBooksWithAuthorNames(newBooks)
})

// TODO: return author name with book from server
function getBooksWithAuthorNames(_books: Book[] | null): ViewBook[] {
  return (_books ?? []).map((book) => ({
    ...book,
    authorName: book.author
      ? authorsById.value[String(book.author)]?.name
      : undefined,
  }))
}
</script>

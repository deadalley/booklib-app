<template>
  <NuxtLayout name="dashboard" title="Tracking">
    <div class="mb-3 flex justify-between">
      <h3>Goals</h3>
      <bl-goal-modal
        v-if="authors && books"
        v-model="selectedGoal"
        is-new
        :authors="authors"
        :books="books"
        :reload-goals="refresh"
      >
        <template #trigger="triggerProps">
          <bl-button v-bind="triggerProps">
            <template #prependIcon="iconProps">
              <IconPlus v-bind="iconProps" />
            </template>
            Goal
          </bl-button>
        </template>
      </bl-goal-modal>
    </div>
    <div class="grid grid-cols-12 gap-4">
      <bl-tile
        v-if="!goals?.length"
        class="col-span-12 items-center justify-center gap-4 py-8"
      >
        <div class="flex flex-col items-center gap-2">
          <IconChartAreaLine class="text-main" size="70" stroke="1.5" />
          You don't have any goals yet.
          <bl-goal-modal
            v-if="authors && books"
            v-model="selectedGoal"
            is-new
            :authors="authors"
            :books="viewBooks"
            :reload-goals="refresh"
          >
            <template #trigger="triggerProps">
              <bl-button v-bind="triggerProps" class="mt-2"
                >Create a new goal</bl-button
              >
            </template>
          </bl-goal-modal>
        </div>
      </bl-tile>

      <template v-if="sortedGoals?.length">
        <bl-goal-tile
          v-for="(goal, index) in sortedGoals"
          :key="goal.id"
          :goal="goal"
          class="col-span-12"
          :default-open="index === 0"
          :books="viewBooks ?? []"
          :authors="authors ?? []"
          :reload-goals="refresh"
        />
      </template>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { IconChartAreaLine, IconPlus } from '@tabler/icons-vue'
import { indexBy } from 'ramda'
import type { Author } from '~/types/author'
import type { Book, ViewBook } from '~/types/book'
import type { Goal } from '~/types/goal'

const { getAuthors, getBooks, getGoals } = useBookLibrary()

const authors = ref<Author[]>([])
const books = ref<Book[]>([])
const goals = ref<Goal[]>([])

const loadData = async () => {
  authors.value = await getAuthors()
  books.value = await getBooks()
  goals.value = await getGoals()
}

const refresh = loadData

onMounted(loadData)

const authorsById = computed(() =>
  authors.value ? indexBy(({ id }) => String(id), authors.value) : {},
)

const viewBooks = ref<ViewBook[]>(getBooksWithAuthorNames(books.value))

const selectedGoal = ref<Goal | undefined>()

const sortedGoals = computed(() => sortGoals(goals.value ?? []))

// TODO: return author name with book from server
function getBooksWithAuthorNames(_books: Book[] | null): ViewBook[] {
  return (_books ?? []).map((book) => ({
    ...book,
    authorName: book.author
      ? authorsById.value[String(book.author)]?.name
      : undefined,
  }))
}

useHead({
  title: 'BookLib | Tracking',
})
</script>

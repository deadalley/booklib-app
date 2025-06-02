<template>
  <div
    v-if="goal"
    v-bind="$attrs"
    class="overflow-visible rounded-xl border border-accent px-6 py-2"
  >
    <ClientOnly v-if="editing">
      <div class="flex flex-1 flex-col gap-16 overflow-visible">
        <FormKit
          id="entry"
          v-model="entry"
          type="form"
          :actions="false"
          @submit="onSubmit"
        >
          <template v-if="goal.type === 'books'">
            <section class="book-section">
              <div
                class="relative flex size-max w-full gap-x-6 overflow-x-auto p-3 transition duration-100 ease-out"
              >
                <bl-book-card
                  v-for="book in displayedBooks"
                  :key="book.title"
                  :book="book"
                  selectable
                  class="!w-32 shrink-0"
                  @selected="() => onBookSelect(book.id)"
                />
              </div>
              <div class="form-row">
                <bl-input-autocomplete
                  v-if="bookSelectOptions.length"
                  id="book"
                  v-model:search-term="searchTerm"
                  name="book"
                  label="Book"
                  placeholder="Book"
                  :options="bookSelectOptions"
                  clearable
                />
              </div>
            </section>
          </template>
          <div class="flex items-baseline justify-end gap-2">
            <bl-button variant="secondary" @click="onCancel">
              {{ isNew ? 'Cancel' : 'Discard changes' }}
            </bl-button>
            <bl-button @click="onSubmit">{{
              isNew ? 'Create entry' : 'Save changes'
            }}</bl-button>
          </div>
        </FormKit>
      </div>
    </ClientOnly>
    <template v-if="entry && !editing">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <h6>{{ getEntryTitle() }}</h6>
          <p>{{ toFullDateCompact(entry.createdAt) }}</p>
        </div>
        <bl-button @click="editing = true">
          <template #prependIcon="iconProps">
            <IconPencil v-bind="iconProps" />
          </template>
        </bl-button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { IconPencil } from '@tabler/icons-vue'
import { indexBy, prop } from 'ramda'
import type { ViewBook } from '~/types/book'
import type {
  BookGoalEntry,
  HourGoalEntry,
  PageGoalEntry,
  ViewGoal,
} from '~/types/goal'

const props = defineProps<{
  books: ViewBook[]
  reloadGoals: () => Promise<void>
}>()

const goal = defineModel<ViewGoal>('goal')
const entry = defineModel<BookGoalEntry | PageGoalEntry | HourGoalEntry>(
  'entry',
)
const editing = defineModel<boolean>('editing')

const searchTerm = ref()

const isNew = computed(() => !entry.value?.id)

const bookSelectOptions = computed(() =>
  sortBooksByAuthor(props.books).map((book) => ({
    label: book.authorName ? `${book.authorName} - ${book.title}` : book.title,
    value: book.id,
  })),
)

const displayedBooks = computed(() => {
  if (searchTerm.value) {
    return filterElementsBySearchParam(props.books, searchTerm.value, [
      'title',
      'authorName',
    ]).slice(0, 50)
  }
  return props.books.slice(0, 10)
})

function onBookSelect(bookId: ViewBook['id']) {
  if (goal.value && entry.value) {
    if (goal.value.type === 'books') {
      ;(entry.value as BookGoalEntry).book = bookId
    }
  }
}

async function onSubmit() {
  const newEntry = getEntryValue()

  if (goal.value && newEntry) {
    try {
      await $fetch<ViewGoal>('/api/goals', {
        method: 'POST',
        body: {
          ...goal.value,
          entries: isNew.value
            ? goal.value.entries.concat(newEntry)
            : goal.value.entries,
        } as ViewGoal,
      })

      props.reloadGoals()
      editing.value = false
      entry.value = undefined
    } catch (error) {
      console.error(error)
    }
  }
}

function onCancel() {
  editing.value = false
}

function getEntryValue() {
  if (goal.value) {
    switch (goal.value.type) {
      case 'books':
        return entry.value as BookGoalEntry
      case 'pages':
        return entry.value as PageGoalEntry
      case 'hours':
        return entry.value as HourGoalEntry
    }
  }
}

function getEntryTitle() {
  if (entry.value && goal.value) {
    switch (goal.value.type) {
      case 'books': {
        const booksById = indexBy(prop('id'), props.books)
        return booksById[(entry.value as BookGoalEntry).book ?? '']?.title
      }
      case 'pages':
        return 'Page entry'
      case 'hours':
        return 'Hour entry'
    }
  }
  return ''
}
</script>

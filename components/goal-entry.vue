<template>
  <bl-tile v-if="goal" v-bind="$attrs">
    <ClientOnly>
      <div class="flex flex-1 flex-col gap-16 overflow-visible overflow-y-auto">
        <FormKit
          id="entry"
          v-model="entry"
          type="form"
          :actions="false"
          @submit="onSaveChanges"
        >
          <template v-if="goal.type === 'books'">
            <section class="book-section">
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
              <!-- <div
                class="relative flex size-max w-full gap-x-6 overflow-x-auto p-3 transition duration-100 ease-out"
              >
                <bl-book-card
                  v-for="book in displayedBooks"
                  :key="book.title"
                  :book="book"
                  class="!w-32 shrink-0"
                />
              </div> -->
            </section>
          </template>
          <div class="flex items-baseline justify-end gap-2">
            <bl-button variant="secondary" @click="onCancel">
              {{ isNew ? 'Cancel' : 'Discard changes' }}
            </bl-button>
            <bl-button @click="onSaveChanges">{{
              isNew ? 'Create entry' : 'Save changes'
            }}</bl-button>
          </div>
        </FormKit>
      </div>
    </ClientOnly>
  </bl-tile>
</template>

<script setup lang="ts">
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
const open = defineModel<boolean>('open')

const searchTerm = ref()

const isNew = computed(() => !entry.value?.id)

const bookSelectOptions = computed(() =>
  props.books
    .map((book) => ({
      label: book.authorName
        ? `${book.authorName} - ${book.title}`
        : book.title,
      value: book.id,
    }))
    .sort(({ label: l1 }, { label: l2 }) => l1.localeCompare(l2)),
)

// const displayedBooks = computed(() => {
//   console.log(searchTerm.value)
//   if (searchTerm.value) {
//     return filterElementsBySearchParam(props.books, searchTerm.value, [
//       'title',
//       'authorName',
//     ]).slice(0, 50)
//   }
//   return props.books.slice(0, 10)
// })

async function onSaveChanges() {
  return onSubmit()
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

      open.value = false
      props.reloadGoals()
    } catch (error) {
      console.error(error)
    }
  }
}

function onCancel() {
  open.value = false
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
</script>

<template>
  <div
    v-if="goal"
    v-bind="$attrs"
    class="overflow-visible rounded-xl border border-accent px-6 py-2"
  >
    <template v-if="entry">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <h6>{{ getEntryTitle() }}</h6>
          <p>{{ toFullDateCompact(entry.createdAt) }}</p>
        </div>
        <bl-modal
          v-if="entry"
          ref="modalRef"
          :open="editing"
          size="lg"
          @cancel="onCancel"
        >
          <template #trigger>
            <bl-button @click="editing = true">
              <template #prependIcon="iconProps">
                <IconPencil v-bind="iconProps" />
              </template>
            </bl-button>
          </template>
          <template #title>
            {{ getModalTitle() }}
          </template>
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
                        v-model:input="bookValue"
                        v-model:search-term="searchTerm"
                        name="book"
                        label="Book"
                        placeholder="Book"
                        :options="bookSelectOptions"
                        clearable
                        side="top"
                      />
                      <bl-input
                        id="createdAt"
                        type="date"
                        name="createdAt"
                        :label="
                          goal.type === 'books' ? 'Finished on' : 'Read on'
                        "
                        placeholder="Date"
                        clearable
                        :formatter="dateFormatter"
                      />
                    </div>
                  </section>
                </template>
                <template v-if="goal.type === 'hours'">
                  <section class="book-section">
                    <div class="form-row">
                      <bl-input
                        id="hours"
                        type="number"
                        name="hours"
                        label="Hours"
                        placeholder="Hours"
                        clearable
                      />
                      <bl-input
                        id="createdAt"
                        type="date"
                        name="createdAt"
                        label="Read on"
                        placeholder="Date"
                        clearable
                        :formatter="dateFormatter"
                      />
                    </div>
                  </section>
                </template>
                <template v-if="goal.type === 'pages'">
                  <section class="book-section">
                    <div class="form-row">
                      <bl-input
                        id="pages"
                        type="number"
                        name="pages"
                        label="Pages"
                        placeholder="Pages"
                        clearable
                      />
                      <bl-input
                        id="createdAt"
                        type="date"
                        name="createdAt"
                        label="Read on"
                        placeholder="Date"
                        clearable
                        :formatter="dateFormatter"
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
        </bl-modal>
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
  Goal,
} from '~/types/goal'
import { reset } from '@formkit/core'

const props = defineProps<{
  books: ViewBook[]
  reloadGoals: () => Promise<void>
}>()

const goal = defineModel<Goal>('goal')
const entry =
  defineModel<Partial<BookGoalEntry | PageGoalEntry | HourGoalEntry>>('entry')
const editing = defineModel<boolean>('editing')

const bookValue = defineModel<ViewBook['id']>('bookValue')
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
    return filterElementsBySearchParam(
      props.books,
      searchTerm.value.split(' - ').at(-1),
      ['title', 'authorName'],
    ).slice(0, 50)
  }
  return props.books.slice(0, 10)
})

function onBookSelect(bookId: ViewBook['id']) {
  if (goal.value && entry.value) {
    if (goal.value.type === 'books') {
      ;(entry.value as BookGoalEntry).book = bookId
      bookValue.value = bookId
      searchTerm.value = bookSelectOptions.value.find(
        (option) => option.value === bookId,
      )?.label
    }
  }
}

async function onSubmit() {
  const newEntry = getEntryValue()

  if (goal.value && newEntry) {
    try {
      await $fetch<Goal>('/api/goals', {
        method: 'POST',
        body: {
          ...goal.value,
          entries: isNew.value
            ? goal.value.entries.concat(newEntry)
            : goal.value.entries,
        } as Goal,
      })

      props.reloadGoals()
      clearState()
    } catch (error) {
      console.error(error)
    }
  }
}

function onCancel() {
  clearState()
}

function clearState() {
  editing.value = false
  entry.value = undefined
  bookValue.value = undefined
  searchTerm.value = undefined
  reset('entry')
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
      case 'pages': {
        const pages = (entry.value as PageGoalEntry).pages
        return `${pages} ${getGoalUnit(goal.value, pages)}`
      }
      case 'hours': {
        const hours = (entry.value as HourGoalEntry).hours
        return `${hours} ${getGoalUnit(goal.value, hours)}`
      }
    }
  }
  return ''
}

function getModalTitle() {
  if (goal.value) {
    switch (goal.value.type) {
      case 'books':
        return 'Add book entry'
      case 'pages':
        return 'Add page entry'
      case 'hours':
        return 'Add hour entry'
    }
  }
  return ''
}

function dateFormatter(date: Date | undefined): string | undefined {
  return date && toDefaultDate(date)
}
</script>

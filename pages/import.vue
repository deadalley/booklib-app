<template>
  <NuxtLayout name="dashboard" title="Import">
    <div
      v-if="!importedBooks?.length"
      class="flex flex-col items-center gap-12"
    >
      <div
        class="flex w-full flex-col gap-12 rounded-3xl border border-accent p-16 md:w-3/5"
      >
        <div class="self-center text-main">
          <IconDownload size="80" stroke="1.5" />
          <h4>Import</h4>
        </div>
        <div class="flex flex-col gap-2">
          <h6>1. Choose your preferred file format</h6>
          <bl-raw-select
            v-model="importType"
            :options="importOptions"
            class="ml-4"
            placeholder="Select file format"
          />
        </div>
        <div class="flex flex-col gap-2">
          <div>
            <h6>2. Download the template file</h6>
            <p class="ml-4">
              The importer expects a file with the provided format and
              information. Use this empty file to fill up your import data and
              upload it to BookLib.
            </p>
          </div>
          <bl-button class="ml-4" :disabled="!importType" @click="downloadFile">
            <template #prependIcon="prependIcon">
              <IconDownload v-bind="prependIcon" />
            </template>
            {{
              importType
                ? 'Download template for ' + importType
                : 'Choose file format'
            }}</bl-button
          >
        </div>
        <div class="flex flex-col gap-2">
          <div>
            <h6>3. Upload your library</h6>
            <p class="ml-4">
              Select the file with your new books and upload it to BookLib.
            </p>
          </div>
          <bl-button
            class="ml-4"
            :disabled="!importType"
            @click="onUploadClick"
          >
            <template #prependIcon="prependIcon">
              <IconUpload v-bind="prependIcon" />
            </template>
            {{ importType ? 'Upload file' : 'Choose file format' }}
          </bl-button>
          <input
            ref="fileInput"
            type="file"
            class="hidden"
            @change="onFileChange"
          />
        </div>
      </div>
    </div>
    <div
      v-if="importedBooks?.length"
      class="flex h-full flex-col gap-6 overflow-y-auto"
    >
      <div class="flex justify-between">
        <div>
          <h5 v-if="selectedBooksForUpload.length">
            <span class="text-main">{{ selectedBooksForUpload.length }}</span>
            books selected for import
          </h5>
          <h5 v-if="!selectedBooksForUpload.length">
            No books selected for import
          </h5>
          <p class="text-accent-dark">
            {{
              selectedBooksForUpload.length
                ? 'The following books will be imported:'
                : 'Please select at least one book to be imported.'
            }}
          </p>
        </div>
        <div class="flex justify-end gap-2">
          <bl-button variant="secondary" @click="onCancel"> Cancel </bl-button>
          <bl-button
            :disabled="!selectedBooksForUpload.length"
            @click="onSubmit"
          >
            <template #prependIcon="prependIcon">
              <IconUpload v-bind="prependIcon" />
            </template>
            Import selected books
          </bl-button>
        </div>
      </div>
      <bl-books-table
        :books="importedBooks"
        :selected-table-columns="selectedTableColumns"
        with-check
        default-selected
        @select:rows="onSelectBook"
      />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { IconDownload, IconUpload } from '@tabler/icons-vue'
import { useBookLibrary } from '~/composables/use-book-library'
import type { SelectOption } from '~/components/raw-select.vue'
import type { Book } from '~/types/book'
import { parseCsvFile } from '~/utils/import'

type ImportType = '.csv' | '.json'

const importOptions: SelectOption[] = [
  { label: 'CSV', value: '.csv' },
  { label: 'JSON', value: '.json' },
]
const selectedTableColumns = {
  coverSrc: { label: 'Cover', checked: false },
  author: { label: 'Author', checked: true },
  publisher: { label: 'Publisher', checked: true },
  language: { label: 'Language', checked: true },
  year: { label: 'Year', checked: true },
  pages: { label: 'Pages', checked: true },
  rating: { label: 'Rating', checked: true },
  originalTitle: { label: 'Original Title', checked: true },
  originalLanguage: { label: 'Original Language', checked: true },
  isbn: { label: 'ISBN', checked: true },
  progressStatus: { label: 'Progress Status', checked: true },
}

const fileInput = ref()
const importType = ref<ImportType>()
const importedBooks = ref<Book[] | undefined>()
const selectedBooks = ref<Record<Book['id'], boolean>>({})

const selectedBooksForUpload = computed(() =>
  (importedBooks?.value ?? []).filter(({ id }) => selectedBooks.value[id]),
)

function downloadFile() {
  if (importType.value) {
    const link = document.createElement('a')
    link.href = `/templates/template${importType.value}`
    link.download = `template${importType.value}`
    link.target = '_blank'
    link.click()
  }
}

function onUploadClick() {
  fileInput.value.click()
}

async function parseFile(file: File) {
  switch (importType.value) {
    case '.csv':
      return parseCsvFile(file)
    case '.json':
      return parseJsonFile(file)
    default:
      throw Error('Unknown file type')
  }
}

async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement)?.files?.[0] as File

  const books = await parseFile(file)

  const booksWithIds = books.map((book, index) => ({
    ...book,
    id: String(index + 1),
  }))

  selectedBooks.value = booksWithIds.reduce(
    (acc, { id }) => ({ ...acc, [id]: true }),
    {},
  )

  importedBooks.value = booksWithIds
}

async function onSubmit() {
  if (importedBooks.value?.length) {
    const { importLibrary } = useBookLibrary()
    const databaseData = {
      authors: [],
      books: selectedBooksForUpload.value.map((book) => ({
        ...book,
        created_at: book.createdAt,
        author_id: book.author,
        progress_status: book.progressStatus,
        cover_src: book.coverSrc,
        original_title: book.originalTitle,
        original_language: book.originalLanguage,
        started_at: book.startedAt,
        finished_at: book.finishedAt,
      })),
      collections: [],
      'collection-book': [],
      goals: [],
    }
    await importLibrary(databaseData)

    navigateTo('/library')
  }
}

function onCancel() {
  importedBooks.value = undefined
  selectedBooks.value = {}
}

function onSelectBook(value: Record<string, boolean>) {
  selectedBooks.value = value
}

useHead({
  title: 'BookLib | Import',
})
</script>

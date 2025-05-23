<template>
  <NuxtLayout name="dashboard" title="Import">
    <div
      v-if="!importedBooks?.length"
      class="flex flex-col items-center gap-12"
    >
      <h2>Import new books to your library</h2>
      <div
        class="flex max-w-5xl rounded-3xl border-2 border-accent px-12 py-16"
      >
        <NuxtImg
          src="/books-5.jpg"
          alt="Books"
          class="w-2/5 rounded-3xl object-cover object-center"
        />
        <div class="flex w-3/5 flex-col gap-12 px-16 pb-16">
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
            <bl-button
              class="ml-4"
              :disabled="!importType"
              @click="downloadFile"
            >
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
        @selected-rows="onSelectBook"
      />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { IconDownload, IconUpload } from '@tabler/icons-vue'
import type { SelectOption } from '~/components/raw-select.vue'
import type { Book } from '~/types/book'
import { parseCsvFile } from '~/utils/import'

type ImportType = '.csv'

const importOptions: SelectOption[] = [{ label: 'CSV', value: '.csv' }]
const selectedTableColumns = {
  coverSrc: { label: 'Cover', checked: false },
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

async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement)?.files?.[0] as File

  const books = await parseCsvFile(file)

  const booksWithIds = books.map((book, index) => ({
    ...book,
    id: index + 1,
  }))

  importedBooks.value = booksWithIds

  selectedBooks.value = booksWithIds.reduce(
    (acc, { id }) => ({ ...acc, [id]: true }),
    {},
  )
}

async function onSubmit() {
  try {
    if (importedBooks.value?.length) {
      await $fetch('/api/library/import', {
        method: 'post',
        body: selectedBooksForUpload.value,
      })

      navigateTo('/library')
    }
  } catch (error) {
    console.error(error)
  }
}

function onCancel() {
  importedBooks.value = undefined
  selectedBooks.value = {}
}

function onSelectBook(value: typeof selectedBooks.value) {
  selectedBooks.value = value
}

useHead({
  title: 'BookLib | Import',
})
</script>

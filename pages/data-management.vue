<template>
  <NuxtLayout name="dashboard" title="Data Management">
    <!-- Import preview table (shown after file is parsed) -->
    <div
      v-if="importedBooks?.length"
      class="flex h-full flex-col gap-6 overflow-y-auto"
    >
      <div class="flex justify-between">
        <div>
          <h5 v-if="selectedBooksForUpload.length">
            <span class="text-primary">{{
              selectedBooksForUpload.length
            }}</span>
            books selected for import
          </h5>
          <h5 v-else>No books selected for import</h5>
          <p class="text-ink-muted">
            {{
              selectedBooksForUpload.length
                ? 'The following books will be imported:'
                : 'Please select at least one book to be imported.'
            }}
          </p>
        </div>
        <div class="flex justify-end gap-2">
          <bl-button variant="secondary" @click="onCancel">Cancel</bl-button>
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

    <!-- Main data management view -->
    <div v-else class="flex flex-col gap-8">
      <div>
        <h3>Data Management</h3>
        <p class="text-ink-secondary">
          Migrate your literary collection or backup your existing database with
          ease.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <!-- Import Library card -->
        <div class="paper data-management-card">
          <div class="data-management-card-header">
            <div class="flex items-center gap-2">
              <IconBookUpload
                class="text-primary"
                :size="ICON_SIZE_MEDIUM"
                stroke="1.5"
              />
              <h5>Import Library</h5>
            </div>
            <p class="text-ink-secondary text-sm">
              Upload your data from Goodreads, Libib, or custom files.
            </p>
          </div>

          <!-- Source platform -->
          <div class="flex flex-col gap-2">
            <h6>Source Platform</h6>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="platform in sourcePlatforms"
                :key="platform.label"
                type="button"
                class="platform-btn"
                :class="{
                  'platform-btn-active': importType === platform.value,
                }"
                @click="importType = platform.value"
              >
                <component
                  :is="platform.icon"
                  :size="16"
                  stroke="1.5"
                  class="shrink-0"
                />
                {{ platform.label }}
              </button>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <h6>Template File</h6>
            <bl-button
              variant="secondary"
              :disabled="!importType"
              :loading="importLoading"
              @click="downloadImportTemplate"
            >
              <template #prependIcon="prependIcon">
                <IconDownload v-bind="prependIcon" />
              </template>
              Download Template
            </bl-button>
          </div>

          <!-- File drop zone -->
          <div
            class="file-drop-zone"
            :class="{ 'file-drop-zone-over': isDragging }"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDrop"
            @click="onUploadClick"
          >
            <IconCloudUpload
              :size="44"
              stroke="1"
              class="text-ink-muted mx-auto"
            />
            <p class="text-ink-primary font-medium">
              Drag and drop your file here
            </p>
            <p class="text-ink-muted text-sm">
              Supports .csv, .json, .xlsx (Max 10MB)
            </p>
            <span class="text-primary text-sm underline">Browse Files</span>
          </div>
          <input
            ref="fileInput"
            type="file"
            class="hidden"
            @change="onFileChange"
          />

          <!-- Error / hint -->
          <bl-warning-badge v-if="importError">
            <template #icon="iconProps">
              <IconAlertTriangle v-bind="iconProps" />
            </template>
            <template #content>
              <b>Error importing file: </b>{{ importError }}
            </template>
          </bl-warning-badge>

          <bl-button
            :disabled="!importType"
            :loading="importLoading"
            class="w-full justify-center"
            @click="onUploadClick"
          >
            Import Library
            <template #appendIcon="appendIcon">
              <IconUpload v-bind="appendIcon" />
            </template>
          </bl-button>
        </div>

        <!-- Export Library card -->
        <div class="paper data-management-card">
          <div class="data-management-card-header">
            <div class="flex items-center gap-2">
              <IconBookDownload
                class="text-primary"
                :size="ICON_SIZE_MEDIUM"
                stroke="1.5"
              />
              <h5>Export Library</h5>
            </div>
            <p class="text-ink-secondary text-sm">
              Download your entire collection for backup or sharing.
            </p>
          </div>

          <!-- Select Export Format -->
          <div class="flex flex-col gap-2">
            <h6>Select Export Format</h6>
            <div class="flex flex-col gap-2">
              <button
                v-for="format in exportFormats"
                :key="format.value ?? format.label"
                type="button"
                class="export-format-option"
                :class="{
                  'export-format-option-active':
                    exportType === format.value && !format.disabled,
                  'export-format-option-disabled': format.disabled,
                }"
                :disabled="format.disabled"
                @click="
                  !format.disabled &&
                  format.value &&
                  (exportType = format.value)
                "
              >
                <div
                  class="export-format-radio"
                  :class="{
                    'export-format-radio-checked': exportType === format.value,
                  }"
                >
                  <div
                    v-if="exportType === format.value && !format.disabled"
                    class="export-format-radio-dot"
                  />
                </div>
                <div class="flex-1 text-left">
                  <p class="text-sm font-medium">{{ format.label }}</p>
                  <p class="text-ink-muted text-xs">{{ format.description }}</p>
                </div>
                <component
                  :is="format.icon"
                  :size="18"
                  stroke="1.5"
                  class="text-ink-muted shrink-0"
                />
              </button>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="border-stroke mt-auto flex items-center justify-between border-t pt-4"
          >
            <p class="text-ink-secondary text-sm">
              Total Books:
              <span class="text-ink-primary font-semibold">{{
                totalBooks
              }}</span>
            </p>
            <bl-button
              :disabled="!exportType"
              :loading="exportLoading"
              @click="downloadExportFile"
            >
              <template #prependIcon="prependIcon">
                <IconDownload v-bind="prependIcon" />
              </template>
              Generate Export
            </bl-button>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  IconAlertTriangle,
  IconBookDownload,
  IconBookUpload,
  IconCloudUpload,
  IconDownload,
  IconFileTypeCsv,
  IconBraces,
  IconUpload,
} from '@tabler/icons-vue'
import dayjs from 'dayjs'
import { indexBy, pick, prop, uniq } from 'ramda'
import { v4 as uuidv4 } from 'uuid'
import { useBookLibrary } from '~/composables/use-book-library'
import type { Book } from '~/types/book'
import type { LibraryData } from '~/types/library'
import { parseCsvFile, parseJsonFile } from '~/utils/import'

// ─── Shared types ────────────────────────────────────────────────────────────

type ImportType = '.csv' | '.json'
type ExportType = '.csv' | '.json'
type ExportCollectionType = keyof LibraryData | 'all'

// ─── Import ───────────────────────────────────────────────────────────────────

const sourcePlatforms = [
  { label: 'CSV', value: '.csv' as ImportType, icon: IconFileTypeCsv },
  { label: 'JSON', value: '.json' as ImportType, icon: IconBraces },
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
const fileName = ref<string>('')
const importLoading = ref(false)
const importError = ref<string | null>(null)
const isDragging = ref(false)

const selectedBooksForUpload = computed(() =>
  (importedBooks?.value ?? []).filter(({ id }) => selectedBooks.value[id]),
)

function downloadImportTemplate() {
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

async function processImportFile(file: File) {
  fileName.value = file.name
  importLoading.value = true
  try {
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
  } catch (e) {
    importError.value =
      typeof e === 'string' ? e : 'An error occurred while parsing the file.'
    importedBooks.value = []
  } finally {
    importLoading.value = false
  }
}

async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement)?.files?.[0] as File
  await processImportFile(file)
}

async function onDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) {
    await processImportFile(file)
  }
}

const { importLibrary, exportLibrary, getBooks } = useBookLibrary()

async function onSubmit() {
  if (importedBooks.value?.length) {
    const uniqueAuthors = uniq(
      selectedBooksForUpload.value.map((book) => book.author),
    )
    const authors = Array.from(uniqueAuthors).map((name) => ({
      name: name!,
      id: uuidv4(),
      created_at: now(),
    }))
    const authorNameToId = indexBy(prop('name'), authors)
    const databaseData = {
      authors,
      books: selectedBooksForUpload.value.map((book) => ({
        ...book,
        created_at: book.createdAt,
        author_id: book.author
          ? (authorNameToId[book.author as string]?.id ?? null)
          : null,
        progress_status: book.progressStatus,
        cover_src: book.coverSrc,
        original_title: book.originalTitle,
        original_language: book.originalLanguage,
        started_at: book.startedAt,
        finished_at: book.finishedAt,
      })),
      collections: DEFAULT_COLLECTIONS_INIT.map((c) => ({
        ...c,
        created_at: now(),
      })),
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

// ─── Export ───────────────────────────────────────────────────────────────────

const exportFormats = [
  {
    label: 'Standard CSV',
    description: 'Best for Excel, Numbers, and Google Sheets.',
    value: '.csv' as ExportType,
    icon: IconFileTypeCsv,
    disabled: false,
  },
  {
    label: 'Structured JSON',
    description: 'Ideal for developers and data integration.',
    value: '.json' as ExportType,
    icon: IconBraces,
    disabled: false,
  },
]

const exportType = ref<ExportType>()
const exportCollection = ref<ExportCollectionType>('all')
const exportLoading = ref(false)
const totalBooks = ref(0)

onMounted(async () => {
  const books = await getBooks()
  totalBooks.value = books.length
})

async function fetchLibraryData(): Promise<LibraryData> {
  const data = await exportLibrary()
  return data as LibraryData
}

async function downloadExportFile() {
  if (exportType.value && exportCollection.value) {
    exportLoading.value = true
    switch (exportType.value) {
      case '.json':
        return downloadAsJson(exportCollection.value)
      case '.csv':
        return downloadAsCsv(exportCollection.value as keyof LibraryData)
      default:
        return
    }
  }
}

async function downloadAsJson(collectionType: ExportCollectionType) {
  const libraryData = await fetchLibraryData()
  const exportData =
    collectionType === 'all' ? libraryData : pick([collectionType], libraryData)
  const data = JSON.stringify(exportData)
  createDownloadLink(collectionType, '.json', data)
}

async function downloadAsCsv(collectionType: keyof LibraryData) {
  const libraryData = await fetchLibraryData()
  const exportData = libraryData[collectionType]
  // @ts-expect-error wrong typing
  const data = createCsvFile(exportData)
  createDownloadLink(collectionType, '.csv', data)
}

function createDownloadLink(
  collectionType: ExportCollectionType,
  type: ExportType,
  data: string,
) {
  const blob = new Blob([data], { type: 'text/plain' })
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = `${dayjs().format('YYYY-MM-DD')}_booklib_${collectionType}_export${type}`
  link.dataset.downloadurl = ['text/json', link.download, link.href].join(':')
  link.target = '_blank'
  link.click()
  exportLoading.value = false
}

watch(exportType, (value) => {
  if (value === '.csv' && exportCollection.value === 'all') {
    exportCollection.value = 'books'
  }
  if (value === '.json') {
    exportCollection.value = 'all'
  }
})

useHead({
  title: 'BookLib | Data Management',
})
</script>

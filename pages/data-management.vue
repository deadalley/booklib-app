<template>
  <NuxtLayout name="dashboard" title="Data Management">
    <!-- Import preview (shown after a file is parsed) -->
    <div
      v-if="preview"
      class="mx-auto flex w-full max-w-[90rem] flex-col gap-6"
      data-testid="import-preview"
    >
      <div
        class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div class="flex flex-col gap-1">
          <span class="section-label text-primary">Import preview</span>
          <h4 v-if="selectedRows.length">
            <span class="text-primary">{{ selectedRows.length }}</span>
            of {{ preview.rows.length }} books selected
          </h4>
          <h4 v-else>No books selected</h4>
          <p class="text-ink-secondary text-sm">
            {{ fileName }}
            <template v-if="preview.plan.newAuthors.length">
              · {{ preview.plan.newAuthors.length }} new
              {{ preview.plan.newAuthors.length === 1 ? 'author' : 'authors' }}
            </template>
            <template v-if="duplicateCount">
              · {{ duplicateCount }} possible
              {{ duplicateCount === 1 ? 'duplicate' : 'duplicates' }} (not
              selected)
            </template>
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <bl-button variant="secondary" @click="onCancel">Cancel</bl-button>
          <bl-button
            v-if="preview.backup"
            variant="secondary"
            :loading="importLoading"
            @click="onRestoreBackup"
          >
            <template #prependIcon="prependIcon">
              <IconDatabaseImport v-bind="prependIcon" />
            </template>
            Restore full backup
          </bl-button>
          <bl-button
            :disabled="!selectedRows.length"
            :loading="importLoading"
            data-testid="import-submit"
            @click="onSubmit"
          >
            <template #prependIcon="prependIcon">
              <IconUpload v-bind="prependIcon" />
            </template>
            Import selected books
          </bl-button>
        </div>
      </div>

      <bl-warning-badge v-if="preview.backup">
        <template #icon="iconProps">
          <IconInfoCircle v-bind="iconProps" />
        </template>
        <template #content>
          This file is a full BookLib backup.
          <b>Import selected books</b>
          adds only the books (without collections).
          <b>Restore full backup</b>
          also brings in collections, authors and goals.
        </template>
      </bl-warning-badge>

      <div
        v-if="preview.issues.length"
        class="paper-flat flex flex-col gap-2 px-5 py-4"
        data-testid="import-issues"
      >
        <button
          type="button"
          class="flex items-center gap-2 text-left text-sm font-semibold"
          @click="showIssues = !showIssues"
        >
          <IconAlertTriangle :size="18" stroke="1.5" class="text-primary" />
          {{ issueSummary }}
          <IconChevronDown
            :size="16"
            class="ml-auto transition-transform"
            :class="{ 'rotate-180': showIssues }"
          />
        </button>
        <ul
          v-if="showIssues"
          class="text-ink-secondary flex max-h-64 flex-col gap-1 overflow-y-auto text-sm"
        >
          <li
            v-for="(issue, index) in preview.issues"
            :key="index"
            class="flex gap-2"
          >
            <span
              class="shrink-0 font-semibold"
              :class="
                issue.severity === 'error' ? 'text-primary' : 'text-ink-muted'
              "
            >
              {{ issue.row ? `Row ${issue.row}` : 'File' }}
            </span>
            <span>{{ issue.message }}</span>
          </li>
        </ul>
      </div>

      <bl-books-table
        :books="preview.rows"
        :selected-table-columns="previewColumns"
        with-check
        @select:rows="onSelectRows"
      />
    </div>

    <!-- Main data management view -->
    <div v-else class="mx-auto flex w-full max-w-[90rem] flex-col gap-8">
      <div class="flex flex-col gap-1">
        <span class="section-label text-primary">Library</span>
        <h3>Data Management</h3>
        <p class="text-ink-secondary">
          Import books from a spreadsheet or another app, export your library,
          or keep a full backup.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <!-- Import card -->
        <section class="paper-flat data-management-card">
          <div class="data-management-card-header">
            <div class="flex items-center gap-2">
              <IconBookUpload
                class="text-primary"
                :size="ICON_SIZE_MEDIUM"
                stroke="1.5"
              />
              <h5>Import books</h5>
            </div>
            <p class="text-ink-secondary text-sm">
              CSV or JSON files: BookLib exports and backups, the templates
              below, or spreadsheets with matching column names.
            </p>
          </div>

          <div class="flex flex-col gap-2">
            <span class="section-label">Templates</span>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="template in templates"
                :key="template.value"
                type="button"
                class="platform-btn"
                @click="downloadTemplate(template.value)"
              >
                <component
                  :is="template.icon"
                  :size="16"
                  stroke="1.5"
                  class="shrink-0"
                />
                {{ template.label }}
                <IconDownload :size="14" class="text-ink-muted ml-auto" />
              </button>
            </div>
          </div>

          <div
            class="file-drop-zone"
            :class="{ 'file-drop-zone-over': isDragging }"
            role="button"
            tabindex="0"
            data-testid="import-drop-zone"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDrop"
            @click="onUploadClick"
            @keydown.enter.prevent="onUploadClick"
            @keydown.space.prevent="onUploadClick"
          >
            <IconCloudUpload
              :size="44"
              stroke="1"
              class="text-ink-muted mx-auto"
            />
            <p class="text-ink-primary font-medium">
              Drag and drop your file here
            </p>
            <p class="text-ink-muted text-sm">Supports .csv and .json</p>
            <span class="text-primary text-sm underline">Browse files</span>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept=".csv,.json,text/csv,application/json"
            class="hidden"
            data-testid="import-file-input"
            @change="onFileChange"
          />

          <bl-warning-badge v-if="importError" data-testid="import-error">
            <template #icon="iconProps">
              <IconAlertTriangle v-bind="iconProps" />
            </template>
            <template #content>
              <b>Could not import {{ fileName }}:</b>
              {{ importError }}
            </template>
          </bl-warning-badge>

          <p
            v-if="importSuccess"
            class="text-ink-secondary text-sm"
            data-testid="import-success"
          >
            {{ importSuccess }}
          </p>
        </section>

        <!-- Export card -->
        <section class="paper-flat data-management-card">
          <div class="data-management-card-header">
            <div class="flex items-center gap-2">
              <IconBookDownload
                class="text-primary"
                :size="ICON_SIZE_MEDIUM"
                stroke="1.5"
              />
              <h5>Export</h5>
            </div>
            <p class="text-ink-secondary text-sm">
              Download your books, or a full backup that can be restored later.
            </p>
          </div>

          <div class="flex flex-col gap-2" role="radiogroup">
            <span class="section-label">Format</span>
            <button
              v-for="format in exportFormats"
              :key="format.value"
              type="button"
              role="radio"
              :aria-checked="exportType === format.value"
              class="export-format-option"
              :class="{
                'export-format-option-active': exportType === format.value,
              }"
              @click="exportType = format.value"
            >
              <div
                class="export-format-radio"
                :class="{
                  'export-format-radio-checked': exportType === format.value,
                }"
              >
                <div
                  v-if="exportType === format.value"
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

          <div
            class="border-stroke mt-auto flex flex-wrap items-center justify-between gap-3 border-t pt-4"
          >
            <p class="text-ink-secondary text-sm">
              Total books:
              <span class="text-ink-primary font-semibold">
                {{ totalBooks }}
              </span>
            </p>
            <bl-button
              :disabled="!exportType"
              :loading="exportLoading"
              data-testid="export-submit"
              @click="onExport"
            >
              <template #prependIcon="prependIcon">
                <IconDownload v-bind="prependIcon" />
              </template>
              Download
            </bl-button>
          </div>
        </section>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  IconAlertTriangle,
  IconBookDownload,
  IconBookUpload,
  IconBraces,
  IconChevronDown,
  IconCloudUpload,
  IconDatabaseExport,
  IconDatabaseImport,
  IconDownload,
  IconFileTypeCsv,
  IconInfoCircle,
  IconUpload,
} from '@tabler/icons-vue'
import dayjs from 'dayjs'
import type { RowSelectionState } from '@tanstack/vue-table'
import { useBookLibrary } from '~/composables/use-book-library'
import type { Database } from '~/types/api'
import type { Book, ViewBook } from '~/types/book'
import {
  bookToRecord,
  formatFromFileName,
  parseBookFile,
  planImport,
  recordToBook,
  serializeBooks,
  type ImportPlan,
  type TransferFormat,
  type TransferIssue,
} from '~/services/transfer'

const { getBooks, getAuthors, importBooks, importLibrary, exportLibrary } =
  useBookLibrary()

// ─── Import ──────────────────────────────────────────────────────────────────

const templates: {
  label: string
  value: TransferFormat
  icon: typeof IconFileTypeCsv
}[] = [
  { label: 'CSV template', value: 'csv', icon: IconFileTypeCsv },
  { label: 'JSON template', value: 'json', icon: IconBraces },
]

const previewColumns = {
  coverSrc: { label: 'Cover', checked: false },
}

type Preview = {
  plan: ImportPlan
  rows: ViewBook[]
  issues: TransferIssue[]
  /** Raw backup contents when the file is a full BookLib backup. */
  backup: Database | null
}

const fileInput = ref<HTMLInputElement>()
const fileName = ref('')
const preview = ref<Preview | null>(null)
const selection = ref<RowSelectionState>({})
const importLoading = ref(false)
const importError = ref<string | null>(null)
const importSuccess = ref<string | null>(null)
const isDragging = ref(false)
const showIssues = ref(false)

const selectedRows = computed(() =>
  (preview.value?.rows ?? []).filter(({ id }) => selection.value[id]),
)

const duplicateCount = computed(
  () => preview.value?.plan.items.filter((i) => i.duplicateOf).length ?? 0,
)

const issueSummary = computed(() => {
  const issues = preview.value?.issues ?? []
  const errors = issues.filter((i) => i.severity === 'error').length
  const warnings = issues.length - errors
  return [
    errors && `${errors} ${errors === 1 ? 'row skipped' : 'rows skipped'}`,
    warnings && `${warnings} ${warnings === 1 ? 'warning' : 'warnings'}`,
  ]
    .filter(Boolean)
    .join(' · ')
})

function downloadTemplate(format: TransferFormat) {
  const link = document.createElement('a')
  link.href = `/templates/template.${format}`
  link.download = `booklib-template.${format}`
  link.click()
}

function onUploadClick() {
  fileInput.value?.click()
}

function asBackup(text: string): Database | null {
  try {
    const parsed = JSON.parse(text)
    return parsed &&
      Array.isArray(parsed.books) &&
      Array.isArray(parsed.authors) &&
      Array.isArray(parsed.collections)
      ? (parsed as Database)
      : null
  } catch {
    return null
  }
}

async function processImportFile(file: File) {
  fileName.value = file.name
  importError.value = null
  importSuccess.value = null

  const format = formatFromFileName(file.name)
  if (!format) {
    importError.value = 'Unsupported file type. Use a .csv or .json file.'
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    importError.value = 'The file is larger than 10 MB.'
    return
  }

  importLoading.value = true
  try {
    const text = await file.text()
    const { records, issues, rows } = parseBookFile(text, format)

    if (!records.length) {
      importError.value =
        issues.find((issue) => issue.severity === 'error')?.message ??
        'No books found in the file.'
      return
    }

    const [books, authors] = await Promise.all([getBooks(), getAuthors()])
    const plan = planImport(records, { books, authors })

    const previewRows: ViewBook[] = plan.items.map((item, index) => ({
      ...recordToBook(item.record, `row-${rows[index]}`),
      authorName: item.record.author ?? undefined,
      selected: !item.duplicateOf,
    }))

    selection.value = Object.fromEntries(
      previewRows.map(({ id, selected }) => [id, !!selected]),
    )
    showIssues.value = issues.some((issue) => issue.severity === 'error')
    preview.value = {
      plan,
      rows: previewRows,
      issues,
      backup: format === 'json' ? asBackup(text) : null,
    }
  } catch (error) {
    importError.value =
      error instanceof Error ? error.message : 'The file could not be read.'
  } finally {
    importLoading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

async function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement)?.files?.[0]
  if (file) await processImportFile(file)
}

async function onDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) await processImportFile(file)
}

function onSelectRows(value: RowSelectionState) {
  selection.value = value
}

async function onSubmit() {
  if (!preview.value || !selectedRows.value.length) return
  importLoading.value = true
  try {
    const books: Book[] = selectedRows.value.map(
      ({ authorName: _authorName, selected: _selected, ...book }) => book,
    )
    await importBooks(books)
    preview.value = null
    await navigateTo('/library/books')
  } catch (error) {
    importError.value =
      error instanceof Error ? error.message : 'The books could not be saved.'
  } finally {
    importLoading.value = false
  }
}

async function onRestoreBackup() {
  if (!preview.value?.backup) return
  importLoading.value = true
  try {
    await importLibrary(preview.value.backup)
    preview.value = null
    await navigateTo('/library/books')
  } catch (error) {
    importError.value =
      error instanceof Error
        ? error.message
        : 'The backup could not be restored.'
  } finally {
    importLoading.value = false
  }
}

function onCancel() {
  preview.value = null
  selection.value = {}
}

// ─── Export ──────────────────────────────────────────────────────────────────

type ExportType = 'csv' | 'json' | 'backup'

const exportFormats: {
  label: string
  description: string
  value: ExportType
  icon: typeof IconFileTypeCsv
}[] = [
  {
    label: 'Books (CSV)',
    description: 'For Excel, Numbers and Google Sheets. Re-importable.',
    value: 'csv',
    icon: IconFileTypeCsv,
  },
  {
    label: 'Books (JSON)',
    description: 'Every book field, for other apps. Re-importable.',
    value: 'json',
    icon: IconBraces,
  },
  {
    label: 'Full backup (JSON)',
    description: 'Books, authors, collections and goals. Restorable.',
    value: 'backup',
    icon: IconDatabaseExport,
  },
]

const exportType = ref<ExportType>()
const exportLoading = ref(false)
const totalBooks = ref(0)

onMounted(async () => {
  totalBooks.value = (await getBooks()).length
})

async function onExport() {
  if (!exportType.value) return
  exportLoading.value = true
  try {
    const date = dayjs().format('YYYY-MM-DD')
    if (exportType.value === 'backup') {
      const data = await exportLibrary()
      download(
        `${date}_booklib_backup.json`,
        JSON.stringify(data, null, 2),
        'application/json',
      )
      return
    }

    const [books, authors] = await Promise.all([getBooks(), getAuthors()])
    const authorsById = new Map(authors.map((author) => [author.id, author]))
    const records = books.map((book) => bookToRecord(book, authorsById))
    const format = exportType.value
    download(
      `${date}_booklib_books.${format}`,
      serializeBooks(records, format),
      format === 'csv' ? 'text/csv' : 'application/json',
    )
  } finally {
    exportLoading.value = false
  }
}

function download(name: string, contents: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

useHead({
  title: 'BookLib | Data Management',
})
</script>

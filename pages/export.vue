<template>
  <NuxtLayout name="dashboard" title="Import">
    <div class="flex flex-col items-center gap-12">
      <h2>Export your library</h2>
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
              v-model="exportType"
              :options="exportOptions"
              class="ml-4"
              placeholder="Select file format"
            />
          </div>
          <div class="flex flex-col gap-2">
            <h6>2. Choose data to export</h6>
            <bl-raw-select
              v-model="exportCollection"
              :options="
                exportType === '.csv'
                  ? exportCollectionOptions.filter(
                      (option) => option.value !== 'all',
                    )
                  : exportCollectionOptions
              "
              class="ml-4"
              placeholder="Select data"
            />
          </div>
          <div class="flex flex-col gap-2">
            <h6>3. Export your library</h6>
            <bl-button
              class="ml-4"
              :disabled="!exportType"
              @click="downloadFile"
            >
              <template #prependIcon="prependIcon">
                <IconDownload v-bind="prependIcon" />
              </template>
              {{
                exportType
                  ? `Export ${exportCollection === 'all' ? 'library' : exportCollection} as ${exportType}`
                  : 'Choose file format'
              }}
            </bl-button>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { IconDownload } from '@tabler/icons-vue'
import { pick } from 'lodash'
import type { SelectOption } from '~/components/raw-select.vue'
import type { Book } from '~/types/book'
import type { Collection } from '~/types/collection'
import type { LibraryData } from '~/types/library'

type ExportType = '.csv' | '.json'
type ExportCollectionType = keyof LibraryData | 'all'

const exportOptions: SelectOption[] = [
  { label: 'CSV', value: '.csv' },
  { label: 'JSON', value: '.json' },
]

const exportCollectionOptions: SelectOption[] = [
  { label: 'Everything', value: 'all' },
  { label: 'Books', value: 'books' },
  { label: 'Collections', value: 'collections' },
]

const exportType = ref<ExportType>()
const exportCollection = ref<ExportCollectionType>()

async function fetchLibrary(): Promise<LibraryData> {
  const books = await $fetch<Book[]>('/api/books', {})
  const collections = await $fetch<Collection[]>('/api/collections', {
    query: { withBookCovers: false },
  })

  return { books, collections }
}

function createDownloadLink(
  userName: string,
  collectionType: ExportCollectionType,
  exportType: ExportType,
  data: string,
) {
  const blob = new Blob([data], { type: 'text/plain' })

  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = `${userName}_book_lib_${collectionType}_export${exportType}`
  link.dataset.downloadurl = ['text/json', link.download, link.href].join(':')
  link.target = '_blank'
  link.click()
}

async function downloadAsJson(collectionType: ExportCollectionType) {
  const userName = 'username'
  const userId = 'user_id'

  const libraryData = await fetchLibrary()
  const exportData = {
    [userId]:
      collectionType === 'all'
        ? libraryData
        : pick(libraryData, collectionType),
  }
  const data = JSON.stringify(exportData)

  createDownloadLink(userName, collectionType, '.json', data)
}

async function downloadAsCsv(collectionType: keyof LibraryData) {
  const userName = 'username'

  const libraryData = await fetchLibrary()
  const exportData = libraryData[collectionType]
  // @ts-expect-error wrong typing
  const data = createCsvFile(exportData)

  createDownloadLink(userName, collectionType, '.csv', data)
}

async function downloadFile() {
  if (exportType.value && exportCollection.value) {
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

watch(exportType, (value) => {
  if (value === '.csv' && exportCollection.value === 'all') {
    exportCollection.value = 'books'
  }
})

useHead({
  title: 'BookLib | Export',
})

definePageMeta({
  middleware: 'auth',
})
</script>

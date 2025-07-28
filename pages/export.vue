<template>
  <NuxtLayout name="dashboard" title="Import">
    <div class="flex flex-col items-center">
      <div
        class="flex w-full flex-col gap-12 rounded-3xl border border-accent p-16 md:w-3/5"
      >
        <div class="self-center text-main">
          <IconDownload size="80" stroke="1.5" />
          <h4>Export</h4>
        </div>
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
            :disabled="!exportType || !exportCollection || loading"
            @click="downloadFile"
          >
            <template #prependIcon="prependIcon">
              <IconDownload v-bind="prependIcon" />
            </template>
            {{
              exportType && exportCollection
                ? `Export ${exportCollection === 'all' ? 'library' : exportCollection} as ${exportType}`
                : 'Choose file format'
            }}
            <bl-loading v-if="loading" class="!size-4" />
          </bl-button>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { IconDownload } from '@tabler/icons-vue'
import dayjs from 'dayjs'
import { pick } from 'ramda'
import type { SelectOption } from '~/components/raw-select.vue'
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

const loading = ref<boolean>(false)
const exportType = ref<ExportType>()
const exportCollection = ref<ExportCollectionType>()

async function fetchLibrary(): Promise<LibraryData> {
  const { exportLibrary } = useBookLibrary()

  const data = await exportLibrary()

  return data as LibraryData
}

async function downloadFile() {
  if (exportType.value && exportCollection.value) {
    loading.value = true
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
  const libraryData = await fetchLibrary()
  const exportData =
    collectionType === 'all' ? libraryData : pick([collectionType], libraryData)
  const data = JSON.stringify(exportData)

  createDownloadLink(collectionType, '.json', data)
}

async function downloadAsCsv(collectionType: keyof LibraryData) {
  const libraryData = await fetchLibrary()
  const exportData = libraryData[collectionType]
  // @ts-expect-error wrong typing
  const data = createCsvFile(exportData)

  createDownloadLink(collectionType, '.csv', data)
}

function createDownloadLink(
  collectionType: ExportCollectionType,
  exportType: ExportType,
  data: string,
) {
  const blob = new Blob([data], { type: 'text/plain' })

  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = `${dayjs().format('YYYY-MM-DD')}_booklib_${collectionType}_export${exportType}`
  link.dataset.downloadurl = ['text/json', link.download, link.href].join(':')
  link.target = '_blank'
  link.click()

  loading.value = false
}

watch(exportType, (value) => {
  if (value === '.csv' && exportCollection.value === 'all') {
    exportCollection.value = 'books'
  }
})

useHead({
  title: 'BookLib | Export',
})
</script>

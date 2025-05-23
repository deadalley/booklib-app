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
              v-model="importType"
              :options="importOptions"
              class="ml-4"
              placeholder="Select file format"
            />
          </div>
          <div class="flex flex-col gap-2">
            <h6>2. Export your library</h6>

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
                  ? `Export library as ${importType}`
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
import type { SelectOption } from '~/components/raw-select.vue'
import type { Book } from '~/types/book'
import type { Collection } from '~/types/collection'

type ImportType = '.csv' | '.json'

const importOptions: SelectOption[] = [
  { label: 'CSV', value: '.csv' },
  { label: 'JSON', value: '.json' },
]

const importType = ref<ImportType>()

async function fetchLibrary() {
  const books = await $fetch<Book>('/api/books', {})
  const collections = await $fetch<Collection>('/api/collections', {
    query: { withBookCovers: false },
  })

  return { books, collections }
}

async function downloadAsJson(userId: string, userName: string) {
  const libraryData = await fetchLibrary()
  const data = JSON.stringify({
    [userId]: libraryData,
  })
  const blob = new Blob([data], { type: 'text/plain' })
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = `${userName}_book_lib_export.json`
  link.dataset.downloadurl = ['text/json', link.download, link.href].join(':')
  link.target = '_blank'
  link.click()
}

async function downloadFile() {
  const userId = 'user_id'
  const username = 'username'
  if (importType.value && userId && username) {
    switch (importType.value) {
      case '.json':
        return downloadAsJson(userId, username)
      case '.csv':
      default:
        return
    }
  }
}

useHead({
  title: 'BookLib | Export',
})

definePageMeta({
  middleware: 'auth',
})
</script>

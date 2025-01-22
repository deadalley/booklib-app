<template>
  <NuxtLayout name="dashboard" title="Import">
    <div class="flex flex-col items-center gap-12">
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
            <bl-button class="ml-4" :disabled="!importType">
              <template #prependIcon="prependIcon">
                <IconUpload v-bind="prependIcon" />
              </template>
              {{ importType ? 'Upload file' : 'Choose file format' }}</bl-button
            >
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { IconDownload, IconUpload } from '@tabler/icons-vue'
import type { SelectOption } from '~/components/raw-select.vue'

type ImportType = '.csv'

const importType = ref<ImportType>()
const importOptions: SelectOption[] = [{ label: '.CSV', value: '.csv' }]

function downloadFile() {
  console.log(importType.value)
  if (importType.value) {
    const link = document.createElement('a')
    link.href = `/templates/template${importType.value}`
    link.download = `template${importType.value}`
    link.target = '_blank'
    link.click()
  }
}

useHead({
  title: 'BookLib | Import',
})

definePageMeta({
  middleware: 'auth',
})
</script>

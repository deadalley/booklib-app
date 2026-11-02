<template>
  <div class="flex flex-col gap-3">
    <div class="book-page-cover-frame relative">
      <bl-loading
        v-if="loading"
        class="absolute top-1/2 left-1/2 -translate-1/2"
      />
      <NuxtImg
        v-else-if="coverSrc"
        :src="coverSrc"
        :alt="book.title"
        class="size-full object-cover object-center"
      />
      <bl-empty-book-image
        v-else
        class="rounded-none! p-4! text-base!"
        :icon-size="28"
      >
        {{ book.title }}
      </bl-empty-book-image>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="onFileChange"
    />

    <bl-tooltip :disabled="!coversUnavailable">
      <template #tooltip-content>
        <template v-if="isAndroid">
          Uploading custom book covers is not available on Android yet.
        </template>
        <template v-else>
          You are running a
          <b class="contents">demo</b>
          version of BookLib. Uploading custom book covers is not available in
          this version.
        </template>
      </template>
      <div class="flex flex-wrap gap-2">
        <bl-button
          variant="secondary"
          :disabled="coversUnavailable || loading"
          @click="onUploadClick"
        >
          <template #prependIcon="iconProps">
            <IconUpload v-bind="iconProps" />
          </template>
          {{ coverSrc ? 'Replace' : 'Upload cover' }}
        </bl-button>
        <bl-button
          v-if="coverSrc"
          variant="tertiary"
          :disabled="loading"
          @click="onRemoveClick"
        >
          Remove
        </bl-button>
      </div>
    </bl-tooltip>
  </div>
</template>

<script setup lang="ts">
import { IconUpload } from '@tabler/icons-vue'
import type { Book } from '~/types/book'
import { getAppPlatform, supportsCoverUploads } from '~/utils/platform'

const fileInput = ref<HTMLInputElement>()

const props = defineProps<{
  book: Book
  tempCoverSrc?: string
}>()

const loading = ref(false)
// Local covers come back with a ?v=<timestamp> query, so a replaced image
// gets a new URL and is not served from the cache.
const coverSrc = ref<string | null>(props.book.coverSrc ?? null)

const { updateBookCover, deleteBookCover } = useBookLibrary()

// Cover files are stored by the desktop app; the web demo and Android
// app can't upload them yet.
const coversUnavailable = ref<boolean>(!supportsCoverUploads())
const isAndroid = getAppPlatform() === 'android'

const coverId = computed(() => props.book.id ?? props.tempCoverSrc ?? '')

function onUploadClick() {
  fileInput.value?.click()
}

async function onFileChange(e: Event) {
  if (coversUnavailable.value) return

  const input = e.target as HTMLInputElement
  const file = input?.files?.[0]
  if (!file) return

  loading.value = true
  try {
    const newCoverSrc = await updateBookCover(coverId.value, file)
    if (newCoverSrc) coverSrc.value = newCoverSrc
  } finally {
    loading.value = false
    // Allow picking the same file again
    input.value = ''
  }
}

async function onRemoveClick() {
  loading.value = true
  try {
    await deleteBookCover(coverId.value)
    coverSrc.value = null
  } finally {
    loading.value = false
  }
}
</script>

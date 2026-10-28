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

    <bl-tooltip :disabled="!isWebEnvironment">
      <template #tooltip-content>
        You are running a
        <b class="contents">demo</b>
        version of BookLib. Uploading custom book covers is not available in
        this version.
      </template>
      <div class="flex flex-wrap gap-2">
        <bl-button
          variant="secondary"
          :disabled="isWebEnvironment || loading"
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

const fileInput = ref<HTMLInputElement>()

const props = defineProps<{
  book: Book
  tempCoverSrc?: string
}>()

const loading = ref(false)
const coverSrc = ref<string | null>(
  props.book.coverSrc && `${props.book.coverSrc}#${randomInt(1000, 1_000_000)}`,
)

const { handleFileInput } = useFileStorage()
const { updateBookCover, deleteBookCover } = useBookLibrary()

const isWebEnvironment = ref<boolean>(
  typeof window !== 'undefined' && !('electronAPI' in window),
)

const coverId = computed(() => props.book.id ?? props.tempCoverSrc ?? '')

function onUploadClick() {
  fileInput.value?.click()
}

async function onFileChange(e: Event) {
  if (isWebEnvironment.value) return

  await handleFileInput(e)

  const file = (e.target as HTMLInputElement)?.files?.[0]
  if (!file) return

  loading.value = true

  const newCoverSrc = await updateBookCover(coverId.value, file)

  if (newCoverSrc) {
    coverSrc.value = `${newCoverSrc}#${randomInt(1000, 1_000_000)}`
  }
  loading.value = false
}

async function onRemoveClick() {
  loading.value = true

  await deleteBookCover(coverId.value)
  coverSrc.value = null
  loading.value = false
}
</script>

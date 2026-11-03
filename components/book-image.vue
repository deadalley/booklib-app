<template>
  <bl-tooltip
    class="relative inline-flex h-min w-full flex-col items-center gap-3 rounded-xl lg:flex-1"
    :disabled="!coversUnavailable"
  >
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
    <div
      class="border-stroke relative inline-flex h-min w-full flex-col items-center gap-3 rounded-xl border lg:flex-1"
      :class="{ 'justify-center': loading }"
      @mouseenter="setHovered(true)"
      @mouseleave="setHovered(false)"
    >
      <input
        ref="fileInput"
        type="file"
        class="hidden"
        @change="onFileChange"
      />
      <bl-icon-button
        v-if="editing"
        class="absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300"
        :class="{
          'opacity-0': !hovered,
          'opacity-100': hovered,
        }"
        @click="onUploadClick()"
      >
        <template #default="iconProps">
          <IconUpload v-bind="iconProps" />
        </template>
      </bl-icon-button>
      <bl-icon-button
        v-if="editing"
        class="absolute top-0 right-0 z-20 -translate-x-1/2 translate-y-1/2 transition-opacity duration-300"
        :class="{
          'opacity-0': !hovered,
          'opacity-100': hovered,
        }"
        @click="onRemoveClick()"
      >
        <template #default="iconProps">
          <IconX v-bind="iconProps" />
        </template>
      </bl-icon-button>
      <div
        v-if="editing"
        class="bg-surface-inverse absolute inset-0 z-10 size-full rounded-xl transition-opacity duration-300"
        :class="{
          'opacity-0': !hovered,
          'opacity-60': hovered,
          'cursor-pointer': !coversUnavailable,
        }"
        @click="onUploadClick()"
      />
      <bl-loading v-if="loading" />
      <NuxtImg
        v-if="coverSrc && !loading"
        :src="coverSrc"
        :alt="book.title"
        class="size-full rounded-xl object-cover object-center"
      />
      <bl-empty-book-image
        v-if="!coverSrc && !loading"
        :label="book.title"
        class="!lg:h-[600px] h-[400px]"
        :class="imgSizeClass"
      />
    </div>
  </bl-tooltip>
</template>

<script setup lang="ts">
import { IconUpload, IconX } from '@tabler/icons-vue'
import type { Book } from '~/types/book'
import { getAppPlatform, supportsCoverUploads } from '~/utils/platform'

const fileInput = ref()

const props = defineProps<{
  book: Book
  editing?: boolean
  tempCoverSrc?: string
  imgSizeClass?: string
}>()

const loading = ref(false)
// Local covers come back with a ?v=<timestamp> query, so a replaced image
// gets a new URL and is not served from the cache.
const coverSrc = ref<string | null>(props.book.coverSrc ?? null)
const hovered = ref(false)

const { updateBookCover, deleteBookCover } = useBookLibrary()

// Cover files are stored by the desktop app; the web demo and Android
// app can't upload them yet.
const coversUnavailable = ref<boolean>(!supportsCoverUploads())
const isAndroid = getAppPlatform() === 'android'

function setHovered(value: boolean) {
  if (coversUnavailable.value) return

  hovered.value = value
}

function onUploadClick() {
  fileInput.value.click()
}

async function onFileChange(e: Event) {
  if (coversUnavailable.value) return

  const input = e.target as HTMLInputElement
  const file = input?.files?.[0]
  if (!file) return

  loading.value = true
  try {
    const newCoverSrc = await updateBookCover(
      props.book.id ?? props.tempCoverSrc!,
      file,
    )
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
    await deleteBookCover(props.book.id ?? props.tempCoverSrc!)
    coverSrc.value = null
  } finally {
    loading.value = false
  }
}
</script>

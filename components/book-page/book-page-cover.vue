<template>
  <bl-tooltip
    class="relative inline-flex w-full flex-col items-stretch"
    :disabled="!isWebEnvironment"
  >
    <template #tooltip-content>
      You are running a
      <b class="contents">demo</b>
      version of BookLib. Uploading custom book covers is not available in this
      version.
    </template>

    <div
      class="group/cover paper relative inline-flex flex-col items-stretch overflow-hidden p-6"
      :class="{ 'cursor-pointer': !isWebEnvironment }"
      @mouseenter="setHovered(true)"
      @mouseleave="setHovered(false)"
    >
      <!-- Main cover container -->
      <div
        class="bg-surface-canvas rounded-scholarly relative inline-flex flex-col items-center justify-center"
        :class="{ 'justify-center': loading }"
      >
        <input
          ref="fileInput"
          type="file"
          class="hidden"
          @change="onFileChange"
        />

        <!-- Upload overlay (editing mode) -->
        <div
          v-if="editing"
          class="rounded-scholarly absolute inset-0 z-10 transition-colors duration-300"
          :class="{ 'bg-surface-dark/60': hovered, 'bg-transparent': !hovered }"
          @click="onUploadClick()"
        />

        <!-- Edit button -->
        <bl-icon-button
          v-if="editing && !loading"
          class="absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
          :class="{
            'scale-100 opacity-100': hovered,
            'scale-75 opacity-0': !hovered,
          }"
          @click="onUploadClick()"
        >
          <template #default="iconProps">
            <IconUpload v-bind="iconProps" />
          </template>
        </bl-icon-button>

        <!-- Remove button -->
        <bl-icon-button
          v-if="editing && coverSrc && !loading"
          class="absolute top-3 right-3 z-20 transition-all duration-300"
          :class="{
            'scale-100 opacity-100': hovered,
            'scale-75 opacity-0': !hovered,
          }"
          @click.stop="onRemoveClick()"
        >
          <template #default="iconProps">
            <IconX v-bind="iconProps" />
          </template>
        </bl-icon-button>

        <!-- Loading state -->
        <bl-loading v-if="loading" />

        <!-- Actual book image -->
        <NuxtImg
          v-if="coverSrc && !loading"
          :src="coverSrc"
          :alt="book.title"
          class="size-full object-cover object-center"
        />

        <!-- Empty state -->
        <bl-empty-book-image
          v-if="!coverSrc && !loading"
          :label="book.title"
          class="h-116 sm:h-132"
        />
      </div>
    </div>
  </bl-tooltip>
</template>

<script setup lang="ts">
import { IconUpload, IconX } from '@tabler/icons-vue'
import type { Book } from '~/types/book'

const fileInput = ref()

const props = defineProps<{
  book: Book
  editing?: boolean
}>()

const loading = ref(false)
const coverSrc = ref<string | null>(
  props.book.coverSrc && `${props.book.coverSrc}#${randomInt(1000, 1_000_000)}`,
)
const hovered = ref(false)

const { handleFileInput } = useFileStorage()
const { updateBookCover, deleteBookCover } = useBookLibrary()

const isWebEnvironment = ref<boolean>(
  typeof window !== 'undefined' && !('electronAPI' in window),
)

function setHovered(value: boolean) {
  if (isWebEnvironment.value) return

  hovered.value = value
}

function onUploadClick() {
  fileInput.value.click()
}

async function onFileChange(e: Event) {
  if (isWebEnvironment.value) return

  await handleFileInput(e)
  loading.value = true

  const file = (e.target as HTMLInputElement)?.files?.[0]
  if (!file) return

  const newCoverSrc = await updateBookCover(props.book.id ?? '', file)

  if (newCoverSrc) {
    coverSrc.value = `${newCoverSrc}#${randomInt(1000, 1_000_000)}`
  }
  loading.value = false
}

async function onRemoveClick() {
  loading.value = true

  await deleteBookCover(props.book.id ?? '')
  coverSrc.value = null
  loading.value = false
}
</script>

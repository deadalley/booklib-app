<template>
  <div
    class="relative inline-flex h-min w-full flex-col items-center gap-3 rounded-xl lg:flex-1"
    :class="{ 'justify-center': loading }"
    @mouseenter="setHovered(true)"
    @mouseleave="setHovered(false)"
  >
    <input ref="fileInput" type="file" class="hidden" @change="onFileChange" />
    <bl-icon-button
      v-if="editing"
      class="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300"
      :class="{
        'opacity-0': !hovered,
        'opacity-100': hovered,
      }"
    >
      <template #default="iconProps">
        <IconUpload v-bind="iconProps" />
      </template>
    </bl-icon-button>
    <div
      v-if="editing"
      class="absolute inset-0 z-10 size-full cursor-pointer rounded-xl bg-black transition-opacity duration-300"
      :class="{
        'opacity-0': !hovered,
        'opacity-60': hovered,
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
    />
  </div>
</template>

<script setup lang="ts">
import { IconUpload } from '@tabler/icons-vue'
import type { Book } from '~/types/book'

const fileInput = ref()

const props = defineProps<{
  book: Book
  editing?: boolean
  tempCoverSrc?: string
}>()

const loading = ref(false)
const coverSrc = ref<string | null>(
  props.book.coverSrc && `${props.book.coverSrc}#${randomInt(1000, 1_000_000)}`,
)
const hovered = ref(false)

const { handleFileInput, files } = useFileStorage()

function setHovered(value: boolean) {
  hovered.value = value
}

function onUploadClick() {
  fileInput.value.click()
}

async function onFileChange(e: Event) {
  await handleFileInput(e)
  loading.value = true
  // const file = (e.target as HTMLInputElement)?.files?.[0] as File

  // const formData = new FormData()
  // formData.append('bookId', file, `${props.book.id ?? props.tempCoverSrc}`)

  try {
    console.log('AAAAA')
    const newCoverSrc = await $fetch(
      `/api/books/${props.book.id ?? props.tempCoverSrc}/cover`,
      {
        method: 'post',
        body: {
          bookId: props.book.id ?? props.tempCoverSrc,
          file: files.value[0],
        },
        // body: formData,
      },
    )

    coverSrc.value = `${newCoverSrc}#${randomInt(1000, 1_000_000)}`
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

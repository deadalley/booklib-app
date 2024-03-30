<template>
  <div
    class="relative inline-flex h-min flex-col items-center gap-3 rounded-m lg:flex-1"
    :class="{ 'justify-center': loading }"
    @mouseenter="setHovered(true)"
    @mouseleave="setHovered(false)"
  >
    <input ref="fileInput" type="file" class="hidden" @change="onFileChange" />
    <bl-icon-button
      v-if="editing && hovered"
      class="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 !bg-gray !text-gray-dark"
    >
      <template #default="iconProps">
        <IconUpload v-bind="iconProps" />
      </template>
    </bl-icon-button>
    <div
      v-if="editing && hovered"
      class="absolute inset-0 z-10 size-full cursor-pointer rounded-m bg-gray-dark opacity-60 transition-opacity duration-300"
      @click="onUploadClick()"
    ></div>
    <bl-loading v-if="loading"></bl-loading>
    <NuxtImg
      v-if="coverSrc && !loading"
      :src="coverSrc"
      :alt="book.title"
      class="size-full rounded-m object-cover object-center"
    />
    <bl-empty-book-image
      v-if="!coverSrc && !loading"
      class="!lg:h-[600px] h-[400px]"
    ></bl-empty-book-image>
  </div>
</template>

<script setup lang="ts">
import { IconUpload } from '@tabler/icons-vue'
import type { Book } from '~/types/book'

const fileInput = ref()

const props = defineProps<{
  book: Book
  editing: boolean
  tempCoverSrc?: string
}>()

const loading = ref(false)
const coverSrc = ref(props.book.coverSrc)
const hovered = ref(false)

function setHovered(value: boolean) {
  hovered.value = value
}

function onUploadClick() {
  fileInput.value.click()
}

async function onFileChange(e: any) {
  loading.value = true
  const file = e.target.files[0] as File

  const formData = new FormData()
  formData.append('img', file, `${props.book.id ?? props.tempCoverSrc}`)

  try {
    const newCoverSrc = await $fetch(
      `/api/books/${props.book?.id ?? props.tempCoverSrc}/cover`,
      {
        method: 'post',
        body: formData,
      },
    )

    coverSrc.value = newCoverSrc
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

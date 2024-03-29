<template>
  <div
    class="relative inline-flex flex-col items-center gap-3 flex-1 h-3/5 rounded-m"
    :class="{ 'justify-center': pending }"
    @mouseenter="setHovered(true)"
    @mouseleave="setHovered(false)"
  >
    <input ref="fileInput" type="file" class="hidden" @change="onFileChange" />
    <bl-icon-button
      v-if="editing && hovered"
      class="absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 !bg-gray !text-gray-dark"
    >
      <template #default="iconProps">
        <IconUpload v-bind="iconProps" />
      </template>
    </bl-icon-button>
    <div
      v-if="editing && hovered"
      class="absolute inset-0 z-10 bg-gray-dark opacity-60 transition-opacity duration-300 rounded-m cursor-pointer"
      @click="onUploadClick()"
    ></div>
    <bl-loading v-if="pending"></bl-loading>
    <img
      v-if="coverSrc && !pending"
      :src="coverSrc"
      :alt="alt"
      class="rounded-m h-full w-full object-center object-cover"
    />
    <bl-empty-book-image v-if="!pending && !coverSrc"></bl-empty-book-image>
  </div>
</template>

<script setup lang="ts">
import { IconUpload } from '@tabler/icons-vue'

const fileInput = ref()

const props = defineProps({
  bookId: {
    type: Number,
    required: false,
  },
  alt: {
    type: String,
    default: 'Book cover',
  },
  editing: {
    type: Boolean,
    default: true,
  },
})

const hovered = ref(false)

const {
  data: coverSrc,
  pending,
  refresh,
} = await useFetch<string>(`/api/books/${props.bookId}/cover`, {
  lazy: true,
})

function setHovered(value: boolean) {
  hovered.value = value
}

function onUploadClick() {
  fileInput.value.click()
}

async function onFileChange(e: any) {
  const file = e.target.files[0] as File

  const formData = new FormData()
  formData.append('img', file, `${props.bookId}`)

  try {
    await $fetch(`/api/books/${props.bookId}/cover`, {
      method: 'post',
      body: formData,
    })

    refresh()
  } catch (error) {
    console.error(error)
  }
}
</script>

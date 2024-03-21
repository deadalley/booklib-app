<template>
  <div
    class="relative inline-flex flex-col items-center gap-3 flex-1 h-3/5 rounded-m"
    @mouseenter="setHovered(true)"
    @mouseleave="setHovered(false)"
  >
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
    ></div>
    <img
      v-if="coverSrc"
      :src="coverSrc"
      :alt="alt"
      class="rounded-m h-full w-full object-center object-cover"
    />
    <!-- <bl-empty-book-image v-if="!coverSrc"></bl-empty-book-image> -->
    <div
      v-if="!coverSrc"
      class="bg-gray-light p-10 w-full rounded-m h-full relative"
    >
      <div
        class="h-full w-full flex flex-col items-center justify-center border-2 border-gray-dark border-dashed rounded-m text-gray-dark gap-3"
      >
        <IconPhoto :size="40" :stroke-width="1.5" />
        <h6 class="leading-tight text-center text-gray-dark font-normal">
          Book
          <br />
          Cover
        </h6>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconUpload } from '@tabler/icons-vue'
defineProps({
  coverSrc: {
    type: String,
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

function setHovered(value: boolean) {
  hovered.value = value
}
</script>

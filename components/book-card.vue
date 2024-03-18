<template>
  <div class="inline-flex flex-col items-center gap-3">
    <img :src="coverSrc" :alt="title" class="rounded-2xl" />
    <div class="flex-col w-full">
      <h4 class="text-lg font-semibold">{{ title }}</h4>
      <p class="text-sm text-gray-600">{{ author }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  coverSrc: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
})
</script>

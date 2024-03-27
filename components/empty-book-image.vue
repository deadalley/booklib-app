<template>
  <div
    class="bg-gray-light p-10 w-full rounded-m h-full relative"
    v-bind="$attrs"
  >
    <div
      class="h-full w-full flex flex-col items-center justify-center border-2 border-gray-dark border-dashed rounded-[inherit] text-gray-dark gap-3"
    >
      <IconPhoto :size="40" :stroke="1.5" />
      <h6 class="leading-tight text-center text-gray-dark font-normal">
        Book
        <br />
        Cover
      </h6>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconPhoto } from '@tabler/icons-vue'
</script>

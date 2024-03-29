<template>
  <div class="relative size-full rounded-m bg-gray-light p-10" v-bind="$attrs">
    <div
      class="flex size-full flex-col items-center justify-center gap-3 rounded-[inherit] border-2 border-dashed border-gray-dark text-gray-dark"
    >
      <IconPhoto :size="40" stroke="1.5" />
      <h6 class="text-center font-normal leading-tight text-gray-dark">
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

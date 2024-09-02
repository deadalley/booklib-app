<template>
  <div
    class="relative size-full w-full rounded-lg bg-accent-light p-10"
    v-bind="$attrs"
  >
    <div
      class="flex size-full w-full flex-col items-center justify-center gap-3 rounded-[inherit] border-2 border-dashed border-accent-dark text-accent-dark"
    >
      <IconPhoto :size="40" stroke="1.5" />
      <h6 class="text-center font-normal leading-tight text-black">
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

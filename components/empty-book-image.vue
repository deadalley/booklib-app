<template>
  <div
    class="size-full rounded-lg bg-accent-light p-10 text-lg"
    v-bind="$attrs"
  >
    <div
      class="flex size-full w-full flex-col items-center justify-center gap-3 rounded-[inherit] border-2 border-dashed border-accent-dark text-accent-dark"
    >
      <IconPhoto :size="iconSize" stroke="1.5" />
      <span
        class="w-full truncate text-center font-normal leading-tight text-black"
      >
        <template v-if="!label">
          Book
          <br />
          Cover
        </template>
        {{ label }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconPhoto } from '@tabler/icons-vue'

withDefaults(defineProps<{ iconSize?: number; label?: string }>(), {
  iconSize: 40,
})
</script>

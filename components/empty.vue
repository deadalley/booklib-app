<template>
  <div
    class="flex flex-col items-center justify-center gap-8 rounded-xl bg-accent-light px-4 py-16"
  >
    <component
      :is="icons[icon]"
      class="text-accent-dark"
      size="58"
      stroke="1"
    />
    <div class="flex flex-col items-center justify-center gap-4">
      <slot name="label" />
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { icons } from '@tabler/icons-vue'

defineProps<{ icon: keyof typeof icons }>()
</script>

<template>
  <TabsTrigger
    v-bind="$attrs"
    :value="value"
    class="text-ink-muted hover:text-ink-primary data-[state=active]:text-primary focus-visible:ring-primary/25 rounded-scholarly flex cursor-pointer items-center justify-center px-4 py-2.5 text-xs font-bold tracking-[0.18em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"
  >
    <slot />
  </TabsTrigger>
</template>

<script setup lang="ts">
import { TabsTrigger } from 'radix-vue'

defineProps<{
  value: string
}>()
</script>

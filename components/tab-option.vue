<template>
  <TabsTrigger
    v-bind="$attrs"
    :value="value"
    class="font-display text-ink-secondary hover:text-primary data-[state=active]:text-primary flex cursor-pointer items-center justify-center px-4 py-2 font-normal focus-visible:relative data-[state=active]:font-medium"
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

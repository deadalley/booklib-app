<template>
  <TabsTrigger
    v-bind="$attrs"
    :value="value"
    class="flex cursor-pointer items-center justify-center px-4 py-2 font-display font-normal text-ink-secondary hover:text-primary focus-visible:relative data-[state=active]:font-medium data-[state=active]:text-primary"
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

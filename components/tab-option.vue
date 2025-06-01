<template>
  <TabsTrigger
    v-bind="$attrs"
    :value="value"
    class="flex cursor-pointer items-center justify-center px-4 py-2 font-ReemKufi font-normal text-accent-darker hover:text-main focus-visible:relative data-[state=active]:font-medium data-[state=active]:text-main"
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

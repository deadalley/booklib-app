<template>
  <TabsRoot class="flex w-full flex-col" :default-value="defaultValue">
    <TabsList
      class="relative flex shrink-0 border-b border-accent"
      aria-label="Manage your account"
    >
      <TabsIndicator
        class="absolute bottom-0 left-0 h-[2px] w-[--radix-tabs-indicator-size] translate-x-[--radix-tabs-indicator-position] translate-y-px rounded-full transition-[width,transform] duration-300"
      >
        <div class="size-full bg-main" />
      </TabsIndicator>
      <slot name="options" :class="{ 'flex-1': full }" />
    </TabsList>
    <slot />
  </TabsRoot>
</template>

<script setup lang="ts">
import { TabsIndicator, TabsList, TabsRoot } from 'radix-vue'

withDefaults(
  defineProps<{
    defaultValue?: string
    orientation?: 'horizontal' | 'vertical'
    full?: boolean
  }>(),
  { orientation: 'vertical' },
)
</script>

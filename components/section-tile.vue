<template>
  <NuxtLink
    :to="href"
    class="hover:bg-surface-subtle paper flex flex-1 cursor-pointer items-center gap-3 px-4 py-6 sm:flex-col sm:justify-center sm:py-8"
  >
    <component
      :is="icons[icon]"
      class="text-primary size-8 sm:size-12"
      stroke="1.5"
    />
    <h5><slot name="label" /></h5>
    <bl-total-tag v-if="$slots['total']">
      <slot name="total" />
    </bl-total-tag>
    <slot />
  </NuxtLink>
</template>

<script setup lang="ts">
import { icons } from '@tabler/icons-vue'

defineProps<{
  href: string
  icon: keyof typeof icons
}>()
</script>

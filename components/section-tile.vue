<template>
  <NuxtLink
    :to="href"
    class="flex flex-1 cursor-pointer items-center gap-3 rounded-xl border border-stroke bg-surface-elevated px-4 py-6 hover:bg-surface-subtle sm:flex-col sm:justify-center sm:py-8"
  >
    <component
      :is="icons[icon]"
      class="size-8 text-primary sm:size-12"
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

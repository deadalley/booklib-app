<template>
  <div
    v-bind="$attrs"
    class="flex flex-col items-center justify-center gap-8 rounded-xl px-4 py-16"
    :class="{
      'bg-white': variant === 'primary',
      'bg-accent-light': variant === 'secondary',
    }"
  >
    <component
      :is="icons[icon]"
      class="text-accent-dark"
      :class="{
        'text-accent-darker': variant === 'primary',
        'text-accent-dark': variant === 'secondary',
      }"
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

withDefaults(
  defineProps<{
    icon: keyof typeof icons
    variant?: 'primary' | 'secondary'
  }>(),
  { variant: 'secondary' },
)
</script>

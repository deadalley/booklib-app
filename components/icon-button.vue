<template>
  <button
    class="inline-flex h-8 w-8 items-center justify-center gap-2 rounded-3xl text-base font-medium"
    :class="{
      'bg-main text-white hover:bg-main/90 active:bg-main-dark active:shadow-inner-m':
        variant === 'primary',
      'bg-accent-light text-black ring-inset hover:bg-accent-light/20 hover:ring-1 hover:ring-accent active:bg-accent-dark active:shadow-inner-m':
        variant === 'secondary',
      'border border-accent p-2 text-accent-dark hover:bg-accent-light/20':
        variant === 'tertiary',
      'bg-gray-light text-gray': !!disabled,
    }"
    :disabled="disabled"
  >
    <slot :size="ICON_SIZE_SMALL" stroke="1.5" />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    compact?: boolean
    disabled?: boolean
    variant?: 'primary' | 'secondary' | 'tertiary'
  }>(),
  { variant: 'primary' },
)
</script>

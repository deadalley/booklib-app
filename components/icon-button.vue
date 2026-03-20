<template>
  <button
    class="inline-flex size-8 items-center justify-center gap-2 rounded-3xl text-base font-medium"
    :class="{
      'bg-primary text-ink-inverse': variant === 'primary',
      'hover:bg-primary/90 active:bg-primary-800':
        variant === 'primary' && !disabled,
      'bg-surface-subtle text-ink-primary': variant === 'secondary',
      'hover:bg-surface-elevated hover:ring-1 hover:ring-inset hover:ring-stroke-strong active:bg-surface-subtle':
        variant === 'secondary' && !disabled,
      'border border-stroke p-2 text-ink-primary': variant === 'tertiary',
      'hover:bg-surface-subtle active:bg-surface':
        variant === 'tertiary' && !disabled,
      '!bg-surface-subtle !text-ink-muted': !!disabled && !keepStyle,
      'cursor-pointer': !disabled,
    }"
    :disabled="disabled"
  >
    <slot :size="ICON_SIZE_SMALL" stroke="1.5" />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    disabled?: boolean
    variant?: 'primary' | 'secondary' | 'tertiary'
    keepStyle?: boolean // when button is disabled but is displayed in the same style
  }>(),
  { variant: 'primary' },
)
</script>

<template>
  <button
    class="inline-flex size-8 items-center justify-center gap-2 rounded-3xl text-base font-medium"
    :class="{
      'bg-main text-white hover:bg-main/90 active:bg-main-dark':
        variant === 'primary',
      'bg-accent-light text-black hover:bg-white hover:ring-1 hover:ring-inset hover:ring-accent-dark active:bg-accent-light':
        variant === 'secondary',
      'border border-accent p-2 text-black hover:bg-accent-light active:bg-accent':
        variant === 'tertiary',
      '!bg-accent-light !text-accent-dark': !!disabled && !keepStyle,
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

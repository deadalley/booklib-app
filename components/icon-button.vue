<template>
  <button
    type="button"
    class="button"
    :class="{
      'p-1': size === 'sm',
      'p-2': size === 'md',
      'size-11 p-0': size === 'lg',
      'button-primary': variant === 'primary',
      'button-secondary': variant === 'secondary',
      'button-tertiary': variant === 'tertiary',
      'button-disabled': !!disabled && !keepStyle,
      'cursor-pointer': !disabled,
      ...(typeof $attrs.class === 'string' ? { [$attrs.class]: true } : {}),
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
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { variant: 'primary', size: 'md' },
)
</script>

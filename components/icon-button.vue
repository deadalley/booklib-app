<template>
  <button
    type="button"
    class="button p-2"
    :class="{
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
  }>(),
  { variant: 'primary' },
)
</script>

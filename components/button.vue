<template>
  <button
    v-bind="$attrs"
    type="button"
    class="button"
    :class="{
      'button-primary': variant === 'primary',
      'button-secondary': variant === 'secondary',
      'button-tertiary': variant === 'tertiary',
      'button-disabled': !!disabled || !!loading,
      primary: color === 'primary' && !disabled && !loading,
      secondary: color === 'secondary' && !disabled && !loading,
      [size]: !!size,
      'cursor-pointer': !disabled && !loading,
      'w-full flex-1': !!expand,
      'py-2': size === 'md' || size === 'lg',
      'py-1': size === 'sm',
      'px-2':
        !$slots['default'] && ($slots['prependIcon'] || $slots['appendIcon']),
      'px-4': !(
        !$slots['default'] &&
        ($slots['prependIcon'] || $slots['appendIcon'])
      ),
    }"
    :disabled="disabled"
  >
    <slot name="prependIcon" :size="ICON_SIZE_SMALL" stroke="1.5" />
    <slot />
    <slot name="appendIcon" :size="ICON_SIZE_SMALL" stroke="1.5" />
    <bl-loading v-if="loading" class="size-4!" />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    expand?: boolean
    disabled?: boolean
    loading?: boolean
    variant?: 'primary' | 'secondary' | 'tertiary'
    color?: 'primary' | 'secondary'
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { variant: 'primary', size: 'md' },
)
</script>

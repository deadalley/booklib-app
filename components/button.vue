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
      'cursor-pointer': !disabled && !loading,
      'w-full flex-1': !!expand,
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
    <bl-loading v-if="loading" class="!size-4" />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    expand?: boolean
    disabled?: boolean
    loading?: boolean
    variant?: 'primary' | 'secondary' | 'tertiary'
  }>(),
  { variant: 'primary' },
)
</script>

<template>
  <button
    v-bind="$attrs"
    type="button"
    class="flex h-min w-fit items-center justify-center gap-2 whitespace-nowrap rounded-xl py-2 text-base font-medium lg:inline-flex lg:grow-0"
    :class="{
      'bg-primary text-ink-inverse hover:bg-primary/90 active:bg-primary-800':
        variant === 'primary',
      'bg-surface-subtle text-ink-primary hover:bg-surface-elevated hover:ring-1 hover:ring-inset hover:ring-stroke-strong active:bg-surface-subtle':
        variant === 'secondary',
      'border border-stroke bg-surface-elevated p-2 text-ink-primary hover:bg-surface-subtle active:bg-surface':
        variant === 'tertiary',
      '!bg-surface-subtle !text-ink-muted': !!disabled || !!loading,
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

<template>
  <button
    v-bind="$attrs"
    type="button"
    class="flex h-min w-fit items-center justify-center gap-2 whitespace-nowrap rounded-xl py-2 text-base font-medium lg:inline-flex lg:grow-0"
    :class="{
      'bg-main text-white hover:bg-main/90 active:bg-main-dark':
        variant === 'primary',
      'bg-accent-light text-black hover:bg-white hover:ring-1 hover:ring-inset hover:ring-accent-dark active:bg-accent-light':
        variant === 'secondary',
      'border border-accent bg-white p-2 text-black hover:bg-accent-light active:bg-accent':
        variant === 'tertiary',
      '!bg-accent-light !text-accent-dark': !!disabled || !!loading,
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

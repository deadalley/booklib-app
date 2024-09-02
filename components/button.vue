<template>
  <button
    v-bind="$attrs"
    type="button"
    class="flex h-min w-fit items-center justify-center gap-2 whitespace-nowrap rounded-lg px-5 py-2 text-base font-medium transition-all lg:inline-flex lg:grow-0"
    :class="{
      'bg-main text-white hover:bg-main/90 active:bg-main-dark active:shadow-inner-m':
        variant === 'primary',
      'bg-accent-light text-black ring-inset hover:bg-accent-light/20 hover:ring-1 hover:ring-accent active:bg-accent-dark active:shadow-inner-m':
        variant === 'secondary',
      'border border-accent p-2 text-black hover:bg-accent-light/20':
        variant === 'tertiary',
      '!bg-accent !text-accent-dark': !!disabled,
      'w-full flex-1': !!expand,
    }"
    :disabled="disabled"
  >
    <slot name="prependIcon" :size="ICON_SIZE_SMALL" stroke="1.5" />
    <slot />
    <slot name="appendIcon" :size="ICON_SIZE_SMALL" stroke="1.5" />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    expand?: boolean
    disabled?: boolean
    variant?: 'primary' | 'secondary' | 'tertiary'
  }>(),
  { variant: 'primary' },
)
</script>

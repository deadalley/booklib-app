<template>
  <button
    v-bind="$attrs"
    type="button"
    class="flex h-min w-fit items-center justify-center gap-2 whitespace-nowrap rounded-3xl text-base font-medium transition-all lg:inline-flex lg:grow-0"
    :class="classes.wrapper"
    :disabled="disabled"
  >
    <slot name="prependIcon" :size="iconSize" stroke="1.5"></slot>
    <slot></slot>
    <slot name="appendIcon" :size="iconSize" stroke="1.5"></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    expand?: boolean
    compact?: boolean
    disabled?: boolean
    variant?: 'primary' | 'secondary' | 'tertiary'
  }>(),
  { variant: 'primary' },
)

const iconSize = computed(() =>
  props.compact ? ICON_SIZE_MEDIUM : ICON_SIZE_SMALL,
)

const classes = computed(() => {
  const baseStyles: Record<string, string[]> = {
    wrapper: [],
  }

  if (props.expand) {
    baseStyles.wrapper.push('flex-1 w-full')
  } else {
    baseStyles.wrapper.push('')
  }

  if (props.disabled) {
    baseStyles.wrapper.push('text-gray bg-gray-light')
  } else {
    switch (props.variant) {
      case 'primary':
        baseStyles.wrapper.push(
          'text-white bg-main hover:bg-main/90 active:bg-main-dark active:shadow-inner-m',
        )
        break
      case 'secondary':
        baseStyles.wrapper.push(
          'text-black bg-accent-light hover:bg-accent-light/20 hover:ring-1 hover:ring-accent ring-inset active:bg-accent-dark active:shadow-inner-m',
        )
        break
      case 'tertiary':
        baseStyles.wrapper.push(
          'text-black border border-accent p-2 hover:bg-accent-light/20',
        )
        break
      default:
        break
    }
  }

  if (props.compact) {
    baseStyles.wrapper.push('py-2 px-5')
  } else {
    baseStyles.wrapper.push('py-3 px-5')
  }

  return {
    wrapper: baseStyles.wrapper.join(' '),
  }
})
</script>

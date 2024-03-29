<template>
  <button type="button" :class="classes.wrapper" :disabled="disabled">
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
    variant?: 'primary' | 'secondary'
  }>(),
  { variant: 'primary' },
)

const iconSize = computed(() =>
  props.compact ? ICON_SIZE_MEDIUM : ICON_SIZE_SMALL,
)

const classes = computed(() => {
  const baseStyles: Record<string, string[]> = {
    wrapper: [
      'flex lg:inline-flex lg:flex-grow-0 justify-center lg:justify-start items-center gap-2 text-base rounded-3xl font-medium w-fit h-min',
    ],
  }

  if (props.expand) {
    baseStyles.wrapper.push('flex-1')
  }

  if (props.disabled) {
    baseStyles.wrapper.push('text-gray bg-gray-light')
  } else {
    switch (props.variant) {
      case 'primary':
        baseStyles.wrapper.push(
          'text-white bg-main hover:bg-main-light active:bg-main-dark',
        )
        break
      case 'secondary':
        baseStyles.wrapper.push(
          'text-black bg-accent-light hover:bg-accent active:bg-accent-dark',
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

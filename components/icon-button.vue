<template>
  <button
    class="inline-flex items-center justify-center gap-2 rounded-3xl text-base font-medium"
    :class="classes.wrapper"
    :disabled="disabled"
  >
    <slot :size="iconSize" stroke="1.5"></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    compact?: boolean
    disabled?: boolean
    variant?: 'primary' | 'secondary' | 'tertiary'
  }>(),
  { variant: 'primary' },
)

const iconSize = computed(() => (props.compact ? 18 : 24))

const classes = computed(() => {
  const baseStyles: Record<string, string[]> = {
    wrapper: [],
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
      case 'tertiary':
        baseStyles.wrapper.push('text-accent-dark border border-accent p-2')
        break
      default:
        break
    }
  }

  if (props.compact) {
    baseStyles.wrapper.push('w-8 h-8')
  } else {
    baseStyles.wrapper.push('w-11 h-11')
  }

  return {
    wrapper: baseStyles.wrapper.join(' '),
  }
})
</script>

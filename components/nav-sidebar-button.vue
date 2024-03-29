<template>
  <button :class="classes.wrapper">
    <slot name="icon" :size="ICON_SIZE_MEDIUM" stroke="1.5"></slot>
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  active: {
    type: Boolean,
    default: false,
  },
})

const classes = computed(() => {
  const baseStyles: Record<string, string[]> = {
    wrapper: [
      'flex items-center gap-3 text-lg rounded-m hover:bg-accent/20 active:bg-accent-dark/20 py-3 px-5',
    ],
  }

  if (props.active) {
    baseStyles.wrapper.push('bg-accent/20 hover:bg-accent/20 font-medium')
  }

  return {
    wrapper: baseStyles.wrapper.join(' '),
  }
})
</script>

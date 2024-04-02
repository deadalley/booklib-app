<template>
  <button
    class="flex items-center gap-3 rounded-m px-5 py-3 text-lg transition-all hover:bg-accent/30 active:bg-accent-dark/20"
    :class="classes.wrapper"
  >
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
    wrapper: [],
  }

  if (props.active) {
    baseStyles.wrapper.push('bg-accent/20 hover:bg-accent/20')
  }

  return {
    wrapper: baseStyles.wrapper.join(' '),
  }
})
</script>

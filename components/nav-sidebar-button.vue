<template>
  <button :class="classes.wrapper">
    <slot name="icon" :size="32" stroke="1.5"></slot>
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
      'flex items-center gap-3 text-xl hover:font-medium rounded-m hover:bg-accent/20 active:bg-accent-dark/20 py-3 px-5',
    ],
  }

  if (props.active) {
    baseStyles.wrapper.push('bg-accent/40 hover:bg-accent/40 font-medium')
  }

  return {
    wrapper: baseStyles.wrapper.join(' '),
  }
})
</script>

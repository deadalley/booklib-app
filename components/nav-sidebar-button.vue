<template>
  <button :class="classes.wrapper">
    <slot name="icon"></slot>
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
      'flex text-xl font-medium rounded-m hover:bg-accent/20 active:bg-accent-dark/20 py-3 px-5',
    ],
  }

  console.log(props.active)
  if (props.active) {
    baseStyles.wrapper.push('bg-accent/20')
  }

  return {
    wrapper: baseStyles.wrapper.join(' '),
  }
})
</script>

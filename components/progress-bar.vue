<template>
  <ProgressRoot
    v-model="progressValue"
    class="relative w-full overflow-hidden rounded-full bg-accent"
    :class="{
      'h-2': size === 'sm',
      'h-3': size === 'md',
      'h-4': size === 'lg',
    }"
    style="transform: translateZ(0)"
  >
    <ProgressIndicator
      class="size-full rounded-full transition-transform duration-[660ms] ease-in"
      :class="{
        [color]: true,
      }"
      :style="`transform: translateX(-${100 - progressValue}%)`"
    />
  </ProgressRoot>
</template>

<script setup lang="ts">
import { ProgressIndicator, ProgressRoot } from 'radix-vue'

withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg'
    color?: string
  }>(),
  { size: 'md', color: 'bg-main' },
)

const progressValue = defineModel<number>('progressValue', {
  default: 0,
})
</script>

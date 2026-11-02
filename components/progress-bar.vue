<template>
  <ProgressRoot
    v-model="progressValue"
    class="bg-surface relative w-full overflow-hidden rounded-full"
    :class="{
      'h-1': size === 'xs',
      'h-2': size === 'sm',
      'h-3': size === 'md',
      'h-4': size === 'lg',
    }"
    style="transform: translateZ(0)"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <ProgressIndicator
      class="size-full rounded-full transition-transform duration-660 ease-in"
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
    size?: 'xs' | 'sm' | 'md' | 'lg'
    color?: string
  }>(),
  { size: 'md', color: 'bg-primary' },
)

const hovered = ref(false)

const progressValue = defineModel<number>('progressValue', {
  default: 0,
})
</script>

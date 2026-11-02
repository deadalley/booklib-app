<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
  <SliderRoot
    v-model="values"
    :max="max"
    :min="min"
    :step="step"
    class="slider-root"
  >
    <SliderTrack class="slider-track">
      <SliderRange class="slider-range" />
    </SliderTrack>
    <SliderThumb v-for="(value, index) in values" :key="index">
      <span class="slider-thumb" />
      <span v-if="withThumbLabel" class="slider-thumb-label">
        {{ value }}
      </span>
    </SliderThumb>
  </SliderRoot>
</template>

<script setup lang="ts">
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'radix-vue'

withDefaults(
  defineProps<{
    min?: number
    max?: number
    step?: number
    withThumbLabel?: boolean
  }>(),
  { step: 1, min: 0, max: 100, withThumbLabel: false },
)

const values = defineModel<[number, number]>('values')
</script>

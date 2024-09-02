<script setup>
import Slider from './slider.vue'

const state = reactive({
  label: 'Slider',
  min: 0,
  max: 20,
  minValue: 3,
  maxValue: 18,
  step: 1,
})
</script>

<template>
  <Story title="Slider"><Slider v-bind="state" /></Story>
</template>

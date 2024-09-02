<script setup>
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
  <Story title="Atoms/Slider"><bl-slider v-bind="state" /></Story>
</template>

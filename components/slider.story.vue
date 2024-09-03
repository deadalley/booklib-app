<script setup>
const state = reactive({
  label: 'Slider',
  min: 0,
  max: 20,
  step: 1,
  values: [3, 18],
})
</script>

<template>
  <Story title="Atoms/Slider"><bl-slider v-bind="state" /></Story>
</template>

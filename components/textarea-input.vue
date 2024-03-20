<template>
  <div v-if="!editing" class="formkit-wrapper">
    <label class="formkit-label text-accent-dark">{{ $attrs.label }}</label>
    <h6 v-if="$attrs.value">{{ $attrs.value }}</h6>
    <p v-if="!$attrs.value" class="text-gray">Empty</p>
  </div>
  <FormKit
    v-if="editing"
    v-bind="$attrs"
    type="textarea"
    :classes="{
      label: 'ml-5 text-gray-dark',
      input: 'py-5',
    }"
  />
</template>

<script setup lang="ts">
defineProps({
  editing: {
    type: Boolean,
    default: true,
  },
})
</script>

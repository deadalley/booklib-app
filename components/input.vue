<template>
  <div v-if="!editing" class="formkit-wrapper">
    <label class="formkit-label text-accent-dark">{{ $attrs.label }}</label>
    <h5 v-if="value">{{ value }}</h5>
    <p v-if="!value" class="text-gray-dark">Empty</p>
  </div>
  <FormKit
    v-if="editing"
    v-bind="$attrs"
    :classes="{
      outer: editing ? '' : '!hidden',
      label: 'ml-5 text-gray-dark',
      input: 'py-3',
    }"
  />
</template>

<script setup lang="ts">
import { useFormKitContext } from '@formkit/vue'

const attrs = useAttrs()
const value = ref()

defineProps({
  asd: { type: String, default: '' },
  editing: {
    type: Boolean,
    default: true,
  },
})

useFormKitContext((form) => {
  const name = attrs.name as string
  const formValues = form._value as Record<string, any>

  value.value = formValues[name]
})
</script>

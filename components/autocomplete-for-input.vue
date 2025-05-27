<template>
  <bl-raw-autocomplete
    v-model="selectValue"
    :class="context.attrs?.class"
    :options="context.options"
    :placeholder="context.placeholder"
    :with-wrapper="false"
    not-found-label="No authors found"
  />
</template>

<script setup lang="ts">
import type { SelectOption } from './raw-select.vue'

const props = withDefaults(
  defineProps<{
    context: {
      attrs?: { class?: string }
      options: SelectOption[]
      placeholder?: string
      node: {
        input: (value: SelectOption['value']) => void
        _value: SelectOption['value']
      }
    }
  }>(),
  {},
)

const selectValue = ref(props.context.node?._value)

watch(selectValue, (value) => {
  if (value) {
    props.context.node?.input?.(value)
  }
})
</script>

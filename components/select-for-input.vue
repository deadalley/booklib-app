<template>
  <bl-raw-select
    v-model="selectValue"
    :class="context.attrs?.class"
    :options="context.options"
    :placeholder="context.placeholder"
    :with-wrapper="false"
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
      node: { input: (value: string) => void; _value: string }
    }
  }>(),
  {},
)

const selectValue = ref(props.context.node?._value)

watch(selectValue, (value) => {
  props.context.node?.input?.(value)
})
</script>

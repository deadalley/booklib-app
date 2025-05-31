<template>
  <bl-raw-select
    v-model="selectValue"
    :class="context.attrs?.class"
    :options="context.options"
    :placeholder="context.placeholder"
    :with-wrapper="false"
    :align="context.align"
    :side="context.side"
  />
</template>

<script setup lang="ts">
import type { SelectOption, SelectProps } from './raw-select.vue'

const props = withDefaults(
  defineProps<{
    context: {
      attrs?: { class?: string }
      options: SelectOption[]
      node: { input: (value: string) => void; _value: string }
    } & SelectProps
  }>(),
  {},
)

const selectValue = ref(props.context.node?._value)

watch(selectValue, (value) => {
  props.context.node?.input?.(value)
})
</script>

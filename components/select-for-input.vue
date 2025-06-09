<template>
  <bl-raw-select
    v-model="selectValue"
    v-model:focused="focused"
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
      attrs?: { class?: string; 'on-focus'?: (value: boolean) => void }
      options: SelectOption[]
      node: { input: (value: string) => void; _value: string }
    } & SelectProps
  }>(),
  {},
)

const selectValue = ref(props.context.node?._value)
const focused = ref(false)

watch(selectValue, (value) => {
  props.context.node?.input?.(value)
})

watch(focused, (value) => {
  props.context.attrs?.['on-focus']?.(value)
})
</script>

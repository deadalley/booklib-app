<template>
  <bl-raw-autocomplete
    v-model="selectValue"
    v-model:search-term="searchTerm"
    v-model:focused="focused"
    :class="context.attrs?.class"
    :options="context.options"
    :placeholder="context.placeholder"
    :with-wrapper="false"
    :can-create-new="context.canCreateNew"
    :not-found-label="context.notFoundLabel"
    :clearable="context.clearable"
    :align="context.align"
    :side="context.side"
  />
</template>

<script setup lang="ts">
import type { AutocompleteProps } from './raw-autocomplete.vue'
import type { SelectOption } from './raw-select.vue'

const props = withDefaults(
  defineProps<{
    context: AutocompleteProps & {
      attrs?: {
        class?: string
        'on-update:search-term'?: (value: string | undefined) => void
        'on-focus'?: (value: boolean) => void
      }
      node: {
        input: (value: SelectOption['value']) => void
        _value: SelectOption['value']
      }
    }
  }>(),
  {},
)

const selectValue = ref(props.context.node?._value)
const searchTerm = defineModel<string>()
const focused = ref(false)

watch(selectValue, (value) => {
  props.context.node?.input?.(value)
})

watch(searchTerm, (value) => {
  props.context.attrs?.['on-update:search-term']?.(value)
})

watch(focused, (value) => {
  props.context.attrs?.['on-focus']?.(value)
})

watch(props.context, (v) => {
  selectValue.value = v.node?._value
})
</script>

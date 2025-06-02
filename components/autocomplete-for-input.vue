<template>
  <bl-raw-autocomplete
    v-model="selectValue"
    v-model:search-term="searchTerm"
    :class="context.attrs?.class"
    :options="context.options"
    :placeholder="context.placeholder"
    :with-wrapper="false"
    :can-create-new="context.canCreateNew"
    :not-found-label="context.notFoundLabel"
    :clearable="context.clearable"
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

watch(selectValue, (value) => {
  props.context.node?.input?.(value)
})

watch(searchTerm, (value) => {
  props.context.attrs?.['on-update:search-term']?.(value)
})
</script>

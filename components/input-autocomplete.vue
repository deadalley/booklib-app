<template>
  <div
    v-if="!editing && !hidden"
    class="formkit-wrapper flex-1"
    v-bind="$attrs"
  >
    <label class="formkit-label">{{ $attrs.label }}</label>
    <h5 v-if="inputModel">{{ displayValue }}</h5>
    <IconCircleOff v-if="!inputModel" :size="14" class="text-accent-dark" />
  </div>
  <!-- @ts-expect-error options is used by the underlying select component -->
  <!-- @vue-skip -->
  <FormKit
    v-model="inputModel"
    v-bind="$attrs"
    :class="{ hidden: !(editing && !hidden) }"
    :classes="{
      outer: `flex-1 ${editing ? '' : '!hidden'}`,
      label: 'ml-4',
      inner: '!gap-0 relative',
    }"
    :type="rawAutocomplete"
    :options="options"
    :placeholder="placeholder"
    :can-create-new="canCreateNew"
    :not-found-label="notFoundLabel"
    :clearable="clearable"
    :align="align"
    :side="side"
    :on-update:search-term="(v) => onUpdateSearchTerm(v)"
    @focus="onFocus"
    @blur="onBlur"
  />
</template>

<script setup lang="ts">
import { IconCircleOff } from '@tabler/icons-vue'
import { createInput } from '@formkit/vue'

import AutocompleteForInput from '../components/autocomplete-for-input.vue'
import type { AutocompleteProps } from './raw-autocomplete.vue'

const rawAutocomplete = createInput(AutocompleteForInput, {
  props: [
    'options',
    'placeholder',
    'canCreateNew',
    'notFoundLabel',
    'clearable',
    'searchTerm',
    'align',
    'side',
  ],
})

const searchTerm = defineModel<string>('searchTerm')
const inputModel = defineModel<string | undefined>('input')
const focused = ref(false)

const props = withDefaults(defineProps<AutocompleteProps>(), {
  canCreateNew: false,
  editing: true,
  hidden: false,
})

const displayValue = computed(() => {
  return props.options!.find(({ value }) => value === inputModel.value)?.label
})

function onFocus() {
  focused.value = true
}

function onBlur() {
  focused.value = false
}

function onUpdateSearchTerm(value: string | undefined) {
  searchTerm.value = value
}
</script>

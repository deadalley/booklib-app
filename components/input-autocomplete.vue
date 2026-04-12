<template>
  <div v-if="!editing && !hidden" class="form-wrapper flex-1">
    <label class="form-label">{{ attrs.label }}</label>
    <h5 v-if="inputModel">{{ displayValue }}</h5>
    <IconCircleOff v-if="!inputModel" :size="14" class="text-ink-muted" />
  </div>
  <!-- @ts-expect-error options is used by the underlying select component -->
  <!-- @vue-skip -->
  <FormKit
    v-model="inputModel"
    v-bind="forwardedAttrs"
    :class="{ hidden: !(editing && !hidden) }"
    :classes="{
      outer: outerClass,
      wrapper: 'form-wrapper',
      label: 'form-label',
      inner: `form-inner !gap-0 relative ${focused ? 'border-primary' : 'border-stroke'}`,
      input: 'form-input',
    }"
    :type="rawAutocomplete"
    :options="options"
    :placeholder="placeholder"
    :can-create-new="canCreateNew"
    :not-found-label="notFoundLabel"
    :clearable="clearable"
    :align="align"
    :side="side"
    :multiple="multiple"
    :on-update:search-term="(v) => onUpdateSearchTerm(v)"
    :on-focus="(v) => onFocus(v)"
  />
</template>

<script setup lang="ts">
import { IconCircleOff } from '@tabler/icons-vue'
import { createInput } from '@formkit/vue'
import { normalizeClass } from 'vue'

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
    'multiple',
  ],
})

const searchTerm = defineModel<string>('searchTerm')
const inputModel = defineModel<string | undefined>('input')
const focused = ref(false)
const attrs = useAttrs()

const props = withDefaults(defineProps<AutocompleteProps>(), {
  canCreateNew: false,
  editing: true,
  hidden: false,
})

const displayValue = computed(() => {
  return props.options!.find(({ value }) => value === inputModel.value)?.label
})

const forwardedAttrs = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { class: _class, ...rest } = attrs
  return rest
})

const outerClass = computed(() =>
  normalizeClass(['flex flex-1', props.editing ? '' : '!hidden', attrs.class]),
)

function onFocus(value: boolean) {
  focused.value = value
}

function onUpdateSearchTerm(value: string | undefined) {
  searchTerm.value = value
}
</script>

<template>
  <div v-if="!editing && !hidden" class="form-wrapper flex-1">
    <label class="form-label">{{ $attrs.label }}</label>
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
      outer: `form-outer flex-1 ${editing ? '' : '!hidden'}`,
      label: 'form-label ml-4',
      inner: `form-inner !gap-0 relative ${focused ? '!border-main' : 'border-accent'}`,
      wrapper: 'form-wrapper',
      input: 'form-input',
    }"
    :type="rawSelect"
    :options="options"
    :groups="groups"
    :placeholder="placeholder"
    :with-wrapper="withWrapper"
    :data-testid="dataTestid"
    :align="align"
    :side="side"
    :on-focus="(v) => onFocus(v)"
  />
</template>

<script setup lang="ts">
import { IconCircleOff } from '@tabler/icons-vue'
import { createInput } from '@formkit/vue'
import type { SelectOption, SelectProps } from './raw-select.vue'

import SelectForInput from '../components/select-for-input.vue'

const rawSelect = createInput(SelectForInput, {
  props: [
    'options',
    'placeholder',
    'align',
    'side',
    'withWrapper',
    'data-testid',
  ],
})

const inputModel = ref()
const focused = ref(false)

const props = withDefaults(
  defineProps<
    {
      editing?: boolean
      hidden?: boolean
      options: SelectOption[]
    } & SelectProps
  >(),
  {
    editing: true,
    hidden: false,
  },
)

const displayValue = computed(() => {
  return props.options.find(({ value }) => value === inputModel.value)?.label
})

function onFocus(value: boolean) {
  focused.value = value
}
</script>

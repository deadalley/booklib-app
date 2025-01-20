<template>
  <div v-if="!editing && !hidden" class="formkit-wrapper flex-1">
    <label class="formkit-label">{{ $attrs.label }}</label>
    <h5 v-if="inputModel">{{ displayValue }}</h5>
    <IconCircleOff v-if="!inputModel" :size="14" class="text-accent-dark" />
  </div>
  <!-- @ts-expect-error options is used by the underlying select component -->
  <FormKit
    v-model="inputModel"
    v-bind="$attrs"
    :class="{ hidden: !(editing && !hidden) }"
    :classes="{
      outer: `flex-1 ${editing ? '' : '!hidden'}`,
      label: 'ml-4',
      inner: '!gap-0 relative',
    }"
    :type="rawSelect"
    :options="options"
    @focus="onFocus"
    @blur="onBlur"
  />
</template>

<script setup lang="ts">
import { IconCircleOff } from '@tabler/icons-vue'
import { createInput } from '@formkit/vue'

import SelectForInput from '../components/select-for-input.vue'

const rawSelect = createInput(SelectForInput, {
  props: ['options', 'placeholder'],
})

const inputModel = ref()
const focused = ref(false)

const props = withDefaults(
  defineProps<{
    editing?: boolean
    hidden?: boolean
    options: { label: string; value: string }[]
  }>(),
  {
    editing: true,
    hidden: false,
  },
)

const displayValue = computed(() => {
  return props.options.find(({ value }) => value === inputModel.value)?.label
})

function onFocus() {
  focused.value = true
}

function onBlur() {
  focused.value = false
}
</script>

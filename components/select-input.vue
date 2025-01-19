<template>
  <div v-if="!editing && !hidden" class="formkit-wrapper flex-1">
    <label class="formkit-label">{{ $attrs.label }}</label>
    <h5 v-if="inputModel && $attrs.type !== 'textarea'">{{ displayValue }}</h5>
    <p v-if="inputModel && $attrs.type === 'textarea'" class="italic">
      {{ displayValue }}
    </p>
    <IconCircleOff v-if="!inputModel" :size="14" class="text-accent-dark" />
  </div>
  <FormKit
    v-if="editing && !hidden"
    v-model="inputModel"
    v-bind="$attrs"
    :classes="{
      outer: 'flex-1',
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
import { useFormKitContext, createInput } from '@formkit/vue'

import SelectForInput from '../components/select-for-input.vue'

const rawSelect = createInput(SelectForInput, {
  props: ['options', 'placeholder'],
})

const attrs = useAttrs()
const inputModel = ref()
const focused = ref(false)

withDefaults(
  defineProps<{
    editing?: boolean
    hidden?: boolean
    options: { label: string; value: string | number }[]
  }>(),
  {
    editing: true,
    hidden: false,
  },
)

useFormKitContext((form) => {
  const name = attrs.name as string
  const formValues = form._value as Record<string, unknown>

  inputModel.value = formValues[name] ?? ''
})

const displayValue = computed(() => {
  if ((attrs.name as string).toLowerCase().includes('language')) {
    return getDisplayLanguage(attrs.value as string)
  }
  return inputModel.value
})

function onFocus() {
  focused.value = true
}

function onBlur() {
  focused.value = false
}
</script>

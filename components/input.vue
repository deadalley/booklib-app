<template>
  <div v-if="!editing" class="formkit-wrapper flex-1">
    <label class="formkit-label">{{ $attrs.label }}</label>
    <h5 v-if="inputModel">{{ displayValue }}</h5>
    <p v-if="!inputModel" class="text-gray-dark">Empty</p>
  </div>
  <FormKit
    v-if="editing"
    v-model="inputModel"
    v-bind="$attrs"
    :classes="{
      outer: `flex-1 ${editing ? '' : '!hidden'}`,
      wrapper: 'flex-1',
      label: 'ml-5',
      inner: `${focused ? 'border-accent' : 'border-white'}`,
    }"
    @focus="onFocus"
    @blur="onBlur"
  >
    <!-- @vue-skip -->
    <template v-for="(_, name) in $slots" #[name]="slotData"
      ><slot :name="name" v-bind="slotData"
    /></template>
  </FormKit>
</template>

<script setup lang="ts">
import { useFormKitContext } from '@formkit/vue'

const attrs = useAttrs()
const inputModel = ref()
const focused = ref(false)

withDefaults(defineProps<{ editing?: boolean }>(), { editing: true })

useFormKitContext((form) => {
  const name = attrs.name as string
  const formValues = form._value as Record<string, unknown>

  inputModel.value = formValues[name]
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

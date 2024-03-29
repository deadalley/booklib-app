<template>
  <div v-if="!editing" class="formkit-wrapper flex-1">
    <label class="formkit-label text-accent-dark">{{ $attrs.label }}</label>
    <h5 v-if="inputModel">{{ inputModel }}</h5>
    <p v-if="!inputModel" class="text-gray-dark">Empty</p>
  </div>
  <FormKit
    v-if="editing"
    v-model="inputModel"
    v-bind="$attrs"
    :classes="{
      outer: editing ? 'flex-1' : 'flex-1 !hidden',
      wrapper: 'flex-1',
      label: 'ml-5 text-gray-dark',
    }"
  >
    <template v-for="(_, name) in $slots" #[name]="slotData"
      ><slot :name="name" v-bind="slotData"></slot
    ></template>
  </FormKit>
</template>

<script setup lang="ts">
import { useFormKitContext } from '@formkit/vue'

const attrs = useAttrs()
const inputModel = ref()

defineProps({
  editing: {
    type: Boolean,
    default: true,
  },
})

useFormKitContext((form) => {
  const name = attrs.name as string
  const formValues = form._value as Record<string, any>

  inputModel.value = formValues[name]
})
</script>

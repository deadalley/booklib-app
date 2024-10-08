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
      outer: `flex-1 ${editing ? '' : '!hidden'}`,
      wrapper: 'flex-1',
      label: 'ml-4',
      inner: `${focused ? '!border-main' : 'border-accent'}`,
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
import { IconCircleOff } from '@tabler/icons-vue'
import { useFormKitContext } from '@formkit/vue'

const attrs = useAttrs()
const inputModel = ref()
const focused = ref(false)

withDefaults(defineProps<{ editing?: boolean; hidden?: boolean }>(), {
  editing: true,
  hidden: false,
})

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

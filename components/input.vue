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
    v-model="inputModel"
    v-bind="$attrs"
    :class="{ hidden: !(editing && !hidden) }"
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
    <!-- @vue-skip -->
    <template v-if="clearable && !$slots['suffixIcon']" #suffixIcon>
      <IconX class="cursor-pointer" :size="14" @click="onClear" />
    </template>
  </FormKit>
</template>

<script setup lang="ts">
import { IconCircleOff, IconX } from '@tabler/icons-vue'

export type InputProps = {
  editing?: boolean
  hidden?: boolean
  clearable?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formatter?: (value: any) => string | undefined
}

const inputModel = defineModel<string | undefined>()
const focused = ref(false)

const props = withDefaults(defineProps<InputProps>(), {
  editing: true,
  hidden: false,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formatter: (value: any) => value && `${value}`,
})

const displayValue = computed(() => {
  return props.formatter(inputModel.value)
})

function onFocus() {
  focused.value = true
}

function onBlur() {
  focused.value = false
}

function onClear() {
  inputModel.value = undefined
}
</script>

<template>
  <div v-if="!editing && !hidden" class="form-wrapper flex-1">
    <label class="form-label">{{ attrs.label }}</label>
    <h5 v-if="inputModel && attrs.type !== 'textarea'">{{ displayValue }}</h5>
    <p v-if="inputModel && attrs.type === 'textarea'" class="italic">
      {{ displayValue }}
    </p>
    <IconCircleOff v-if="!inputModel" :size="14" class="text-ink-muted" />
  </div>
  <FormKit
    v-model="inputModel"
    v-bind="forwardedAttrs"
    :class="{ hidden: !(editing && !hidden) }"
    :classes="{
      outer: outerClass,
      wrapper: 'form-wrapper',
      label: 'form-label',
      inner: `form-inner ${focused ? 'border-primary' : 'border-stroke'}`,
      input: 'form-input',
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
import { normalizeClass } from 'vue'

export type InputProps = {
  editing?: boolean
  hidden?: boolean
  clearable?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formatter?: (value: any) => string | undefined
}

const inputModel = defineModel<string | undefined>()
const focused = ref(false)
const attrs = useAttrs()

const props = withDefaults(defineProps<InputProps>(), {
  editing: true,
  hidden: false,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formatter: (value: any) => value && `${value}`,
})

const displayValue = computed(() => {
  return props.formatter(inputModel.value)
})

const forwardedAttrs = computed(() => {
  // FormKit class sections control the rendered wrappers, so we merge class manually.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { class: _class, ...rest } = attrs
  return rest
})

const outerClass = computed(() =>
  normalizeClass(['flex flex-1', props.editing ? '' : '!hidden', attrs.class]),
)

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

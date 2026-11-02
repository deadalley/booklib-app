<template>
  <label
    class="checkbox-label"
    :class="[
      { 'flex-row-reverse justify-end': align === 'left' },
      $attrs.class,
    ]"
  >
    <span>
      <slot />
    </span>
    <input
      :id="inputId"
      :checked="isChecked"
      :disabled="disabled"
      type="checkbox"
      class="checkbox-input"
      @change="onChange"
    />
  </label>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const inputId = computed(() => attrs.id as string | undefined)

const props = withDefaults(
  defineProps<{
    align?: 'right' | 'left'
    /** One-way checked state, for when the parent owns the value. */
    checked?: boolean
    disabled?: boolean
  }>(),
  { align: 'left', checked: undefined, disabled: false },
)

const model = defineModel<boolean | undefined>({ default: undefined })

const emit = defineEmits<{
  (e: 'change', value: boolean): void
}>()

// A parent-controlled `checked` wins so external resets are always reflected
const isChecked = computed(() => props.checked ?? model.value ?? false)

function onChange(event: Event) {
  const value = (event.target as HTMLInputElement).checked
  model.value = value
  // Emitted exactly once per user interaction
  emit('change', value)
}
</script>

<template>
  <li
    class="switch-option"
    :class="{
      selected,
    }"
    @click="onClick"
  >
    <input
      :id="value"
      ref="input"
      type="checkbox"
      value="value"
      class="hidden"
      @change="$emit('select', value)"
    />
    <bl-tooltip :disabled="!$slots['tooltip']">
      <template #tooltip-content="tooltipProps">
        <slot name="tooltip" v-bind="tooltipProps" />
      </template>
      <span class="switch-option-inner" @click="onClick">
        <slot name="icon" :size="19" stroke="1.5" />
      </span>
    </bl-tooltip>
  </li>
</template>

<script setup lang="ts">
defineProps<{
  value: string
  selected: boolean
}>()

defineEmits(['select'])

const input = ref()

function onClick() {
  input.value.click()
}
</script>

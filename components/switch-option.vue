<template>
  <RadioGroupItem
    :id="value"
    :value="value"
    as="li"
    class="switch-option"
    :class="{
      selected: selectedValue === value,
    }"
  >
    <bl-tooltip :disabled="!$slots['tooltip']">
      <template #tooltip-content="tooltipProps">
        <slot name="tooltip" v-bind="tooltipProps" />
      </template>
      <span class="switch-option-inner">
        <slot name="icon" :size="19" stroke="1.5" />
      </span>
    </bl-tooltip>
  </RadioGroupItem>
</template>

<script setup lang="ts">
import { RadioGroupItem } from 'radix-vue'

defineProps<{
  value: string
  selectedValue: string | undefined
}>()
</script>

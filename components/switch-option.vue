<template>
  <RadioGroupItem
    :id="value"
    :value="value"
    as="li"
    class="flex cursor-pointer items-center border border-accent bg-white text-black ring-inset first:rounded-l-xl last:rounded-r-xl hover:bg-accent active:bg-accent-dark lg:w-full"
  >
    <span
      class="flex items-center rounded-[inherit] p-2 transition-all lg:w-full"
      :class="{
        'bg-accent-light hover:bg-accent': selectedValue === value,
      }"
    >
      <slot name="icon" :size="19" stroke="1.5" />
    </span>
  </RadioGroupItem>
</template>

<script setup lang="ts">
import { RadioGroupItem } from 'radix-vue'

defineProps<{
  value: string
  selectedValue: string | undefined
}>()
</script>

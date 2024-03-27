<template>
  <RadioGroupOption
    v-slot="{ checked }"
    :value="value"
    class="flex items-center w-full h-full first:rounded-l-3xl last:rounded-r-3xl border-r last:border-0 border-accent-dark cursor-pointer hover:bg-accent active:bg-accent-dark"
  >
    <li
      class="flex items-center h-full w-full px-3 first:pl-5 last:pr-5 rounded-[inherit]"
      :class="{ 'bg-accent-dark shadow-inner-m': !!checked }"
    >
      <slot name="icon" :size="24" stroke="1.5"></slot>
    </li>
  </RadioGroupOption>
</template>

<script setup lang="ts">
import { RadioGroupOption } from '@headlessui/vue'

defineProps({
  value: {
    type: String || Number,
    required: true,
  },
})
</script>

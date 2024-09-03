<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
  <RadioGroupOption
    v-slot="{ checked }"
    as="li"
    :value="value"
    class="radio-group-option flex cursor-pointer items-center border border-accent bg-white text-black ring-inset first:rounded-l-lg last:rounded-r-lg hover:bg-accent active:bg-accent-dark lg:w-full"
  >
    <span
      class="flex items-center rounded-[inherit] p-3 transition-all lg:w-full"
      :class="{
        'bg-accent-light hover:bg-accent': !!checked,
      }"
    >
      <slot name="icon" :size="21" stroke="1.5" />
    </span>
  </RadioGroupOption>
</template>

<script setup lang="ts">
import { RadioGroupOption } from '@headlessui/vue'

defineProps<{ value: string | number }>()
</script>

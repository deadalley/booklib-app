<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
  <RadioGroupOption
    v-slot="{ checked }"
    as="li"
    :value="value"
    class="radio-group-option flex cursor-pointer items-center border-r border-r-accent bg-accent-light text-black ring-inset first:rounded-l-lg last:rounded-r-lg last:border-0 hover:bg-white hover:ring-1 hover:ring-accent-dark active:bg-accent lg:w-full"
  >
    <span
      class="flex items-center rounded-[inherit] px-4 py-3 transition-all lg:w-full"
      :class="{
        'bg-accent-dark': !!checked,
      }"
    >
      <slot name="icon" :size="ICON_SIZE_SMALL" stroke="1.5" />
    </span>
  </RadioGroupOption>
</template>

<script setup lang="ts">
import { RadioGroupOption } from '@headlessui/vue'

defineProps<{ value: string | number }>()
</script>

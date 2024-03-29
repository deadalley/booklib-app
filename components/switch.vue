<template>
  <RadioGroup
    v-bind="$attrs"
    as="ul"
    class="flex items-center rounded-3xl bg-accent-light text-black h-min"
  >
    <slot v-bind="$props"></slot>
  </RadioGroup>
</template>

<script setup lang="ts">
import { RadioGroup } from '@headlessui/vue'

defineProps<{ compact?: boolean }>()
</script>

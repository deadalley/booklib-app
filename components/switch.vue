<template>
  <RadioGroup
    v-bind="$attrs"
    as="ul"
    class="inline-flex h-min items-center rounded-3xl"
  >
    <slot v-bind="$props"></slot>
  </RadioGroup>
</template>

<script setup lang="ts">
import { RadioGroup } from '@headlessui/vue'

defineProps<{ compact?: boolean }>()
</script>

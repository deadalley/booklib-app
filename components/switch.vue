<template>
  <RadioGroupRoot
    v-bind="$attrs"
    as="ul"
    class="inline-flex h-min items-center rounded-3xl"
  >
    <slot v-bind="$props" />
  </RadioGroupRoot>
</template>

<script setup lang="ts">
import { RadioGroupRoot } from 'radix-vue'
</script>

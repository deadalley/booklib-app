<template>
  <RadioGroupRoot v-bind="$attrs" as="ul" class="switch">
    <slot v-bind="$props" />
  </RadioGroupRoot>
</template>

<script setup lang="ts">
import { RadioGroupRoot } from 'radix-vue'
</script>

<template>
  <RadioGroup
    v-model="plan"
    as="ul"
    class="flex items-center rounded-3xl bg-accent-light text-black"
  >
    <slot></slot>
  </RadioGroup>
</template>

<script setup lang="ts">
import { RadioGroup } from '@headlessui/vue'

const plan = ref('cards')
</script>

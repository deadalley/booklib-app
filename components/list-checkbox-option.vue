<template>
  <li
    class="border-b border-b-accent px-4 py-2 first:rounded-t-2xl last:rounded-b-2xl last:border-b-0 hover:bg-accent-light"
  >
    <bl-checkbox v-model="_checked" :checked="checked" v-bind="$attrs">
      <slot />
    </bl-checkbox>
  </li>
</template>

<script setup lang="ts">
import { useVModel } from '@vueuse/core'

const props = defineProps<{ checked?: boolean }>()

const emit = defineEmits(['update:checked'])

const _checked = useVModel(props, 'checked', emit)
</script>

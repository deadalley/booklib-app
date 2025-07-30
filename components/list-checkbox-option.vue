<template>
  <li
    class="border-b border-b-accent px-4 py-2 first:rounded-t-2xl last:rounded-b-2xl last:border-b-0 hover:bg-accent-light"
  >
    <bl-checkbox v-model="checked" :checked="checked" v-bind="$attrs">
      <slot />
    </bl-checkbox>
  </li>
</template>

<script setup lang="ts">
const checked = defineModel<boolean>('checked', { default: false })
</script>

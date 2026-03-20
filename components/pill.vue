<template>
  <span
    class="pill"
    :class="{
      'pill-selected': !!selected,
    }"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
defineProps<{ selected?: boolean }>()
</script>

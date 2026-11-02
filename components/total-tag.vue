<template>
  <div
    class="total-tag"
    :class="{
      'total-tag-primary': variant === 'primary',
      'total-tag-secondary': variant === 'secondary',
    }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'primary' | 'secondary' }>(), {
  variant: 'secondary',
})
</script>

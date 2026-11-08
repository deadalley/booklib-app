<template>
  <component
    :is="as"
    class="pill"
    :class="{
      'pill-selected': !!selected,
      'pill-sm': size === 'sm',
    }"
    :type="as === 'button' ? 'button' : undefined"
    :aria-pressed="as === 'button' ? !!selected : undefined"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    selected?: boolean
    // A toggle (e.g. a filter or genre) renders as a pressed/unpressed button
    as?: 'span' | 'button'
    size?: 'sm' | 'md'
  }>(),
  { as: 'span', size: 'md' },
)
</script>

<template>
  <component
    :is="as"
    class="pill"
    :class="{
      'pill-selected': !!selected,
      'pill-sm': size === 'sm',
      'pill-primary': variant === 'primary',
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
    // primary: fills with the primary color when selected
    variant?: 'default' | 'primary'
  }>(),
  { as: 'span', size: 'md', variant: 'default' },
)
</script>

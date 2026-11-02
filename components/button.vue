<template>
  <component
    :is="to ? NuxtLink : 'button'"
    v-bind="$attrs"
    :to="to"
    :type="to ? undefined : 'button'"
    class="button"
    :class="{
      'button-primary': variant === 'primary',
      'button-secondary': variant === 'secondary',
      'button-tertiary': variant === 'tertiary',
      'button-disabled': !!disabled || !!loading,
      'button-active': !!pressed && !disabled && !loading,
      primary: color === 'primary' && !disabled && !loading,
      secondary: color === 'secondary' && !disabled && !loading,
      [size]: !!size,
      'cursor-pointer': !disabled && !loading,
      'w-full flex-1': !!expand,
      'py-2': size === 'md' || size === 'lg',
      'py-1': size === 'sm',
      'px-2':
        !$slots['default'] && ($slots['prependIcon'] || $slots['appendIcon']),
      'px-4': !(
        !$slots['default'] &&
        ($slots['prependIcon'] || $slots['appendIcon'])
      ),
    }"
    :disabled="to ? undefined : disabled"
    :aria-disabled="to && (disabled || loading) ? true : undefined"
    :aria-pressed="pressed"
  >
    <slot name="prependIcon" :size="ICON_SIZE_SMALL" stroke="1.5" />
    <slot />
    <slot name="appendIcon" :size="ICON_SIZE_SMALL" stroke="1.5" />
    <bl-loading v-if="loading" class="size-4!" />
  </component>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import { NuxtLink } from '#components'
withDefaults(
  defineProps<{
    /** Renders the button as a link (avoids wrapping a button in a link). */
    to?: RouteLocationRaw
    expand?: boolean
    disabled?: boolean
    loading?: boolean
    variant?: 'primary' | 'secondary' | 'tertiary'
    color?: 'primary' | 'secondary'
    size?: 'sm' | 'md' | 'lg'
    pressed?: boolean
  }>(),
  { variant: 'primary', size: 'md', pressed: undefined },
)
</script>

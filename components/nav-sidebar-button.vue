<template>
  <bl-tooltip side="right" :disabled="!$slots['tooltip']">
    <template #tooltip-content>
      <slot name="tooltip" />
    </template>
    <NuxtLink
      v-bind="$attrs"
      :to="disabled ? undefined : to"
      class="nav-sidebar-button"
      :class="{
        'nav-sidebar-button-disabled': disabled,
        'nav-sidebar-button-active': active,
        'nav-sidebar-button-icon-only': !!iconOnly,
      }"
      :disabled="disabled"
    >
      <slot name="icon" :size="ICON_SIZE_MEDIUM" stroke="1.5" />
      <slot />
    </NuxtLink>
  </bl-tooltip>
</template>

<script setup lang="ts">
defineProps<{
  active?: boolean
  to?: string
  disabled?: boolean
  iconOnly?: boolean
}>()
</script>

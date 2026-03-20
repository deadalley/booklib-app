<template>
  <bl-tooltip side="right" :disabled="!$slots['tooltip']">
    <template #tooltip-content>
      <slot name="tooltip" />
    </template>
    <NuxtLink
      v-bind="$attrs"
      :to="disabled ? undefined : to"
      class="flex items-center rounded-xl py-3 text-lg"
      :class="{
        'hover:bg-surface/30 active:bg-surface-dark/20 cursor-pointer transition-all':
          !disabled,
        'text-ink-muted cursor-default': disabled,
        'bg-primary text-ink-inverse hover:bg-primary/80': active,
        'gap-3 px-5': !iconOnly,
        'px-3': !!iconOnly,
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

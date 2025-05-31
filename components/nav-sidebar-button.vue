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
        'cursor-pointer transition-all hover:bg-accent/30 active:bg-accent-dark/20':
          !disabled,
        'cursor-default text-accent': disabled,
        'bg-main text-white hover:bg-main/80': active,
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

<template>
  <div
    class="relative flex size-full flex-col gap-8 overflow-y-hidden overflow-x-visible"
    v-bind="$attrs"
  >
    <div class="flex flex-col items-baseline justify-between gap-5 lg:flex-row">
      <div class="flex w-full items-center gap-3 lg:flex-col xl:flex-row">
        <h3>{{ title }}</h3>
        <bl-total-tag v-if="total">{{ total }}</bl-total-tag>
      </div>
      <div
        class="flex w-full flex-1 flex-col justify-end gap-3 transition-all duration-300 ease-in-out lg:flex-row"
        :class="{ 'md:mr-[355px]': !!sidebarContent }"
      >
        <slot name="navbar" />
      </div>
    </div>
    <slot />
  </div>
  <bl-loading-overlay v-if="loading" />
</template>

<script setup lang="ts">
defineProps<{
  title: string
  total: string | number
  sidebarContent?: string
  loading?: boolean
}>()
</script>

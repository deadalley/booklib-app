<template>
  <div
    class="relative flex size-full flex-col gap-8 overflow-hidden"
    v-bind="$attrs"
  >
    <div class="flex flex-col items-baseline justify-between gap-5 lg:flex-row">
      <div class="flex w-full items-baseline gap-3 lg:flex-col xl:flex-row">
        <NuxtLink to="/library/books">
          <h3>{{ title }}</h3>
        </NuxtLink>
        <h6 class="flex gap-3 text-accent-dark">
          <span> TOTAL {{ total }} </span>
        </h6>
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
</template>

<script setup lang="ts">
defineProps<{ title: string; total: number; sidebarContent?: string }>()
</script>

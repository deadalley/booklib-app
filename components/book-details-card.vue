<template>
  <section class="paper-dark p-7">
    <div class="flex flex-col gap-y-7">
      <div
        v-for="item in items"
        :key="item.label"
        class="flex items-center justify-between"
      >
        <p
          class="text-ink-secondary text-sm font-medium tracking-wider uppercase"
        >
          {{ item.label }}
        </p>
        <p class="text-ink-primary text-base font-semibold">
          {{ item.value }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  items: { label: string; value: string | number }[]
}>()
</script>

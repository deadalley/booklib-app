<template>
  <bl-stats-empty v-if="!items.length" label="No data" />
  <ul v-else class="flex flex-col gap-2">
    <li
      v-for="item in items"
      :key="item.id"
      class="grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)_3.5rem] items-center gap-3"
    >
      <NuxtLink
        :to="`/library/books/${item.id}`"
        class="label"
        :title="item.label"
      >
        {{ item.label }}
      </NuxtLink>
      <span class="bg-surface-container h-2.5 overflow-hidden rounded-[5px]">
        <span
          class="bg-primary block h-full rounded-[5px]"
          :style="{ width: `${(item.value / max) * 100}%` }"
        />
      </span>
      <span
        class="text-ink-primary justify-self-end text-[0.8125rem] font-bold whitespace-nowrap"
      >
        {{ format(item.value) }}
      </span>
    </li>
  </ul>
</template>

<script setup lang="ts">
const props = defineProps<{
  items: { id: string; label: string; value: number }[]
  format: (value: number) => string
}>()

const max = computed(() =>
  Math.max(1, ...props.items.map(({ value }) => value)),
)
</script>

<style scoped>
@reference '../assets/css/main.css';

.label {
  @apply text-ink-secondary hover:text-primary truncate text-sm font-medium underline-offset-[3px] hover:underline;
}
</style>

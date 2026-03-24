<template>
  <section class="paper flex flex-col gap-6 px-6 py-4">
    <div class="flex flex-1 flex-col gap-2">
      <div
        class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
      >
        <p
          class="text-ink-secondary text-sm font-bold tracking-widest uppercase"
        >
          Progress
        </p>
        <div class="flex items-end gap-3 self-start md:self-auto">
          <p class="text-primary text-4xl leading-none font-semibold">
            {{ progress }}%
          </p>
        </div>
      </div>

      <bl-progress-bar
        :progress-value="progress"
        size="sm"
        color="bg-primary"
      />
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-surface-canvas/70 flex flex-col gap-1 rounded-2xl p-4"
      >
        <p class="label">{{ stat.label }}</p>
        <p class="value">{{ stat.value }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  progress: number
  stats: { label: string; value: string }[]
}>()
</script>

<style scoped>
@reference '../../assets/css/main.css';

.label {
  @apply text-ink-muted text-sm font-semibold tracking-wider uppercase;
}

.value {
  @apply text-ink-primary text-lg font-bold;
}
</style>

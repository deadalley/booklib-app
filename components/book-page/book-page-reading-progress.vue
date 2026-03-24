<template>
  <section class="paper flex gap-4 px-6 py-4">
    <div class="flex flex-1 flex-col gap-2">
      <div
        class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
      >
        <!-- Label -->
        <p
          class="text-ink-secondary text-sm font-bold tracking-widest uppercase"
        >
          Progress
        </p>
        <!-- Percentage -->
        <div class="flex items-end gap-3 self-start md:self-auto">
          <p class="text-primary text-4xl leading-none font-semibold">
            {{ progress }}%
          </p>
        </div>
      </div>

      <!-- Progress Bar -->
      <bl-progress-bar
        :progress-value="progress"
        size="sm"
        color="bg-primary"
      />
    </div>

    <div class="bg-stroke h-full w-px text-right" />

    <div class="flex flex-col justify-end gap-1">
      <h5 class="font-body text-right font-semibold">Owned</h5>
      <p
        class="text-ink-secondary text-right text-sm font-bold tracking-widest uppercase"
      >
        Current status
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  progress: number
  stats: { label: string; value: string }[]
}>()
</script>

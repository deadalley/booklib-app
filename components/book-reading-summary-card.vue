<template>
  <section class="paper p-6">
    <div class="flex flex-col gap-6">
      <div
        class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <p
            class="text-ink-muted tracking-caps text-[11px] font-semibold uppercase"
          >
            My Progress
          </p>
          <p class="text-ink-secondary mt-2 text-sm">
            {{ subtitle }}
          </p>
        </div>

        <div class="flex items-end gap-3 self-start md:self-auto">
          <p class="text-primary text-5xl leading-none font-semibold">
            {{ progress }}%
          </p>
          <p
            class="text-ink-muted tracking-caps pb-1 text-[11px] font-semibold uppercase"
          >
            Complete
          </p>
        </div>
      </div>

      <bl-progress-bar
        :progress-value="progress"
        size="sm"
        color="bg-primary"
      />

      <div class="grid gap-3 md:grid-cols-3">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="border-stroke-subtle bg-surface-canvas/70 flex flex-col gap-2 rounded-2xl border p-4"
        >
          <p
            class="text-ink-muted tracking-caps text-[11px] font-semibold uppercase"
          >
            {{ stat.label }}
          </p>
          <p class="text-ink-primary text-2xl leading-none font-semibold">
            {{ stat.value }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  progress: number
  subtitle: string
  stats: { label: string; value: string }[]
}>()
</script>

<template>
  <section class="paper p-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p
          class="text-ink-muted text-[11px] font-semibold tracking-[0.18em] uppercase"
        >
          Reading Lifecycle
        </p>
        <p class="text-ink-secondary mt-2 text-sm">
          Track where this title sits in your library workflow.
        </p>
      </div>
      <span
        class="bg-primary/10 text-primary rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase"
      >
        {{ badgeLabel }}
      </span>
    </div>

    <div class="mt-6 grid gap-3 lg:grid-cols-3">
      <button
        v-for="step in steps"
        :key="step.step"
        type="button"
        class="border-stroke-subtle bg-surface-elevated hover:border-primary hover:bg-surface-subtle flex cursor-pointer items-start gap-4 rounded-2xl border p-4 text-left transition-colors"
        :class="{
          'border-primary bg-primary/5': currentStep === step.step,
          'border-primary/30': currentStep > step.step,
        }"
        @click="$emit('step-change', step.step)"
      >
        <span
          class="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl border transition-colors"
          :class="{
            'border-primary bg-primary text-ink-inverse':
              currentStep >= step.step,
            'border-stroke bg-surface-canvas text-ink-muted':
              currentStep < step.step,
          }"
        >
          <component :is="icons[stepIcon(step.step)]" :size="18" stroke="1.8" />
        </span>

        <span class="flex min-w-0 flex-1 flex-col gap-1">
          <span
            class="text-ink-muted text-[10px] font-semibold tracking-[0.16em] uppercase"
          >
            Step {{ step.step }}
          </span>
          <span class="text-ink-primary text-sm font-semibold uppercase">
            {{ step.description ?? step.title }}
          </span>
          <span class="text-ink-secondary text-sm">
            {{ stepState(step.step) }}
          </span>
        </span>
      </button>
    </div>

    <div class="mt-6 flex flex-col gap-3">
      <p
        class="text-ink-muted text-[11px] font-semibold tracking-[0.18em] uppercase"
      >
        Quick State
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="option in stateOptions"
          :key="option.id"
          type="button"
          class="border-stroke bg-surface text-ink-secondary hover:bg-surface-subtle inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold tracking-[0.12em] uppercase transition-colors"
          :class="{
            'border-primary bg-primary text-ink-inverse hover:bg-primary-700':
              currentStatus === option.id,
          }"
          @click="$emit('status-select', option.id)"
        >
          <component :is="icons[option.icon]" :size="14" stroke="1.75" />
          {{ option.label }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { icons } from '@tabler/icons-vue'
import type { BookProgressStatus } from '~/types/book'
import { PROGRESS_STATUS_MAP } from '~/utils/constants'

const props = defineProps<{
  currentStep: number
  currentStatus: BookProgressStatus
  badgeLabel: string
  steps: {
    step: number
    title?: string
    description?: string
  }[]
  stateOptions: {
    id: BookProgressStatus
    label: string
    icon: keyof typeof icons
  }[]
}>()

defineEmits<{
  (e: 'step-change', step: number): void
  (e: 'status-select', status: BookProgressStatus): void
}>()

const stepIcons = computed<Record<number, keyof typeof icons>>(() => ({
  1:
    props.currentStatus === 'owned'
      ? PROGRESS_STATUS_MAP.owned.icon
      : PROGRESS_STATUS_MAP['not-owned'].icon,
  2:
    props.currentStatus === 'paused'
      ? PROGRESS_STATUS_MAP.paused.icon
      : PROGRESS_STATUS_MAP.reading.icon,
  3:
    props.currentStatus === 'not-finished'
      ? PROGRESS_STATUS_MAP['not-finished'].icon
      : PROGRESS_STATUS_MAP.read.icon,
}))

function stepState(step: number) {
  if (props.currentStep > step) return 'Completed'
  if (props.currentStep === step) return 'Current stage'

  return 'Up next'
}

function stepIcon(step: number): keyof typeof icons {
  return stepIcons.value[step] ?? PROGRESS_STATUS_MAP.reading.icon
}
</script>

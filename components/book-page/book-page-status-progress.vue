<template>
  <div class="paper-dark p-6">
    <bl-book-status-stepper
      :current-status="stepperStatus"
      @step-click="onStepperStepClick"
      @status-select="onStepperStatusSelect"
    />
  </div>
</template>

<script setup lang="ts">
import type { icons } from '@tabler/icons-vue'
import type { BookProgressStatus } from '~/types/book'

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

const emit = defineEmits<{
  (e: 'step-change', step: number): void
  (e: 'status-select', status: BookProgressStatus): void
}>()

const stepperStatus = computed(() => props.currentStatus)

function onStepperStepClick(step: number) {
  emit('step-change', step)
}

function onStepperStatusSelect(status: BookProgressStatus) {
  emit('status-select', status)
}
</script>

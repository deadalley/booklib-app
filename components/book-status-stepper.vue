<template>
  <div class="relative">
    <!-- Line -->
    <div
      class="bg-stroke absolute top-5 right-6 left-6 h-px sm:right-8 sm:left-8"
    />

    <div class="relative grid grid-cols-3 gap-1.5 sm:gap-2">
      <div
        v-for="step in steps"
        :key="step.id"
        class="flex min-w-0 flex-col items-center gap-2"
      >
        <button
          type="button"
          class="inline-flex size-10 items-center justify-center rounded-xl border transition-colors"
          :class="stepIconClass(step.id)"
          @click="$emit('step-click', step.id)"
        >
          <component :is="icons[stepIcon(step.id)]" :size="17" stroke="1.9" />
        </button>

        <p
          class="tracking-caps text-center text-[10px] font-semibold uppercase sm:text-[11px]"
          :class="stepLabelClass(step.id)"
        >
          {{ step.label }}
        </p>

        <DropdownMenuRoot>
          <DropdownMenuTrigger as-child>
            <button
              type="button"
              class="tracking-caps inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase transition-colors sm:px-2.5"
              :class="stepChipClass(step.id)"
            >
              <span class="truncate">{{ chipLabel(step.id) }}</span>
              <IconChevronDown :size="12" stroke="2" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuPortal>
            <DropdownMenuContent
              align="center"
              :avoid-collisions="false"
              position="popper"
              class="menu-content"
            >
              <DropdownMenuItem
                v-for="status in step.options"
                :key="status"
                class="menu-item"
                @click="$emit('status-select', status)"
              >
                <component
                  :is="icons[PROGRESS_STATUS_MAP[status].icon]"
                  :size="14"
                  stroke="1.8"
                />
                {{ PROGRESS_STATUS_MAP[status].description }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenuRoot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { icons, IconChevronDown } from '@tabler/icons-vue'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from 'radix-vue'
import type { BookProgressStatus } from '~/types/book'
import { PROGRESS_STATUS_MAP } from '~/utils/constants'

type Step = {
  id: 1 | 2 | 3
  label: string
  options: BookProgressStatus[]
}

const props = withDefaults(
  defineProps<{
    currentStatus?: BookProgressStatus
  }>(),
  {
    currentStatus: 'not-owned',
  },
)

defineEmits<{
  (e: 'status-select', status: BookProgressStatus): void
  (e: 'step-click', step: number): void
}>()

const steps: Step[] = [
  {
    id: 1,
    label: 'Not Read',
    options: ['not-owned', 'owned'],
  },
  {
    id: 2,
    label: 'In Progress',
    options: ['reading', 'paused'],
  },
  {
    id: 3,
    label: 'Finished',
    options: ['read', 'not-finished'],
  },
]

const currentStep = computed(
  () => PROGRESS_STATUS_MAP[props.currentStatus].step,
)

function resolvedStatus(step: number): BookProgressStatus | null {
  if (step === currentStep.value) return props.currentStatus

  if (step < currentStep.value) {
    if (step === 1) return 'owned'
    if (step === 2) return 'reading'
  }

  return null
}

function chipLabel(step: number) {
  const status = resolvedStatus(step)

  if (!status) return 'Pending'

  return PROGRESS_STATUS_MAP[status].description
}

function stepIcon(step: number): keyof typeof icons {
  const status = resolvedStatus(step)

  if (status) return PROGRESS_STATUS_MAP[status].icon

  if (step === 1) return PROGRESS_STATUS_MAP['not-owned'].icon
  if (step === 2) return PROGRESS_STATUS_MAP.reading.icon

  return PROGRESS_STATUS_MAP.read.icon
}

function stepIconClass(step: number) {
  if (step === currentStep.value) {
    return 'border-primary bg-primary text-ink-inverse'
  }

  if (step < currentStep.value) {
    return 'border-primary/20 bg-primary/12 text-primary'
  }

  return 'border-stroke bg-surface-container text-ink-subtle'
}

function stepLabelClass(step: number) {
  if (step === currentStep.value) return 'text-primary'

  return 'text-ink-muted'
}

function stepChipClass(step: number) {
  if (step === currentStep.value) {
    return 'border-primary/35 bg-primary/12 text-primary hover:bg-primary/20 cursor-pointer'
  }

  if (step < currentStep.value) {
    return 'border-primary/15 bg-surface-canvas text-primary hover:bg-surface cursor-pointer'
  }

  return 'border-stroke-subtle bg-surface-canvas text-ink-muted cursor-pointer hover:bg-surface'
}
</script>

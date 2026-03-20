<template>
  <StepperRoot
    v-model:model-value="currentStep"
    class="mb-16 flex w-full pt-2"
    :linear="linear"
  >
    <div
      class="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-surface-elevated group-data-[state=active]:block"
      :class="{
        'size-[46px]': !small,
        'size-[38px]': small,
      }"
    />
    <StepperItem
      v-for="item in steps"
      :key="item.step"
      class="group relative flex w-full cursor-pointer flex-col items-center justify-center data-[disabled]:pointer-events-none"
      :step="item.step"
      :disabled="!interactive"
    >
      <StepperTrigger
        class="relative z-10 inline-flex shrink-0 items-center justify-center rounded-full bg-surface text-ink-inverse hover:bg-surface/80 active:bg-primary-800 group-data-[state=active]:bg-primary group-data-[state=completed]:bg-primary group-data-[disabled]:text-ink-inverse group-data-[state=active]:text-ink-inverse group-data-[state=completed]:text-ink-inverse"
        :class="{
          'size-10': !small,
          'size-8': small,
        }"
        @click="$emit('change', item.step)"
      >
        <StepperIndicator as="h5">
          <component
            :is="icons[item.icon]"
            v-if="item.icon"
            :size="small ? 18 : 20"
          />
          {{ item.icon && icons[item.icon] ? '' : item.step }}
        </StepperIndicator>
      </StepperTrigger>

      <StepperSeparator
        v-if="item.step !== steps[steps.length - 1]?.step"
        class="absolute -right-1/2 left-1/2 top-1/2 block h-[5px] shrink-0 -translate-y-1/2 rounded-full bg-surface group-data-[disabled]:bg-surface group-data-[state=completed]:bg-primary"
      />

      <div
        class="absolute top-full mt-2 w-full text-center text-ink-primary group-data-[state=active]:text-primary group-data-[state=inactive]:text-ink-muted"
      >
        <StepperTitle v-if="item.title" :as="small ? 'h6' : 'h5'">
          {{ item.title }}
        </StepperTitle>
        <StepperDescription
          v-if="item.description"
          class="text-base text-ink-primary group-data-[state=active]:text-ink-primary group-data-[state=inactive]:text-ink-muted"
        >
          {{ item.description }}
        </StepperDescription>
      </div>
    </StepperItem>
  </StepperRoot>
</template>

<script setup lang="ts">
import {
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperRoot,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from 'radix-vue'
import { icons } from '@tabler/icons-vue'

type Step = {
  step: number
  title?: string
  description?: string
  icon?: keyof typeof icons
}

withDefaults(
  defineProps<{
    steps: Step[]
    linear?: boolean
    interactive?: boolean
    small?: boolean
  }>(),
  { linear: false, interactive: false },
)

defineEmits<{
  (e: 'change', step: number): void
}>()

const currentStep = defineModel<number>()
</script>

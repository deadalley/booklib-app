<template>
  <StepperRoot
    v-model:model-value="currentStep"
    class="mb-16 flex w-full pt-2"
    :linear="linear"
  >
    <div
      class="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-main bg-white group-data-[state=active]:block"
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
        class="relative z-10 inline-flex shrink-0 items-center justify-center rounded-full bg-accent text-white hover:bg-accent/80 active:bg-main-dark group-data-[state=active]:bg-main group-data-[state=completed]:bg-main group-data-[disabled]:text-white group-data-[state=active]:text-white group-data-[state=completed]:text-white"
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
        v-if="item.step !== steps[steps.length - 1].step"
        class="absolute -right-1/2 left-1/2 top-1/2 block h-[5px] shrink-0 -translate-y-1/2 rounded-full bg-accent group-data-[disabled]:bg-accent group-data-[state=completed]:bg-main"
      />

      <div
        class="absolute top-full mt-2 w-full text-center text-black group-data-[state=active]:text-main group-data-[state=inactive]:text-accent-dark"
      >
        <StepperTitle v-if="item.title" :as="small ? 'h6' : 'h5'">
          {{ item.title }}
        </StepperTitle>
        <StepperDescription
          v-if="item.description"
          class="text-base text-black group-data-[state=active]:text-black group-data-[state=inactive]:text-accent-dark"
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

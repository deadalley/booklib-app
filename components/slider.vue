<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
  <div class="form-wrapper flex-1">
    <label v-if="!!label" for="default-range" class="form-label">{{
      label
    }}</label>

    <div class="px-5">
      <SliderRoot
        v-model="values"
        :max="max"
        :min="min"
        :step="step"
        class="relative mt-16 flex h-5 w-full touch-none select-none items-center"
      >
        <SliderTrack
          class="relative h-[5px] grow cursor-pointer rounded-full bg-accent"
        >
          <SliderRange class="absolute h-full rounded-full bg-main" />
        </SliderTrack>
        <SliderThumb v-for="(value, index) in values" :key="index">
          <span class="block size-5 cursor-pointer rounded-[10px] bg-main" />
          <div
            class="absolute bottom-8 left-0 flex -translate-x-1/4 items-center justify-center rounded-md bg-accent px-3 py-1 font-ReemKufi text-black"
          >
            {{ value }}
          </div>
        </SliderThumb>
      </SliderRoot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'radix-vue'

withDefaults(
  defineProps<{
    label?: string
    min?: number
    max?: number
    step?: number
  }>(),
  { step: 1, min: 0, max: 100 },
)

const values = defineModel<[number, number]>('values')
</script>

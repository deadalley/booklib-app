<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
  <div class="formkit-wrapper flex-1">
    <label v-if="!!label" for="default-range" class="formkit-label">{{
      label
    }}</label>

    <div class="px-5">
      <SliderRoot
        v-model="_values"
        :max="max"
        :min="min"
        :step="step"
        class="relative mt-16 flex h-5 w-[200px] touch-none select-none items-center"
      >
        <SliderTrack
          class="relative h-[5px] grow cursor-pointer rounded-full bg-accent"
        >
          <SliderRange class="absolute h-full rounded-full bg-main" />
        </SliderTrack>
        <SliderThumb v-for="(value, index) in _values" :key="index">
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
import { useVModel } from '@vueuse/core'
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'radix-vue'

const props = withDefaults(
  defineProps<{
    label?: string
    min?: number
    max?: number
    step?: number
    values: [number, number]
  }>(),
  { step: 1, min: 0, max: 100 },
)

const emit = defineEmits(['update:values'])

const _values = useVModel(props, 'values', emit, { passive: true })

watch(_values, (v) => console.log(v))
</script>

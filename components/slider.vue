<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
  <div class="formkit-wrapper flex-1">
    <label
      v-if="!!label"
      for="default-range"
      class="formkit-label text-gray-dark"
      >{{ label }}</label
    >
    <div class="relative mt-16 flex flex-col px-4">
      <div class="flex">
        <!-- Bar left -->
        <div
          class="m-0 box-border w-1/4 rounded-md border border-accent bg-accent-light py-1"
          :style="{ width: barMin + '%' }"
          @click="onBarLeftClick"
          @mousedown="onLeftThumbMousedown"
          @touchstart="onLeftThumbMousedown"
        ></div>
        <input
          class="pointer-events-none absolute left-0 top-0 w-full opacity-0"
          type="range"
          :min="min"
          :max="max"
          :step="step"
          :value="valueMin"
        />
        <!-- Thumb left -->
        <div
          class="thumb relative z-10 cursor-pointer"
          @mousedown="onLeftThumbMousedown"
          @touchstart="onLeftThumbMousedown"
        >
          <div
            class="absolute bottom-12 left-0 flex items-center justify-center overflow-visible"
          >
            <span
              class="absolute whitespace-nowrap rounded-lg bg-accent-light px-3 py-1 text-center text-black"
              >{{ barMinVal }}</span
            >
          </div>
        </div>
        <!-- Bar inner -->
        <div
          class="relative flex shrink grow justify-between border border-main bg-main-light"
        >
          <div
            class="w-1/2"
            @click="onInnerBarLeftClick"
            @mousedown="onLeftThumbMousedown"
            @touchstart="onLeftThumbMousedown"
          ></div>
          <div
            class="w-1/2"
            @click="onInnerBarRightClick"
            @mousedown="onRightThumbMousedown"
            @touchstart="onRightThumbMousedown"
          ></div>
        </div>
        <input
          class="pointer-events-none absolute left-0 top-0 w-full opacity-0"
          type="range"
          :min="min"
          :max="max"
          :step="step"
          :value="valueMax"
        />
        <!-- Thumb right -->
        <div
          class="thumb relative z-10 cursor-pointer"
          @mousedown="onRightThumbMousedown"
          @touchstart="onRightThumbMousedown"
        >
          <div
            class="absolute bottom-12 left-0 flex items-center justify-center overflow-visible"
          >
            <span
              class="absolute whitespace-nowrap rounded-lg bg-accent-light px-3 py-1 text-center text-black"
              >{{ barMaxVal }}</span
            >
          </div>
        </div>
        <!-- Bar right -->
        <div
          class="m-0 box-border w-1/4 rounded-md border border-accent bg-accent-light py-1"
          :style="{ width: barMax + '%' }"
          @click="onBarRightClick"
          @mousedown="onRightThumbMousedown"
          @touchstart="onRightThumbMousedown"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label?: string
    min?: number
    max?: number
    minValue?: number
    maxValue?: number
    step?: number
    rangeMargin?: number
  }>(),
  { step: 1, min: 0, max: 100 },
)

const valueMin = ref(props.min)
const valueMax = ref(props.max)

const startX = ref(0)

const barBox = ref(null)
const barValue = ref(0)

const rangeMarginValue = ref(props.step)

function getNewPosition(clientX: number) {
  const moveDistance = clientX - startX.value
  const movePercentage =
    moveDistance / ((barBox.value as unknown as DOMRect)?.width ?? 1)
  const maxRange = props.max - props.min

  let newValue = barValue.value + maxRange * movePercentage

  newValue -= newValue % props.step

  return newValue
}

function onBarLeftClick() {
  valueMin.value =
    valueMin.value - props.step >= props.min
      ? valueMin.value - props.step
      : props.min
}

function onInnerBarLeftClick() {
  if (valueMin.value + rangeMarginValue.value < valueMax.value) {
    valueMin.value = valueMin.value + props.step
  }
}

function onBarRightClick() {
  valueMax.value =
    valueMax.value + props.step <= props.max
      ? valueMax.value + props.step
      : props.max
}

function onInnerBarRightClick() {
  if (valueMax.value - rangeMarginValue.value > valueMin.value) {
    valueMax.value = valueMax.value - props.step
  }
}

function onLeftThumbMousedown(e: any) {
  e.preventDefault()

  startX.value = e.clientX

  if (e.type === 'touchstart') {
    if (e.touches.length === 1) {
      startX.value = e.touches[0].clientX
    } else {
      return
    }
  }

  barValue.value = valueMin.value
  barBox.value = e.target?.parentNode.getBoundingClientRect()

  document.addEventListener('mousemove', onLeftThumbMousemove)
  document.addEventListener('mouseup', onLeftThumbMouseup)
  document.addEventListener('touchmove', onLeftThumbMousemove)
  document.addEventListener('touchend', onLeftThumbMouseup)
}

function onLeftThumbMousemove(e: any) {
  let clientX = e.clientX

  if (e.type === 'touchmove') {
    clientX = e.touches[0].clientX
  }

  let newValue = getNewPosition(clientX)

  if (newValue < props.min) {
    newValue = props.min
  } else if (newValue > valueMax.value - rangeMarginValue.value) {
    newValue = valueMax.value - rangeMarginValue.value
  }

  valueMin.value = newValue
}

function onLeftThumbMouseup() {
  document.removeEventListener('mousemove', onLeftThumbMousemove)
  document.removeEventListener('mouseup', onLeftThumbMouseup)
  document.removeEventListener('touchmove', onLeftThumbMousemove)
  document.removeEventListener('touchend', onLeftThumbMouseup)
}

function onRightThumbMousedown(e: any) {
  e.preventDefault()

  startX.value = e.clientX

  if (e.type === 'touchstart') {
    if (e.touches.length === 1) {
      startX.value = e.touches[0].clientX
    } else {
      return
    }
  }

  barValue.value = valueMax.value
  barBox.value = e.target.parentNode.getBoundingClientRect()

  document.addEventListener('mousemove', onRightThumbMousemove)
  document.addEventListener('mouseup', onRightThumbMouseup)
  document.addEventListener('touchmove', onRightThumbMousemove)
  document.addEventListener('touchend', onRightThumbMouseup)
}

function onRightThumbMousemove(e: any) {
  let clientX = e.clientX

  if (e.type === 'touchmove') {
    clientX = e.touches[0].clientX
  }

  let newValue = getNewPosition(clientX)

  if (newValue < valueMin.value + rangeMarginValue.value) {
    newValue = valueMin.value + rangeMarginValue.value
  } else if (newValue > props.max) {
    newValue = props.max
  }

  valueMax.value = newValue
}

function onRightThumbMouseup() {
  document.removeEventListener('mousemove', onRightThumbMousemove)
  document.removeEventListener('mouseup', onRightThumbMouseup)
  document.removeEventListener('touchmove', onRightThumbMousemove)
  document.removeEventListener('touchend', onRightThumbMouseup)
}

const barMin = computed(() => {
  return ((valueMin.value - props.min) / (props.max - props.min)) * 100
})

const barMax = computed(() => {
  return 100 - ((valueMax.value - props.min) / (props.max - props.min)) * 100
})

const barMinVal = computed(() =>
  (valueMin.value || 0).toFixed(props.step.toString().includes('.') ? 2 : 0),
)

const barMaxVal = computed(() =>
  (valueMax.value || 100).toFixed(props.step.toString().includes('.') ? 2 : 0),
)

const value = defineModel<[number, number]>()

watch([valueMin, valueMax], (v) => {
  value.value = v
})
</script>

<style scoped>
.thumb::before {
  @apply absolute bg-accent-dark w-6 h-6 rounded-full z-10 cursor-pointer -top-2 -left-3;
  content: '';
}
</style>

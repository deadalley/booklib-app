<template>
  <div
    class="flex items-center text-black"
    @mouseenter="setHovered(true)"
    @mouseleave="setHovered(false)"
    @click="_onCommit"
  >
    <template v-for="(star, index) in stars" :key="index">
      <span
        :class="{ 'cursor-pointer': editing }"
        @mousemove="($event) => setRating($event, index + 1)"
      >
        <IconStarFilled v-if="star === 1" :size="iconSize" stroke="1.5" />
        <IconStarHalfFilled v-if="star === 0.5" :size="iconSize" stroke="1.5" />
        <IconStar v-if="star === 0" :size="iconSize" stroke="1.5" />
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { IconStar, IconStarFilled, IconStarHalfFilled } from '@tabler/icons-vue'

const props = withDefaults(
  defineProps<{
    editing?: boolean
    rating: number
    iconSize?: number
    onCommit?: (value: number) => Promise<void>
  }>(),
  { editing: false, iconSize: 24 },
)

const initialRating = ref(props.rating)
const currentRating = ref(props.rating)
const hovered = ref(false)

const stars = computed(() => {
  return Array(5)
    .fill(0)
    .map((_, i) =>
      i < Math.floor(currentRating.value)
        ? 1
        : i === Math.floor(currentRating.value) && currentRating.value % 1 > 0
          ? currentRating.value % 1
          : 0,
    )
})

watch(
  () => props.rating,
  async (value) => {
    initialRating.value = value
    currentRating.value = value
  },
)

function setHovered(value: boolean) {
  hovered.value = value

  if (!value) {
    currentRating.value = initialRating.value
  }
}

function getPosition($event: MouseEvent) {
  const starWidth = (92 / 100) * props.iconSize
  const offset = Math.max($event.offsetX, 1)
  const position = Math.round((100 / starWidth) * offset)

  return Math.min(position, 100)
}

function setRating($event: MouseEvent, id: number) {
  if (props.editing) {
    const maxRating = 5
    let newRating: number | undefined

    const position = getPosition($event) / 100

    newRating = +(id + position - 1).toFixed(2)
    newRating = newRating > maxRating ? maxRating : newRating

    const roundedRating = Math.round(newRating * 2) / 2

    currentRating.value = roundedRating
  }
}

function _onCommit() {
  if (props.editing) {
    initialRating.value = currentRating.value
    props.onCommit?.(currentRating.value)
  }
}
</script>

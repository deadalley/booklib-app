<template>
  <NuxtLink
    :to="selectable ? undefined : href"
    class="w-full"
    @click="onSelect"
  >
    <bl-empty-book-image
      v-if="!coverSrc"
      class="!h-48 !rounded-2xl !p-5"
      :class="{
        'hover:shadow-md hover:ring hover:ring-accent-dark': !selectable,
        '!ring-2 !ring-main': selectable && _selected,
      }"
    />
    <NuxtImg
      v-if="coverSrc"
      :src="coverSrc ?? undefined"
      :alt="alt"
      class="h-auto w-full max-w-full rounded-2xl object-cover object-center md:h-48 md:w-auto"
      :class="{
        'hover:shadow-md hover:ring hover:ring-accent-dark': !selectable,
        'ring-2 ring-main': selectable && _selected,
      }"
    />
  </NuxtLink>
</template>

<script setup lang="ts">
import { useVModel } from '@vueuse/core'

const props = defineProps<{
  href?: string
  alt?: string
  coverSrc?: string
  selectable?: boolean
  selected?: boolean
}>()

const emit = defineEmits(['update:selected'])

const _selected = useVModel(props, 'selected', emit)

function onSelect() {
  if (props.selectable) {
    _selected.value = !props.selected
    emit('update:selected', !props.selected)
  }
}
</script>

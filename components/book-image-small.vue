<template>
  <NuxtLink
    :to="selectable ? undefined : href"
    class="relative cursor-pointer"
    :class="{ 'w-full': !coverSrc }"
    @click="$emit('click')"
    @mouseenter="setHovered(true)"
    @mouseleave="setHovered(false)"
  >
    <bl-icon-button
      v-if="selectable"
      class="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300"
      :class="{
        'opacity-0': !selected,
        'opacity-100': selected || hovered,
      }"
    >
      <template #default="iconProps">
        <IconCheckbox v-if="selected && !hovered" v-bind="iconProps" />
        <IconX v-if="selected && hovered" v-bind="iconProps" />
        <IconPlus v-if="!selected && hovered" v-bind="iconProps" />
      </template>
    </bl-icon-button>
    <div
      v-if="selectable"
      class="absolute inset-0 z-10 size-full cursor-pointer rounded-xl bg-black transition-opacity duration-300"
      :class="{
        'opacity-0': !selected,
        'opacity-30': selected && !hovered,
        'opacity-60': hovered,
      }"
    />

    <bl-empty-book-image v-if="!coverSrc" class="!h-48 !p-5" :label="title" />
    <NuxtImg
      v-if="coverSrc"
      :src="coverSrc ?? undefined"
      :alt="alt"
      class="h-auto w-full max-w-full rounded-xl object-cover object-center md:h-48 md:w-auto"
    >
    </NuxtImg>
  </NuxtLink>
</template>

<script setup lang="ts">
import { IconCheckbox, IconX, IconPlus } from '@tabler/icons-vue'

const props = defineProps<{
  href?: string
  alt?: string
  title?: string
  coverSrc?: string
  selectable?: boolean
  selected?: boolean
}>()

console.log(props.coverSrc)

defineEmits(['click'])

const hovered = ref(false)

function setHovered(value: boolean) {
  hovered.value = value
}
</script>

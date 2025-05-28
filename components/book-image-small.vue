<template>
  <NuxtLink
    :to="selectable ? undefined : href"
    class="relative cursor-pointer rounded-xl border border-accent"
    :class="{
      'w-full': !coverSrc,
      'transition-all duration-300 ease-in-out': selectable,
      'border-main': selectable && !!selected,
    }"
    @click="$emit('click')"
    @mouseenter="setHovered(true)"
    @mouseleave="setHovered(false)"
  >
    <bl-icon-button
      v-if="selectable && hovered"
      class="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300"
      :class="{
        'opacity-0': !selected,
        'opacity-100': selected || hovered,
      }"
    >
      <template v-if="hovered" #default="iconProps">
        <IconX v-if="selected" v-bind="iconProps" />
        <IconPlus v-if="!selected" v-bind="iconProps" />
      </template>
    </bl-icon-button>
    <div
      v-if="selectable"
      class="absolute inset-0 z-10 size-full cursor-pointer rounded-xl bg-black transition-opacity duration-300"
      :class="{
        'opacity-0': !selected || !hovered,
        'opacity-60': hovered,
      }"
    />

    <bl-empty-book-image v-if="!coverSrc" :icon="icon" class="!h-48 !p-5">
      <template v-if="title" #default>
        {{ title }}
      </template>
      <template v-if="$slots['emptyLabel']" #emptyLabel>
        <slot name="emptyLabel" />
      </template>
    </bl-empty-book-image>
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
import type { icons } from '@tabler/icons-vue'
import { IconX, IconPlus } from '@tabler/icons-vue'

defineProps<{
  href?: string
  alt?: string
  title?: string
  coverSrc?: string | null
  selectable?: boolean
  selected?: boolean
  icon?: keyof typeof icons
}>()

defineEmits(['click'])

const hovered = ref(false)

function setHovered(value: boolean) {
  hovered.value = value
}
</script>

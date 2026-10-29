<template>
  <NuxtLink
    :to="selectable ? undefined : href"
    class="rounded-scholarly border-stroke relative w-full cursor-pointer border"
    :class="{
      'transition-all duration-300 ease-in-out': selectable,
      'border-primary': selectable && !!selected,
    }"
    @click="$emit('click')"
    @mouseenter="setHovered(true)"
    @mouseleave="setHovered(false)"
  >
    <bl-icon-button
      v-if="selectable && hovered"
      class="absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300"
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
      class="rounded-scholarly bg-surface-inverse absolute inset-0 z-10 size-full cursor-pointer transition-opacity duration-300"
      :class="{
        'opacity-0': !selected || !hovered,
        'opacity-60': hovered,
      }"
    />

    <bl-empty-book-image
      v-if="!coverSrc"
      :icon="icon"
      :icon-size="compact ? 14 : undefined"
      :class="
        compact
          ? '!h-12 !w-8 !p-0.5 [&_span]:hidden [&>div]:!p-0'
          : '!h-48 !p-5'
      "
    >
      <template v-if="title && !compact" #default>
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
      class="object-cover object-top"
      :class="
        compact
          ? 'rounded-scholarly h-12 w-8'
          : 'h-auto w-full rounded-xl md:h-48'
      "
    ></NuxtImg>
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
  compact?: boolean
}>()

defineEmits(['click'])

const hovered = ref(false)

function setHovered(value: boolean) {
  hovered.value = value
}
</script>

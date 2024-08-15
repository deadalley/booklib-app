<template>
  <NuxtLink
    :to="selectable ? undefined : href"
    class="w-full"
    @click="$emit('click')"
  >
    <bl-empty-book-image
      v-if="!coverSrc"
      class="!h-48 !rounded-2xl !p-5"
      :class="{
        'hover:ring-1 hover:ring-accent-dark': !selectable,
        '!ring-2 !ring-main': selectable && selected,
      }"
    />
    <NuxtImg
      v-if="coverSrc"
      :src="coverSrc ?? undefined"
      :alt="alt"
      class="h-auto w-full max-w-full rounded-2xl object-cover object-center md:h-48 md:w-auto"
      :class="{
        'hover:ring-1 hover:ring-accent-dark': !selectable,
        '!ring-2 ring-main': selectable && selected,
      }"
    />
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  href?: string
  alt?: string
  coverSrc?: string
  selectable?: boolean
  selected?: boolean
}>()

defineEmits(['click'])
</script>

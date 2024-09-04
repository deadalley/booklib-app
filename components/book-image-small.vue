<template>
  <NuxtLink
    :to="selectable ? undefined : href"
    class="relative w-full cursor-pointer"
    @click="$emit('click')"
  >
    <bl-empty-book-image
      v-if="!coverSrc"
      class="!h-48 !rounded-xl !p-5"
      :label="title"
      :class="{
        '!ring-2 !ring-main': selectable && selected,
      }"
    />
    <NuxtImg
      v-if="coverSrc"
      :src="coverSrc ?? undefined"
      :alt="alt"
      class="h-auto w-full max-w-full rounded-xl object-cover object-center md:h-48 md:w-auto"
      :class="{
        '!ring-2 !ring-main': selectable && selected,
      }"
    />
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  href?: string
  alt?: string
  title?: string
  coverSrc?: string
  selectable?: boolean
  selected?: boolean
}>()

defineEmits(['click'])
</script>

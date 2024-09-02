<template>
  <NuxtLink
    :to="selectable ? undefined : href"
    class="w-full"
    @click="$emit('click')"
  >
    <bl-empty-book-image v-if="!coverSrc" class="!h-48 !rounded-2xl !p-5" />
    <NuxtImg
      v-if="coverSrc"
      :src="coverSrc ?? undefined"
      :alt="alt"
      class="h-auto w-full max-w-full rounded-lg object-cover object-center md:h-48 md:w-auto"
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

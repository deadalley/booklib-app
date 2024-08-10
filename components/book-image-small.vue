<template>
  <NuxtLink :to="href" class="w-full">
    <bl-empty-book-image
      v-if="!coverSrc"
      class="!h-48 !rounded-2xl !p-5 hover:border hover:border-accent-dark hover:shadow-md"
    />
    <NuxtImg
      v-if="coverSrc"
      :src="coverSrc ?? undefined"
      :alt="alt"
      class="h-auto w-full max-w-full rounded-2xl object-cover object-center hover:border hover:border-accent-dark hover:shadow-md md:h-48 md:w-auto"
    />
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  href: string
  alt: string
  coverSrc?: string
}>()
</script>

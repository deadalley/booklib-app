<template>
  <NuxtLink to="library/book/new">
    <bl-button>
      <template #prependIcon="prependIcon">
        <IconPlus v-bind="prependIcon" />
      </template>
      New Book</bl-button
    >
  </NuxtLink>
</template>

<script setup lang="ts">
import { IconPlus } from '@tabler/icons-vue'

useHead({
  title: 'BookLib | My Library',
})

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
})
</script>

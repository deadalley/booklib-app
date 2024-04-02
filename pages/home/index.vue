<template>
  <NuxtLayout name="dashboard" title="Home">
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
  title: 'BookLib | Home',
})

definePageMeta({
  middleware: 'auth',
})
</script>

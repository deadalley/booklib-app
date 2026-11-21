<template>
  <!--
    Nuxt's default root. The key remounts the page only to show changes
    synced from other devices; navigation behaves as usual.
  -->
  <NuxtLayout :key="refreshKey">
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { refreshKey } = useFolderSync()
</script>

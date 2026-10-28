<template>
  <bl-collection-editor :collection-id="route.params.id as string" />
</template>

<script setup lang="ts">
const route = useRoute()

useHead({
  title: 'BookLib | My Library',
})
</script>

<template>
  <bl-book-form></bl-book-form>
</template>

<script setup lang="ts">
useHead({
  title: 'BookLib | My Library',
})

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
})
</script>

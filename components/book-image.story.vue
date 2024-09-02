<script setup>
import BookImage from './book-image.vue'

const book = buildBook()
</script>

<template>
  <Story title="Book Image">
    <div class="h-[500px] w-[300px]"><BookImage :book="book" /></div>
  </Story>
</template>

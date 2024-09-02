<script setup>
const book = buildBook()
</script>

<template>
  <Story title="Atoms/Book Image">
    <div class="h-[500px] w-[300px]"><bl-book-image :book="book" /></div>
  </Story>
</template>

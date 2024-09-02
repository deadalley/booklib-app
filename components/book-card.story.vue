<script setup>
import { buildBook } from '../utils'

const state = reactive({
  book: buildBook(),
})
</script>

<template>
  <Story title="Molecules/Book Card">
    <div class="w-[300px]">
      <bl-book-card :book="state.book" authorName="Author name" />
    </div>
  </Story>
</template>

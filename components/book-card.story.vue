<script setup>
import BookCard from './book-card.vue'
import { buildBook } from '../utils'

const state = reactive({
  book: buildBook(),
})
</script>

<template>
  <Story title="Book Card">
    <div class="w-[300px]">
      <BookCard :book="state.book" authorName="Author name" />
    </div>
  </Story>
</template>

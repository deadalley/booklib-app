<script setup>
import { buildBook } from '../utils'

const state = reactive({
  book: buildBook(),
})
</script>

<template>
  <Story title="Atoms/Book Image Small">
    <Variant title="Default">
      <div class="w-[300px]">
        <bl-book-image-small :coverSrc="state.book.coverSrc" />
      </div>
    </Variant>
    <Variant title="Empty">
      <div class="w-[300px]">
        <bl-book-image-small />
      </div>
    </Variant>
  </Story>
</template>

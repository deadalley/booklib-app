<script setup>
const state = reactive({
  editing: true,
  rating: 3.5,
})
</script>

<template>
  <Story title="Atoms/Rating">
    <bl-rating :editing="state.editing" :rating="state.rating" />
  </Story>
</template>

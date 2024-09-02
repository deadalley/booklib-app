<script setup>
const state = reactive({
  value: 'Mystery',
})
</script>

<template>
  <Story title="Atoms/Genre Tag">
    <bl-genre-tag :value="state.value" />

    <template #controls>
      Value: <input v-model="state.value" type="text" />
    </template>
  </Story>
</template>

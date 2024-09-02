<script setup>
const state = reactive({
  view: 'table',
  views: ['cards', 'table'],
})
</script>

<template>
  <Story title="Organisms/View Switch">
    <bl-view-switch :views="state.views" :view="state.view" />
  </Story>
</template>

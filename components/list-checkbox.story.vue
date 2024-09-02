<script setup>
import ListCheckbox from './list-checkbox.vue'
import ListCheckboxOption from './list-checkbox-option.vue'
</script>

<template>
  <Story title="List Checkbox">
    <ListCheckbox>
      <ListCheckboxOption value="item1">Item 1</ListCheckboxOption>
      <ListCheckboxOption value="item2">Item 2</ListCheckboxOption>
      <ListCheckboxOption value="item3">Item 3</ListCheckboxOption>
      <ListCheckboxOption value="item4">Item 4</ListCheckboxOption>
    </ListCheckbox>
  </Story>
</template>

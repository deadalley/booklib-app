<script setup>
import { IconHeart } from '@tabler/icons-vue'
import IconButton from './icon-button.vue'
</script>

<template>
  <Story title="Icon Button">
    <IconButton>
      <template v-slot="iconProps">
        <IconHeart v-bind="iconProps" />
      </template>
    </IconButton>
  </Story>
</template>

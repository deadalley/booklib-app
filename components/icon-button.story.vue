<script setup>
import { IconHeart } from '@tabler/icons-vue'
</script>

<template>
  <Story title="Atoms/Icon Button">
    <bl-icon-button>
      <template #default="iconProps">
        <IconHeart v-bind="iconProps" />
      </template>
    </bl-icon-button>
  </Story>
</template>

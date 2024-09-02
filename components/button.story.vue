<script setup>
import { IconPlus } from '@tabler/icons-vue'
import Button from './button.vue'
</script>

<template>
  <Story title="Button">
    <Variant title="Default">
      <Button>Button</Button>
    </Variant>
    <Variant title="Prepend Icon">
      <Button>
        <template #prependIcon="prependIcon">
          <IconPlus v-bind="prependIcon" />
        </template>
        Button
      </Button>
    </Variant>
    <Variant title="Append Icon">
      <Button>
        <template #appendIcon="appendIcon">
          <IconPlus v-bind="appendIcon" />
        </template>
        Button
      </Button>
    </Variant>
  </Story>
</template>

<script setup>
import { IconPlus } from '@tabler/icons-vue'
</script>

<template>
  <Story title="Atoms/Button">
    <Variant title="Default">
      <bl-button>Button</bl-button>
    </Variant>
    <Variant title="Prepend Icon">
      <bl-button>
        <template #prependIcon="prependIcon">
          <IconPlus v-bind="prependIcon" />
        </template>
        Button
      </bl-button>
    </Variant>
    <Variant title="Append Icon">
      <bl-button>
        <template #appendIcon="appendIcon">
          <IconPlus v-bind="appendIcon" />
        </template>
        Button
      </bl-button>
    </Variant>
  </Story>
</template>

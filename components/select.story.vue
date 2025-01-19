<script setup>
import config from '../formkit.config.ts'

const state = reactive({
  name: 'selectName',
  label: 'Label',
  placeholder: 'Select a fruit...',
  editing: true,
  options: [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Blueberry', value: 'blueberry' },
    { label: 'Grapes', value: 'grapes' },
    { label: 'Pineapple', value: 'pineapple' },
    { label: 'Orange', value: 'orange' },
    { label: 'Fig', value: 'fig' },
    { label: 'Grapefruit', value: 'grapefruit' },
    { label: 'Watermelon', value: 'watermelon' },
    { label: 'Melon', value: 'melon' },
    { label: 'Guava', value: 'guava' },
    { label: 'Mandarin', value: 'mandarin' },
    { label: 'Pear', value: 'pear' },
    { label: 'Peach', value: 'peach' },
  ],
})

// eslint-disable-next-line
function setupApp({ app }) {
  app.use(plugin, defaultConfig(config))
}
</script>

<template>
  <Story title="Atoms/Select">
    <Variant title="Default">
      <bl-select v-bind="state" />
    </Variant>
  </Story>
</template>

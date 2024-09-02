<script setup>
import config from '../formkit.config.ts'
import Input from './input.vue'

const state = reactive({
  name: 'inputName',
  label: 'Label',
  placeholder: 'Placeholder',
  editing: true,
})

// eslint-disable-next-line
function setupApp({ app }) {
  app.use(plugin, defaultConfig(config))
}
</script>

<template>
  <Story title="Input">
    <Variant title="Default">
      <Input
        :name="state.name"
        :label="state.label"
        :placeholder="state.placeholder"
      />
    </Variant>
    <Variant title="Prefix">
      <Input>
        <template #prefix>{{ state.prefix }}</template>
      </Input>
    </Variant>
    <Variant title="Postfix">
      <Input>
        <template #postfix>{{ state.postfix }}</template>
      </Input>
    </Variant>
  </Story>
</template>

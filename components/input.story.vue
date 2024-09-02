<script setup>
import config from '../formkit.config.ts'

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
  <Story title="Atoms/Input">
    <Variant title="Default">
      <bl-input
        :name="state.name"
        :label="state.label"
        :placeholder="state.placeholder"
      />
    </Variant>
    <Variant title="Prefix">
      <bl-input>
        <template #prefix>{{ state.prefix }}</template>
      </bl-input>
    </Variant>
    <Variant title="Postfix">
      <bl-input>
        <template #postfix>{{ state.postfix }}</template>
      </bl-input>
    </Variant>
  </Story>
</template>

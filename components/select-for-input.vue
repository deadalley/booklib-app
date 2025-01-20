<template>
  <bl-raw-select
    v-model="selectValue"
    :class="context.attrs?.class"
    :options="context.options"
    :placeholder="context.placeholder"
    :with-wrapper="false"
  />
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    context: {
      attrs?: { class?: string }
      options: { label: string; value: string }[]
      placeholder?: string
      node: { input: (value: string) => void; _value: string }
    }
  }>(),
  {},
)

const selectValue = ref(props.context.node?._value)

watch(selectValue, (value) => {
  if (value) {
    props.context.node?.input?.(value)
  }
})
</script>

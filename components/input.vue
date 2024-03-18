<template>
  <div v-if="!editing" :class="classes.ElementLayout.container">
    <label :class="classes.ElementLabel.container">{{ label }}</label>
    <h6>{{ $attrs.value }}</h6>
  </div>
  <TextElement
    v-if="editing"
    v-bind="{ ...$attrs, ...$props }"
    :placeholder="placeholder"
    :replace-classes="classes"
  >
    <template v-if="prefix" #addon-before> {{ prefix }} </template>
    <template v-if="postfix" #addon-after> {{ postfix }} </template>
  </TextElement>
</template>

<script setup lang="ts">
const props = defineProps({
  columns: {
    type: Number,
    required: false,
  },
  editing: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    required: false,
  },
  prefix: String,
  postfix: String,
})

const classes = computed(() => {
  const baseStyles: Record<string, string[]> = {
    wrapper: [],
    inputContainer: ['flex items-center gap-3 rounded-m px-5 py-3'],
    label: ['text-base font-medium'],
  }

  if (props.editing) {
    baseStyles.label.push('ml-5')
  } else {
    if (props.columns) {
      baseStyles.wrapper.push(`col-span-${props.columns}`)
    }
  }

  return {
    ElementLayout: {
      container: baseStyles.wrapper.join(' '),
    },
    inputContainer: baseStyles.inputContainer.join(' '),
    ElementLabel: {
      container: baseStyles.label.join(' '),
    },
    ElementLabelFloating: {
      container: 'hidden',
      label: 'hidden',
    },
    ElementAddon: {
      container: 'text-gray-dark',
    },
  }
})
</script>

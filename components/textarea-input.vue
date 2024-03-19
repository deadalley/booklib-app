<template>
  <div v-if="!editing" :class="classes.ElementLayout.container">
    <label :class="classes.ElementLabel.container">{{ label }}</label>
    <h6 v-if="$attrs.value">{{ $attrs.value }}</h6>
    <p v-if="!$attrs.value" class="text-gray">Empty</p>
  </div>
  <TextareaElement
    v-if="editing"
    v-bind="{ ...$attrs, ...$props }"
    :placeholder="placeholder"
    :add-classes="classes"
  >
    <template v-if="prefix" #addon-before> {{ prefix }} </template>
    <template v-if="postfix" #addon-after> {{ postfix }} </template>
  </TextareaElement>
</template>

<script setup lang="ts">
const props = defineProps({
  columns: {
    type: Number,
    required: false,
  },
  editing: {
    type: Boolean,
    default: true,
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
    wrapper: [''],
    label: [],
  }

  if (props.editing) {
    baseStyles.label.push('ml-5')
  } else {
    if (props.columns) {
      // col-span-6
      baseStyles.wrapper.push(`col-span-${props.columns}`)
    }
  }

  return {
    ElementLayout: {
      container: baseStyles.wrapper.join(' '),
    },
    ElementLabel: {
      container: baseStyles.label.join(' '),
    },
  }
})
</script>

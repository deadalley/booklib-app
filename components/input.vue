<template>
  <div class="flex flex-col gap-3">
    <label :class="classes.label">{{ label }}</label>
    <div v-if="!editing">
      <h5>{{ value }}</h5>
    </div>
    <div v-if="editing" class="flex items-center gap-3 rounded-m px-5 py-3">
      <div v-if="prefix" class="text-gray-dark">
        <slot name="prefix"></slot>
      </div>
      <input
        :type="type"
        class="w-full flex-grow bg-transparent focus:outline-none"
        v-bind="$attrs"
      />
      <div v-if="postfix" class="text-gray-dark">
        <slot name="postfix"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  value: {
    type: String,
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
  prefix: String,
  postfix: String,
})

const classes = computed(() => {
  const baseStyles: Record<string, string[]> = {
    label: ['text-base font-medium'],
  }

  if (props.editing) {
    baseStyles.label.push('ml-5')
  }

  return {
    label: baseStyles.label.join(' '),
  }
})
</script>

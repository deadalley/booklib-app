<template>
  <div class="flex flex-col gap-3">
    <label class="text-base ml-5 font-medium">{{ label }}</label>
    <div class="flex items-center gap-3 rounded-m px-5 py-3">
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
defineProps({
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
</script>

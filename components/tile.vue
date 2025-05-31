<template>
  <div
    class="flex flex-col gap-3 rounded-xl border border-accent bg-white px-8 py-6"
  >
    <div
      v-if="$slots['title'] || $slots['actions']"
      class="flex justify-between gap-3"
    >
      <h5 v-if="$slots['title']"><slot name="title" /></h5>
      <slot name="actions" />
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts"></script>

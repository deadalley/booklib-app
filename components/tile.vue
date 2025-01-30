<template>
  <div class="flex flex-col rounded-xl border border-accent bg-white px-8 py-6">
    <h5 v-if="$slots['title']"><slot name="title" /></h5>
    <slot />
  </div>
</template>

<script setup lang="ts"></script>

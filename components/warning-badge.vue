<template>
  <div
    v-bind="$attrs"
    class="flex flex-col justify-between gap-2 rounded-xl bg-main/10 px-6 py-4 font-Sarala text-main"
  >
    <div class="flex items-center gap-1">
      <slot
        class="min-w-8 font-Sarala"
        name="icon"
        :size="ICON_SIZE_SMALL"
        stroke="2"
      />
      <h5><slot name="title" /></h5>
    </div>
    <div class="text-black">
      <slot name="content" />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<template>
  <div
    v-bind="$attrs"
    class="flex flex-col gap-2 rounded-xl bg-main/10 px-6 py-4 font-Sarala text-main"
  >
    <div class="flex items-center gap-1">
      <slot
        v-if="!!$slots.title"
        class="min-w-8"
        name="icon"
        :size="ICON_SIZE_SMALL"
        stroke="2"
      />
      <h5><slot name="title" /></h5>
    </div>
    <div class="flex gap-1 text-black">
      <slot
        v-if="!$slots.title"
        class="mt-[2px] min-w-8 text-main"
        name="icon"
        :size="ICON_SIZE_SMALL"
        stroke="2"
      />
      <slot name="content" />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

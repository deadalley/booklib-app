<template>
  <div
    v-bind="$attrs"
    class="bg-primary/10 font-body text-ink-primary flex flex-col gap-2 rounded-xl px-6 py-4"
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
    <div class="text-ink-primary flex gap-1">
      <slot
        v-if="!$slots.title"
        class="text-primary mt-[2px] min-w-8"
        name="icon"
        :size="ICON_SIZE_SMALL"
        stroke="2"
      />
      <slot name="content" />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

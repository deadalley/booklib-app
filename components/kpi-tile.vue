<template>
  <bl-tile>
    <div class="flex flex-col">
      <div class="flex items-center gap-2">
        <slot name="icon" class="text-primary" :size="38" stroke="1.5" />
        <h1 class="text-primary leading-10">
          <slot name="value" />
        </h1>
      </div>
      <h5 class="text-ink-primary font-normal"><slot name="unit" /></h5>
    </div>
  </bl-tile>
</template>

<script setup lang="ts"></script>

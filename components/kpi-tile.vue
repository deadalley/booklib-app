<template>
  <bl-tile>
    <div class="flex flex-col">
      <div class="flex items-center gap-2">
        <slot name="icon" class="text-primary" :size="38" stroke="1.5" />
        <h1 class="leading-10 text-primary">
          <slot name="value" />
        </h1>
      </div>
      <h5 class="font-normal text-ink-primary"><slot name="unit" /></h5>
    </div>
  </bl-tile>
</template>

<script setup lang="ts"></script>

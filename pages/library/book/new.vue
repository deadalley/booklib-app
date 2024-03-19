<template>
  <div class="flex flex-col gap-10 flex-1 overflow-auto">
    <header class="flex gap-3 justify-between items-end">
      <h2 class="flex items-end leading-none">New Book</h2>
      <div class="flex flex-col leading-tight justify-end">
        <p>Added on</p>
        <h6>01/01/2021</h6>
      </div>
    </header>
    <div class="flex gap-10 flex-1 overflow-auto">
      <bl-book-image alt="book-cover"></bl-book-image>
      <div class="overflow-y-auto">
        <bl-book-form></bl-book-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

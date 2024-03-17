<template>
  <nav
    class="bg-main px-6 pt-16 pb-8 h-full text-accent-light gap-6 flex flex-col"
  >
    <h2 class="text-accent-light font-normal tracking-wider mb-6">BOOKLIB</h2>
    <div class="flex flex-col justify-between flex-1">
      <div class="flex flex-col gap-3 flex-1">
        <bl-nav-sidebar-button
          v-for="button in buttons"
          :key="button.label"
          :active="activeItem === button.label"
          @click="setActiveItem(button.label)"
          >{{ button.label }}</bl-nav-sidebar-button
        >
      </div>
      <div class="flex flex-col gap-3">
        <bl-nav-sidebar-button>Logout</bl-nav-sidebar-button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const buttons = [{ label: 'Home ' }, { label: 'Library' }]
const activeItem = ref()

function setActiveItem(item: string) {
  console.log(item)
  activeItem.value = item
}
</script>

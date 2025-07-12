<template>
  <div class="relative flex h-screen w-screen flex-col sm:flex-row">
    <bl-nav-sidebar />
    <bl-sidebar :open="sidebarOpen" @close="sidebarOpen = false">
      <ul v-if="!!navItems?.length" class="flex flex-col gap-5">
        <li
          v-for="item of navItems"
          :key="item.label"
          class="text-xl hover:text-main"
        >
          <NuxtLink :to="item.to" @click="sidebarOpen = false">{{
            item.label
          }}</NuxtLink>
        </li>
      </ul>
    </bl-sidebar>
    <main
      class="relative flex h-0 w-full flex-1 flex-col sm:h-screen sm:flex-[unset]"
    >
      <nav class="flex items-center gap-8 border-b border-b-accent px-8 py-4">
        <NuxtLink class="flex-1" to="/library/books">
          <h5>{{ title }}</h5>
        </NuxtLink>

        <ul v-if="!!navItems?.length" class="hidden gap-5 sm:flex">
          <li
            v-for="item of navItems"
            :key="item.label"
            class="text-lg hover:text-main"
          >
            <NuxtLink :to="item.to">{{ item.label }}</NuxtLink>
          </li>
        </ul>

        <slot name="action-btn" />

        <IconMenu2
          :size="ICON_SIZE_MEDIUM"
          stroke="1.5"
          class="cursor-pointer hover:text-main sm:hidden"
          @click="sidebarOpen = !sidebarOpen"
        />
      </nav>
      <div
        class="relative flex w-full flex-1 flex-col overflow-y-auto p-8 pt-10 sm:p-16"
      >
        <slot />
        <NuxtLoadingIndicator color="#985858" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { IconMenu2 } from '@tabler/icons-vue'

defineProps<{ title: string; navItems?: { to?: string; label: string }[] }>()

const sidebarOpen = ref(false)

watch(sidebarOpen, (v) => console.log(v))
</script>

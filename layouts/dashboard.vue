<template>
  <div class="relative flex h-screen w-screen">
    <bl-nav-sidebar />
    <main class="relative flex h-screen w-1/2 flex-1 flex-col">
      <nav class="flex items-center gap-8 border-b border-b-accent px-8 py-4">
        <NuxtLink class="flex-1" to="/library/books">
          <h5>{{ title }}</h5>
        </NuxtLink>

        <ul v-if="!!navItems?.length" class="flex gap-5">
          <li
            v-for="item of navItems"
            :key="item.label"
            class="text-lg hover:text-main"
          >
            <NuxtLink :to="item.to">{{ item.label }}</NuxtLink>
          </li>
        </ul>

        <slot name="action-btn" />
      </nav>
      <div
        class="relative flex w-full flex-1 flex-col overflow-y-auto p-16 pt-10"
      >
        <slot />
        <NuxtLoadingIndicator color="#985858" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; navItems?: { to?: string; label: string }[] }>()
</script>

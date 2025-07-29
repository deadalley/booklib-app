<template>
  <div class="relative flex h-screen w-screen flex-col sm:flex-row">
    <bl-nav-sidebar />
    <bl-sidebar
      v-if="!!navItems?.length"
      :open="sidebarOpen"
      title=" "
      @close="sidebarOpen = false"
    >
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
          v-if="!!navItems?.length"
          :size="ICON_SIZE_MEDIUM"
          stroke="1.5"
          class="cursor-pointer hover:text-main sm:hidden"
          @click="sidebarOpen = !sidebarOpen"
        />
      </nav>
      <div
        class="relative flex w-full flex-1 flex-col overflow-y-auto p-8 pt-10 sm:p-16"
      >
        <bl-warning-badge v-if="isWebEnvironment" class="mb-4 hidden md:flex">
          <template #icon="iconProps">
            <IconAlertTriangle v-bind="iconProps" />
          </template>
          <template #content>
            You are running a <b class="contents">demo</b> version of BookLib.
            Your data is stored in the browser session and will not be available
            elsewhere. To use BookLib fully, please download the app at
            <NuxtLink
              to="https://github.com/deadalley/booklib-app/releases/latest"
              class="contents font-semibold underline hover:text-main"
              target="_blank"
            >
              @deadalley/booklib-app
            </NuxtLink>
            .
          </template>
        </bl-warning-badge>
        <slot />
        <NuxtLoadingIndicator color="#985858" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { IconAlertTriangle, IconMenu2 } from '@tabler/icons-vue'

defineProps<{ title: string; navItems?: { to?: string; label: string }[] }>()

const sidebarOpen = ref(false)
const isWebEnvironment = ref<boolean>(
  typeof window !== 'undefined' && !('electronAPI' in window),
)
</script>

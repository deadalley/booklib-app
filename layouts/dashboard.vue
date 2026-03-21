<template>
  <div class="relative flex h-screen w-screen flex-col sm:flex-row">
    <!-- Fixed app navigation sidebar -->
    <bl-nav-sidebar />

    <!-- Dynamic sidebar -->
    <bl-sidebar
      v-if="!!navItems?.length"
      :open="sidebarOpen"
      title=" "
      @close="sidebarOpen = false"
    >
      <ul v-if="!!navigationItems?.length" class="flex flex-col gap-5">
        <li
          v-for="item of navigationItems"
          :key="item.label"
          class="hover:text-primary text-xl"
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
      <!-- Header -->
      <nav class="border-b-stroke flex items-center gap-8 border-b px-8 py-4">
        <!-- Page title -->
        <NuxtLink
          v-if="!navigationItems?.length"
          to="/library/books"
          class="flex flex-1 justify-center"
        >
          <h6>{{ title }}</h6>
        </NuxtLink>

        <!-- Navigation items -->
        <ul
          v-if="!!navigationItems?.length"
          class="hidden flex-1 items-center justify-center gap-5 sm:flex"
        >
          <li
            v-for="item of navigationItems"
            :key="item.label"
            class="hover:text-primary"
            :class="{
              'text-primary': item.active,
            }"
          >
            <NuxtLink :to="item.to">
              <h6>
                {{ item.label }}
              </h6>
            </NuxtLink>
          </li>
        </ul>

        <!-- Action button -->
        <slot name="action-btn" />

        <IconMenu2
          v-if="!!navigationItems?.length"
          :size="ICON_SIZE_MEDIUM"
          stroke="1.5"
          class="hover:text-primary cursor-pointer sm:hidden"
          @click="sidebarOpen = !sidebarOpen"
        />
      </nav>
      <div
        class="relative flex w-full flex-1 flex-col overflow-y-auto p-8 pt-10 sm:p-16"
      >
        <!-- Demo alert -->
        <!-- <bl-warning-badge v-if="isWebEnvironment" class="mb-4">
          <template #icon="iconProps">
            <IconAlertTriangle v-bind="iconProps" />
          </template>
          <template #content>
            You are running a <b class="contents">demo</b> version of BookLib.
            Your data is stored in the browser session and will not be available
            elsewhere. To use BookLib fully, please download the app at
            <NuxtLink
              to="https://github.com/deadalley/booklib-app/releases/latest"
              class="hover:text-primary contents font-semibold underline"
              target="_blank"
            >
              @deadalley/booklib-app
            </NuxtLink>
            .
          </template>
        </bl-warning-badge> -->

        <!-- Content -->
        <slot />

        <!-- Loading indicator -->
        <NuxtLoadingIndicator color="#985858" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { IconAlertTriangle, IconMenu2 } from '@tabler/icons-vue'

const route = useRoute()

const props = defineProps<{
  title: string
  navItems?: { to?: string; label: string }[]
}>()

const navigationItems = computed(() => {
  const path = route.path.split('/').at(-1)
  return props.navItems?.map((item) => ({
    ...item,
    active: route.path.includes(item.to ?? '') || item.to === path,
  }))
})

const sidebarOpen = ref(false)
const isWebEnvironment = ref<boolean>(
  typeof window !== 'undefined' && !('electronAPI' in window),
)
</script>

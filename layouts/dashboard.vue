<template>
  <div class="relative flex h-dvh w-full flex-col sm:flex-row">
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
          class="hover:text-primary font-display text-2xl"
        >
          <NuxtLink :to="item.to" @click="sidebarOpen = false">
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>
    </bl-sidebar>
    <main
      class="relative flex h-0 w-full min-w-0 flex-1 flex-col sm:h-dvh sm:flex-[unset]"
    >
      <!-- Header: title or section links centred, actions on the right. A
           three-column grid keeps the centre from overlapping the search. -->
      <nav
        class="border-b-stroke grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b px-4 py-3 sm:px-8"
      >
        <span aria-hidden="true" />

        <div class="flex min-w-0 items-center justify-center">
          <!-- Page title -->
          <NuxtLink
            v-if="!navigationItems?.length"
            :to="route.path"
            class="hover:text-primary truncate"
          >
            <h6 class="truncate">{{ title }}</h6>
          </NuxtLink>

          <!-- Navigation items -->
          <ul
            v-if="!!navigationItems?.length"
            class="hidden items-center justify-center gap-5 lg:flex"
          >
            <li
              v-for="item of navigationItems"
              :key="item.label"
              class="hover:text-primary"
              :class="{
                'text-primary': item.active,
              }"
            >
              <NuxtLink
                :to="item.to"
                :aria-current="item.active ? 'page' : undefined"
              >
                <h6>
                  {{ item.label }}
                </h6>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div class="flex min-w-0 items-center justify-end gap-4">
          <!-- Global search bar -->
          <bl-global-search />

          <bl-icon-button
            variant="tertiary"
            class="flex-none"
            :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`"
            :title="`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`"
            data-testid="theme-toggle"
            @click="toggleTheme"
          >
            <template #default="iconProps">
              <component
                :is="theme === 'dark' ? IconSun : IconMoon"
                v-bind="iconProps"
              />
            </template>
          </bl-icon-button>

          <slot name="action-btn" />

          <bl-icon-button
            v-if="!!navigationItems?.length"
            variant="tertiary"
            class="lg:hidden"
            aria-label="Open section menu"
            @click="sidebarOpen = !sidebarOpen"
          >
            <template #default="iconProps">
              <IconMenu2 v-bind="iconProps" />
            </template>
          </bl-icon-button>
        </div>
      </nav>
      <div
        class="relative flex w-full min-w-0 flex-1 flex-col overflow-y-auto px-4 pt-8 pb-10 sm:px-8 sm:py-10 xl:px-12 xl:py-14 2xl:px-16 2xl:py-16"
      >
        <!-- Demo alert -->
        <bl-alert v-if="isWebEnvironment" icon="IconAlertTriangle" class="mb-4">
          You are running a
          <b class="contents">demo</b>
          version of BookLib. Your data is stored in this browser only and will
          not be available elsewhere. To keep your library safely on your
          device,
          <NuxtLink
            :to="RELEASES_URL"
            class="hover:text-primary contents font-semibold underline"
            target="_blank"
          >
            download BookLib for Windows, Linux or Android
          </NuxtLink>
          .
        </bl-alert>

        <!-- Content -->
        <slot />

        <bl-add-book-modal />
        <!-- Changes synced in from other computers -->
        <bl-toast
          :message="
            syncPulled
              ? `Updated ${syncPulled} ${syncPulled === 1 ? 'item' : 'items'} from your other computers`
              : null
          "
          action-label="Refresh"
          @action="showSyncChanges"
        />

        <!-- Loading indicator -->
        <NuxtLoadingIndicator :color="loadingColor" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { IconMenu2, IconMoon, IconSun } from '@tabler/icons-vue'
import { RELEASES_URL, isWebDemo } from '~/utils/platform'

const route = useRoute()
const { pulled: syncPulled, showChanges: showSyncChanges } = useFolderSync()

const isWebEnvironment = ref<boolean>(isWebDemo())

const { colors, theme, toggleTheme } = useTheme()
const loadingColor = computed(() => colors.value.primary.DEFAULT)

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
</script>

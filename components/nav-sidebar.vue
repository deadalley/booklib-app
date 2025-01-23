<template>
  <nav
    class="flex h-full flex-col gap-6 border-r border-r-accent bg-background px-6 pb-8 pt-16"
  >
    <h3 class="mb-6 cursor-pointer text-2xl font-medium tracking-wider">
      <NuxtLink to="/"> BOOKLIB </NuxtLink>
    </h3>
    <div class="flex flex-1 flex-col justify-between">
      <div class="flex flex-1 flex-col gap-3">
        <bl-nav-sidebar-button
          v-for="(button, index) in buttons"
          :key="button.label"
          :active="activeItemIndex === index"
          :to="button.to"
          :disabled="button.disabled"
        >
          <template #icon="iconProps">
            <component v-bind="iconProps" :is="button.icon" />
          </template>
          {{ button.label }}
        </bl-nav-sidebar-button>
      </div>
      <div class="flex flex-col gap-3" @click="onLogout">
        <bl-nav-sidebar-button>
          <template #icon="iconProps">
            <IconLogout v-bind="iconProps" />
          </template>
          Logout
        </bl-nav-sidebar-button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import {
  IconLogout,
  IconBooks,
  IconHome,
  IconClockHour3,
  IconChartLine,
  IconBookUpload,
} from '@tabler/icons-vue'

const route = useRoute()
const supabase = useSupabaseClient()

const { data: isEmpty } = await useFetch<number>('/api/library/is-empty')

const buttons = [
  { label: 'Home', icon: IconHome, to: '/home', disabled: false },
  {
    label: 'Library',
    icon: IconBooks,
    to: '/library',
    disabled: !!isEmpty.value,
  },
  {
    label: 'Statistics',
    icon: IconChartLine,
    to: '/stats',
    disabled: !!isEmpty.value,
  },
  {
    label: 'Tracking',
    icon: IconClockHour3,
    to: '/tracking',
    disabled: !!isEmpty.value,
  },
  { label: 'Import', icon: IconBookUpload, to: '/import', disabled: false },
]
const activeItemIndex = computed(() =>
  buttons.findIndex(({ to }) => route.path.includes(to)),
)

async function onLogout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  else navigateTo('/login')
}
</script>

<template>
  <nav
    class="flex h-full flex-col gap-6 bg-main-dark px-6 pb-8 pt-16 text-accent-light"
  >
    <h3
      class="mb-6 cursor-pointer font-normal tracking-wider text-accent-light"
    >
      <NuxtLink to="/"> BOOKLIB </NuxtLink>
    </h3>
    <div class="flex flex-1 flex-col justify-between">
      <div class="flex flex-1 flex-col gap-3">
        <bl-nav-sidebar-button
          v-for="(button, index) in buttons"
          :key="button.label"
          :active="activeItemIndex === index"
        >
          <template #icon="iconProps">
            <component v-bind="iconProps" :is="button.icon"></component>
          </template>
          <NuxtLink :to="button.to">
            {{ button.label }}
          </NuxtLink>
        </bl-nav-sidebar-button>
      </div>
      <div class="flex flex-col gap-3" @click="onLogout">
        <bl-nav-sidebar-button
          ><template #icon="iconProps"
            ><IconLogout v-bind="iconProps" /></template
          >Logout</bl-nav-sidebar-button
        >
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { IconLogout, IconBooks } from '@tabler/icons-vue'

const route = useRoute()
const supabase = useSupabaseClient()

const buttons = [{ label: 'Library', icon: IconBooks, to: '/library' }]
const activeItemIndex = computed(() =>
  buttons.findIndex(({ to }) => route.path.includes(to)),
)

async function onLogout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  navigateTo('/login')
}
</script>

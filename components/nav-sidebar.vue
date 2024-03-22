<template>
  <nav
    class="bg-main px-6 pt-16 pb-8 h-full text-accent-light gap-6 flex flex-col"
  >
    <h3
      class="text-accent-light font-normal tracking-wider mb-6 cursor-pointer"
    >
      <NuxtLink to="/"> BOOKLIB </NuxtLink>
    </h3>
    <div class="flex flex-col justify-between flex-1">
      <div class="flex flex-col gap-3 flex-1">
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

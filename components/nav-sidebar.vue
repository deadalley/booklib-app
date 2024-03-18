<template>
  <nav
    class="bg-main px-6 pt-16 pb-8 h-full text-accent-light gap-6 flex flex-col"
  >
    <h2
      class="text-accent-light font-normal tracking-wider mb-6 cursor-pointer"
      @click="onTitleClick"
    >
      BOOKLIB
    </h2>
    <div class="flex flex-col justify-between flex-1">
      <div class="flex flex-col gap-3 flex-1">
        <bl-nav-sidebar-button
          v-for="button in buttons"
          :key="button.label"
          :active="activeItem === button.label"
          @click="setActiveItem(button.label)"
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
import { ref } from 'vue'
import { IconLogout, IconBooks } from '@tabler/icons-vue'

const supabase = useSupabaseClient()

const buttons = [{ label: 'Library', icon: IconBooks, to: '/library' }]
const activeItem = ref()

function setActiveItem(item: string) {
  activeItem.value = item
}

function onTitleClick() {
  navigateTo('/')
}

async function onLogout() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    navigateTo('/login')
  } catch (error) {
    console.log(error)
  }
}
</script>

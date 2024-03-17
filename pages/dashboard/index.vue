<template>
  <div class="w-screen h-screen flex items-center justify-center">
    <bl-button @click="handleLogout">Sign Out</bl-button>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'BookLib | Dashboard',
})

definePageMeta({
  middleware: 'auth',
})

const supabase = useSupabaseClient()

async function handleLogout() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    navigateTo('/login')
  } catch (error) {
    console.log(error)
  }
}
</script>

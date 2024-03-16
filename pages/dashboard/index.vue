<template>
  <div class="w-screen h-screen flex items-center justify-center">
    <button
      class="bg-main py-3 px-5 text-white text-base rounded-3xl font-medium hover:bg-main-light"
      @click="handleLogout"
    >
      Sign Out
    </button>
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

const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    navigateTo('/login')
  } catch (error) {
    console.log(error)
  }
}
</script>

<template>
  <div class="w-screen h-screen flex items-center justify-center">
    <bl-button @click="handleLogin">
      {{ loading ? 'Loading' : 'Google Sign-In' }}
    </bl-button>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()

const loading = ref(false)

const handleLogin = async () => {
  try {
    loading.value = true

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/confirm',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) throw error
  } catch (error) {
    console.log(error)
  }
}
</script>

<template>
  <div
    class="flex items-center justify-center w-12 h-12 rounded-full overflow-hidden bg-gray-200 cursor-pointer"
  >
    <NuxtLink to="/profile">
      <img :src="profileUrl" alt="Profile" class="w-full h-full object-cover" />
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()

const profileUrl = computed(() => user.value?.user_metadata.avatar_url)
console.log(user.value)
</script>

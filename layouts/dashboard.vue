<template>
  <div class="h-screen flex">
    <aside class="h-full w-[255px]">
      <bl-nav-sidebar></bl-nav-sidebar>
    </aside>
    <main class="h-screen flex-1 flex flex-col">
      <nav class="flex gap-16 items-center px-8 py-4 border-b border-b-accent">
        <NuxtLink class="flex-1" to="/library">
          <h5>Library</h5>
        </NuxtLink>
        <ul class="flex gap-5">
          <li class="text-lg">
            <NuxtLink to="/library/books">Books</NuxtLink>
          </li>
          <li class="text-lg">
            <NuxtLink to="/library/collections">Collections</NuxtLink>
          </li>
        </ul>
        <div
          class="flex items-center justify-center w-12 h-12 rounded-full overflow-hidden bg-gray-200 cursor-pointer"
        >
          <NuxtLink to="/profile">
            <img
              :src="profileUrl"
              alt="Profile"
              class="w-full h-full object-cover"
            />
          </NuxtLink>
        </div>
      </nav>
      <div class="flex flex-col flex-1 p-16 pt-10 overflow-auto">
        <slot></slot>
        <NuxtLoadingIndicator color="#985858" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()

const profileUrl = computed(() => user.value?.user_metadata.avatar_url)
</script>

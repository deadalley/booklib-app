<template>
  <div class="flex h-screen">
    <aside class="hidden h-full w-min md:block md:w-[255px]">
      <bl-nav-sidebar></bl-nav-sidebar>
    </aside>
    <main class="flex h-screen flex-1 flex-col">
      <nav class="flex items-center gap-16 border-b border-b-accent px-8 py-4">
        <NuxtLink class="flex-1" to="/library/books">
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
          class="flex size-12 cursor-pointer items-center justify-center overflow-hidden rounded-full"
        >
          <NuxtLink to="/profile">
            <img
              :src="profileUrl"
              alt="Profile"
              class="size-full object-cover"
            />
          </NuxtLink>
        </div>
      </nav>
      <div
        class="flex w-screen flex-1 flex-col overflow-auto p-16 pt-10 md:w-[unset]"
      >
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

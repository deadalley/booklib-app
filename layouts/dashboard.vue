<template>
  <div class="h-screen flex">
    <aside class="h-full w-1/6">
      <bl-nav-sidebar></bl-nav-sidebar>
    </aside>
    <main class="h-full flex-1 flex flex-col">
      <nav class="flex gap-10 items-center px-8 py-4 border-b border-b-accent">
        <NuxtLink class="flex-1" to="/">
          <h4>Library</h4>
        </NuxtLink>
        <ul class="flex gap-3">
          <li class="text-lg">
            <NuxtLink to="library/books">Books</NuxtLink>
          </li>
          <li class="text-lg">
            <NuxtLink to="library/collections">Collections</NuxtLink>
          </li>
        </ul>
        <bl-profile-icon></bl-profile-icon>
      </nav>
      <div class="flex flex-col p-16 pt-10">
        <NuxtPage></NuxtPage>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts"></script>

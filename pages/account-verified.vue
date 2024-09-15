<template>
  <div class="flex h-screen w-screen flex-col items-center p-64">
    <div class="flex max-w-5xl flex-col items-center gap-8">
      <h1>Welcome to BookLib!</h1>
      <h6 class="font-Sarala">
        Your account is ready for you. Start managing your books today.
      </h6>

      <NuxtLink class="w-full" to="/login">
        <bl-button expand class="w-full">Sign in</bl-button>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

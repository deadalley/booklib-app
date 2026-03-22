<template>
  <transition name="sidebar-slide-right">
    <div v-show="open" class="sidebar">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <!-- Title -->
        <h6 v-if="!!title" class="sidebar-title">{{ title }}</h6>

        <!-- Close button -->
        <bl-icon-button variant="secondary" @click="$emit('close')">
          <template #default="iconProps">
            <IconX v-bind="iconProps" />
          </template>
        </bl-icon-button>
      </div>

      <!-- Content -->
      <slot />
    </div>
  </transition>
</template>

<script setup lang="ts">
import { IconX } from '@tabler/icons-vue'

defineProps<{ title?: string; open?: boolean }>()

defineEmits(['close'])
</script>

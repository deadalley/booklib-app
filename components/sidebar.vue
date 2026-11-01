<template>
  <Teleport to="body">
    <transition name="sidebar-fade">
      <div
        v-if="open"
        class="sidebar-backdrop"
        aria-hidden="true"
        @click="$emit('close')"
      />
    </transition>
    <transition name="sidebar-slide-right">
      <aside
        v-show="open"
        class="sidebar"
        role="dialog"
        aria-modal="true"
        :aria-label="title || 'Panel'"
        data-testid="sidebar"
      >
        <!-- Header -->
        <div class="flex items-center justify-between">
          <!-- Title -->
          <h6 v-if="!!title" class="sidebar-title">{{ title }}</h6>

          <!-- Close button -->
          <bl-icon-button
            variant="secondary"
            aria-label="Close panel"
            @click="$emit('close')"
          >
            <template #default="iconProps">
              <IconX v-bind="iconProps" />
            </template>
          </bl-icon-button>
        </div>

        <!-- Content -->
        <slot />
      </aside>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { IconX } from '@tabler/icons-vue'
import { onKeyStroke } from '@vueuse/core'

const props = defineProps<{ title?: string; open?: boolean }>()

const emit = defineEmits(['close'])

onKeyStroke('Escape', () => {
  if (props.open) emit('close')
})
</script>

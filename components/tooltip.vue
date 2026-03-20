<template>
  <TooltipProvider>
    <TooltipRoot :delay-duration="150">
      <TooltipTrigger v-bind="$attrs" class="cursor-default">
        <slot />
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent
          class="bg-surface-elevated z-50 rounded-lg px-3 py-2 drop-shadow-md"
          :side-offset="5"
          :side="side"
        >
          <slot name="tooltip-content" />
          <TooltipArrow class="fill-surface-elevated" :width="8" />
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>

<script setup lang="ts">
import {
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from 'radix-vue'

defineProps<{ side?: 'top' | 'right' | 'bottom' | 'left' }>()
</script>

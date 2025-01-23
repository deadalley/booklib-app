<template>
  <TooltipProvider>
    <TooltipRoot>
      <TooltipTrigger>
        <slot />
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent
          class="rounded-lg bg-white px-3 py-2 drop-shadow-sm"
          :side-offset="5"
        >
          <slot name="tooltip-content" />
          <TooltipArrow class="fill-white" :width="8" />
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
</script>

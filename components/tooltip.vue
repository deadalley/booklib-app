<template>
  <!-- A disabled trigger would render a disabled button that swallows clicks -->
  <div v-if="disabled" v-bind="$attrs">
    <slot />
  </div>
  <TooltipProvider v-else>
    <TooltipRoot :delay-duration="150">
      <TooltipTrigger v-bind="$attrs" class="cursor-default">
        <slot />
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent class="tooltip-content" :side-offset="5" :side="side">
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

defineProps<{
  side?: 'top' | 'right' | 'bottom' | 'left'
  disabled?: boolean
}>()

defineOptions({ inheritAttrs: false })
</script>

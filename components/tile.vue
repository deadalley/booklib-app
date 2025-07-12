<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
  <AccordionRoot
    :default-value="defaultOpen ? 'tile' : undefined"
    class="flex flex-col gap-3 rounded-xl border border-accent bg-white px-8 py-6"
    type="single"
    :collapsible="true"
    :disabled="!$slots['collapsible']"
  >
    <AccordionItem class="h-full" value="tile">
      <AccordionHeader
        v-if="$slots['title'] || $slots['actions']"
        as="div"
        class="accordion-header flex w-full flex-1 items-center justify-between gap-3"
      >
        <div
          class="flex w-full flex-1 items-center justify-between"
          :class="{
            'flex-col gap-3 sm:flex-row': alignHeaderVerticalOnSmallScreens,
          }"
        >
          <AccordionTrigger
            class="flex w-full flex-1 cursor-pointer items-center justify-start"
          >
            <h5 v-if="$slots['title']" class="truncate">
              <slot name="title" />
            </h5>
          </AccordionTrigger>
          <slot name="actions" />
        </div>
        <AccordionTrigger v-if="$slots['collapsible']">
          <IconChevronDown
            class="accordion-chevron cursor-pointer text-accent-darker transition-transform duration-300 ease-in"
            :size="ICON_SIZE_SMALL"
          />
        </AccordionTrigger>
      </AccordionHeader>
      <slot />
      <AccordionContent class="accordion-content h-full">
        <slot name="collapsible" />
      </AccordionContent>
    </AccordionItem>
  </AccordionRoot>
</template>

<script setup lang="ts">
import { IconChevronDown } from '@tabler/icons-vue'
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from 'radix-vue'

withDefaults(
  defineProps<{
    defaultOpen?: boolean
    alignHeaderVerticalOnSmallScreens?: boolean
  }>(),
  { defaultOpen: true },
)
</script>

<style scoped>
.accordion-content {
  overflow: hidden;
}

.accordion-content[data-state='open'] {
  animation: slideDown 300ms ease-out;
  overflow: visible;
}

.accordion-content[data-state='closed'] {
  animation: slideUp 300ms ease-out;
}

.accordion-chevron {
  transition: transform 300ms;
}
.accordion-header[data-state='open'] .accordion-chevron {
  transform: rotate(180deg);
}

@keyframes slideDown {
  from {
    height: 0;
  }
  to {
    height: var(--radix-accordion-content-height);
  }
}

@keyframes slideUp {
  from {
    height: var(--radix-accordion-content-height);
  }
  to {
    height: 0;
  }
}
</style>

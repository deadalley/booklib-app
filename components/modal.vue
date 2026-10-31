<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
  <DialogRoot :open="open" @update:open="(value) => !value && _onCancel()">
    <DialogTrigger v-if="$slots['trigger']" @click="open = true">
      <slot name="trigger" />
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay
        class="data-[state=open]:animate-overlayShow bg-surface-inverse/80 fixed inset-0 z-30"
      />
      <DialogContent
        class="data-[state=open]:animate-contentShow bg-surface-elevated fixed top-1/2 left-1/2 z-100 max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl p-5 focus:outline-none sm:p-7"
        :class="{
          'w-[calc(100vw-2rem)]': size !== undefined,
          'max-w-screen-sm': size === 'sm',
          'max-w-screen-md': size === 'md',
          'max-w-screen-lg': size === 'lg',
          'max-w-screen-xl': size === 'xl',
          'max-w-screen-2xl': size === '2xl',
        }"
      >
        <DialogTitle
          v-if="$slots['title'] || withCloseButton || icon"
          as="div"
          class="items-top mb-4 flex w-full items-start"
        >
          <h4 class="flex flex-1 items-center gap-2">
            <component
              :is="icons[icon]"
              v-if="icon"
              class="text-primary"
              :size="30"
              stroke="1.5"
            />
            <slot name="title" />
          </h4>
          <DialogClose v-if="withCloseButton" as-child>
            <bl-icon-button
              variant="secondary"
              aria-label="Close"
              @click="_onCancel"
            >
              <template #default="iconProps">
                <IconX v-bind="iconProps" />
              </template>
            </bl-icon-button>
          </DialogClose>
        </DialogTitle>
        <div class="relative">
          <slot />
        </div>
        <!-- Footer: stacked full-width buttons on phones, a row otherwise -->
        <div
          v-if="$slots['cancel-label'] || $slots['action-label']"
          class="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-baseline sm:justify-end"
        >
          <bl-button
            v-if="$slots['cancel-label']"
            variant="secondary"
            class="justify-center"
            @click="_onCancel"
          >
            <slot name="cancel-label" />
          </bl-button>
          <bl-button
            v-if="$slots['action-label']"
            class="justify-center"
            @click="_onConfirm"
          >
            <slot name="action-label" />
          </bl-button>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from 'radix-vue'
import { icons, IconX } from '@tabler/icons-vue'

withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
    icon?: keyof typeof icons
    withCloseButton?: boolean
  }>(),
  { withCloseButton: true },
)

const open = defineModel<boolean>({ default: false })

const emit = defineEmits<{ (e: 'cancel' | 'confirm'): void }>()

function _onCancel() {
  emit('cancel')
  open.value = false
}

function _onConfirm() {
  emit('confirm')
  open.value = false
}
</script>

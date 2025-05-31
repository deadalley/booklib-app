<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
  <DialogRoot :open="open">
    <DialogTrigger @click="open = true">
      <slot name="trigger" />
    </DialogTrigger>
    <DialogPortal>
      <DialogOverlay
        class="data-[state=open]:animate-overlayShow fixed inset-0 z-30 bg-black/80"
      />
      <DialogContent
        class="data-[state=open]:animate-contentShow fixed left-1/2 top-1/2 z-[100] max-h-[85vh] -translate-x-1/2 -translate-y-1/2 rounded-[6px] bg-white p-7 focus:outline-none"
        :class="{
          'w-[90vw]': size !== undefined,
          'max-w-screen-sm': size === 'sm',
          'max-w-screen-md': size === 'md',
          'max-w-screen-lg': size === 'lg',
          'max-w-screen-xl': size === 'xl',
          'max-w-screen-2xl': size === '2xl',
        }"
      >
        <DialogTitle
          v-if="$slots['title']"
          as="div"
          class="items-top mb-4 flex w-full items-start"
        >
          <h4 class="flex flex-1 items-center gap-2">
            <component
              :is="icons[icon]"
              v-if="icon"
              class="text-main"
              :size="30"
              stroke="1.5"
            />
            <slot name="title" />
          </h4>
          <DialogClose v-if="withCloseButton">
            <bl-icon-button variant="secondary" @click="_onCancel">
              <template #default="iconProps">
                <IconX v-bind="iconProps" />
              </template>
            </bl-icon-button>
          </DialogClose>
        </DialogTitle>
        <div class="relative">
          <slot />
        </div>
        <div class="flex items-baseline justify-end gap-2">
          <DialogClose>
            <bl-button
              v-if="$slots['cancel-label']"
              variant="secondary"
              @click="_onCancel"
            >
              <slot name="cancel-label" />
            </bl-button>
          </DialogClose>
          <DialogClose>
            <bl-button v-if="$slots['action-label']" @click="_onConfirm">
              <slot name="action-label" />
            </bl-button>
          </DialogClose>
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

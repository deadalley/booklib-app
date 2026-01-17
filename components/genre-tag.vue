<template>
  <div
    v-show="!newGenre || editing"
    ref="target"
    class="relative flex w-fit cursor-default items-center gap-2 rounded-xl px-4 py-1 text-base"
    :class="{
      'cursor-pointer hover:bg-main/90': !!attrs.onClick,
      'bg-main-dark': !!selected,
      'bg-white text-main ring-1 ring-inset ring-main': editing,
      'bg-main text-white': !editing,
    }"
    @click="onClick"
    @mouseenter="setHovered(true)"
    @mouseleave="setHovered(false)"
    @keydown.enter="_onCommit"
    @keydown.escape="onCancel"
  >
    <span v-if="!editing">{{ initialContent }}</span>
    <input
      ref="genre-input"
      v-model="content"
      class="max-w-24 text-black"
      :class="{
        'w-0 opacity-0': !editing,
      }"
    />
    <bl-loading v-if="loading" class="!h-4 !w-4 !fill-white !text-main" />
    <IconCircleXFilled
      v-if="!loading && removable && hovered"
      :size="18"
      stroke="1.5"
      class="cursor-pointer opacity-0"
      :class="{ 'opacity-100': hovered }"
      @click="_onRemove"
    />
    <IconTagFilled
      v-if="!removable || (!loading && !hovered)"
      :size="18"
      stroke="1.5"
    />
  </div>
  <div
    v-if="newGenre && !editing"
    class="relative flex w-fit cursor-default items-center gap-2 rounded-xl bg-main px-4 py-2 text-base text-white hover:bg-main/90"
    @click="onNew"
  >
    <IconPlus :size="16" stroke="2" />
    Add genre
  </div>
</template>

<script setup lang="ts">
/**
 * @deprecated Use `bl-removable-tag` instead.
 */
import { useTemplateRef } from 'vue'
import { IconCircleXFilled, IconPlus, IconTagFilled } from '@tabler/icons-vue'
import { onClickOutside } from '@vueuse/core'

const attrs = useAttrs()

const props = defineProps<{
  value?: string
  index: number
  editable?: boolean
  removable?: boolean
  newGenre?: boolean
  selected?: boolean
  onCommit?: (value: string | undefined, index: number) => void
  onRemove?: (index: number) => void
}>()

const loading = ref(false)
const hovered = ref(false)
const editing = ref(false)
const target = ref(null)
const initialContent = ref(props.value)
const content = ref(props.value)

const inputRef = useTemplateRef('genre-input')

onClickOutside(target, () => {
  if (props.editable) {
    onCancel()
  }
})

function onCancel() {
  inputRef.value?.blur()
  editing.value = false
  content.value = initialContent.value
}

async function _onCommit() {
  loading.value = true
  inputRef.value?.blur()

  await props.onCommit?.(content.value, props.index)

  loading.value = false

  if (props.newGenre) {
    editing.value = false
    initialContent.value = undefined
    content.value = undefined
  }
}

async function _onRemove(event: Event) {
  event.preventDefault()
  event.stopPropagation()

  loading.value = true

  if (props.newGenre && inputRef.value) {
    onCancel()
  } else {
    await props.onRemove?.(props.index)
  }

  loading.value = false
}

function onNew() {
  editing.value = true
  content.value = 'New genre'
  initialContent.value = 'New genre'
  inputRef.value?.focus()
}

function onClick() {
  if (typeof attrs.onClick === 'function') {
    attrs.onClick()
  }

  if (props.editable) {
    editing.value = true
    inputRef.value?.focus()
  }
}

function setHovered(value: boolean) {
  hovered.value = value
}
</script>

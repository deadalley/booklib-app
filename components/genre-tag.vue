<template>
  <div
    v-show="!newGenre || editing"
    ref="target"
    class="relative flex cursor-default items-center gap-2 rounded-m bg-green px-12 py-2 font-medium"
    :class="{
      'cursor-pointer': !!attrs.onClick,
      'bg-main-light text-white  ring-main-light': !!selected,
    }"
    @click="onClick"
    @mouseenter="setHovered(true)"
    @mouseleave="setHovered(false)"
    @keydown.enter="_onCommit"
    @keydown.escape="onCancel"
  >
    <IconTag :size="16" stroke="2"></IconTag>
    <span ref="inputRef" :contenteditable="editing" @input="onChange">{{
      initialContent
    }}</span>
    <bl-loading
      v-if="loading"
      class="!h-4 !w-4 !fill-black !text-gray-dark"
    ></bl-loading>
    <IconCircleX
      v-if="!loading && removable"
      :size="16"
      stroke="2"
      class="absolute right-6 cursor-pointer opacity-0"
      :class="{ 'opacity-100': hovered }"
      @click="_onRemove"
    ></IconCircleX>
  </div>
  <div
    v-if="newGenre && !editing"
    class="flex aspect-square h-[35px] cursor-pointer items-center justify-center rounded-full bg-green py-2 hover:bg-green/80"
    @click="onNew"
  >
    <IconPlus :size="16" stroke="2"></IconPlus>
  </div>
</template>

<script setup lang="ts">
import { IconTag, IconCircleX, IconPlus } from '@tabler/icons-vue'
import { onClickOutside } from '@vueuse/core'

const attrs = useAttrs() as any

const props = defineProps<{
  value?: string
  index: number
  editable?: boolean
  removable?: boolean
  newGenre?: boolean
  selected?: boolean
  onCommit?: (value: string | undefined, index: number) => {}
  onRemove?: (index: number) => {}
}>()

const loading = ref(false)
const hovered = ref(false)
const editing = ref(false)
const focused = ref(false)
const target = ref(null)
const inputRef = ref<HTMLSpanElement | null>(null)
const initialContent = ref(props.value)
const content = ref(props.value)

onClickOutside(target, () => {
  if (props.editable && focused.value) {
    onCancel()
  }
})

function onCancel() {
  focused.value = false
  inputRef.value?.blur()
  editing.value = false
  initialContent.value = undefined
  content.value = undefined
}

async function _onCommit() {
  loading.value = true
  focused.value = false
  inputRef.value?.blur()

  await props.onCommit?.(content.value, props.index)

  loading.value = false

  if (props.newGenre) {
    editing.value = false
    initialContent.value = undefined
    content.value = undefined
  }
}

async function _onRemove() {
  loading.value = true
  await props.onRemove?.(props.index)
  loading.value = false
}

function onNew() {
  editing.value = true
  content.value = 'New Genre'
  initialContent.value = 'New Genre'
  focused.value = true
  inputRef.value?.focus()
}

function onClick() {
  attrs.onClick?.()

  if (props.editable) {
    focused.value = true
    editing.value = true
    inputRef.value?.focus()
  }
}

function onChange($event: Event) {
  const value = ($event.target as HTMLSpanElement)?.innerHTML
  content.value = value
}

function setHovered(value: boolean) {
  hovered.value = value
}
</script>

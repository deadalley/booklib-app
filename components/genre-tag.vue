<template>
  <div
    v-show="!newGenre || editing"
    ref="target"
    class="relative flex w-fit cursor-default items-center gap-2 rounded-lg bg-main px-4 py-2 text-base text-white"
    :class="{
      'cursor-pointer': !!attrs.onClick,
      'bg-main-dark': !!selected,
    }"
    @click="onClick"
    @mouseenter="setHovered(true)"
    @mouseleave="setHovered(false)"
    @keydown.enter="_onCommit"
    @keydown.escape="onCancel"
  >
    <span ref="inputRef" :contenteditable="editing" @input="onChange">{{
      initialContent
    }}</span>
    <bl-loading v-if="loading" class="!h-4 !w-4 !fill-white !text-white" />
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
    class="flex aspect-square h-[35px] cursor-pointer items-center justify-center rounded-full bg-main py-2 text-white hover:bg-main/80"
    @click="onNew"
  >
    <IconPlus :size="16" stroke="2" />
  </div>
</template>

<script setup lang="ts">
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
  // @ts-expect-error onclick should be clickable
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

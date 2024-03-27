<template>
  <div
    v-show="!newGenre || editing"
    ref="target"
    class="relative flex items-center gap-2 px-12 py-2 rounded-m bg-green font-medium cursor-text"
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
      class="!w-4 !h-4 !text-gray-dark !fill-black"
    ></bl-loading>
    <IconCircleX
      v-if="!loading"
      :size="16"
      stroke="2"
      class="absolute right-6 cursor-pointer opacity-0"
      :class="{ 'opacity-100': hovered }"
      @click="_onRemove"
    ></IconCircleX>
  </div>
  <div
    v-if="newGenre && !editing"
    class="flex items-center justify-center cursor-pointer rounded-full py-2 h-[35px] aspect-square bg-green hover:bg-green/80"
    @click="onNew"
  >
    <IconPlus :size="16" stroke="2"></IconPlus>
  </div>
</template>

<script setup lang="ts">
import { IconTag, IconCircleX, IconPlus } from '@tabler/icons-vue'
import { onClickOutside } from '@vueuse/core'

const props = defineProps({
  value: {
    type: String,
    required: false,
  },
  index: {
    type: Number,
    required: true,
  },
  editable: {
    type: Boolean,
    default: false,
  },
  newGenre: {
    type: Boolean,
    default: false,
  },
  onCommit: {
    type: Function,
    required: false,
  },
  onRemove: {
    type: Function,
    required: false,
  },
})

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

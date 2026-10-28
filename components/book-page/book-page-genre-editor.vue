<template>
  <div class="flex flex-wrap items-center gap-2">
    <bl-chip
      v-for="(genre, index) in genres"
      :key="genre"
      rounded
      class="gap-1.5 pr-1.5"
    >
      {{ genre }}
      <button
        type="button"
        class="hover:bg-stroke inline-flex cursor-pointer rounded-full p-0.5"
        :aria-label="`Remove ${genre}`"
        @click="$emit('remove', index)"
      >
        <IconX :size="12" stroke="2" />
      </button>
    </bl-chip>

    <div
      class="form-inner text-ink-muted w-44! gap-1.5! rounded-full! px-3! py-1! text-sm!"
    >
      <IconPlus :size="14" stroke="2" class="shrink-0" />
      <input
        v-model="input"
        class="text-ink-primary w-full min-w-0 outline-none"
        placeholder="Add genre"
        aria-label="Add genre"
        @blur="add"
        @keydown="onKeydown"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconPlus, IconX } from '@tabler/icons-vue'

const props = defineProps<{
  genres: string[]
}>()

const emit = defineEmits<{
  (e: 'add', genre: string): void
  (e: 'remove', index: number): void
}>()

const input = ref('')

function add() {
  const genre = input.value.trim()
  input.value = ''

  if (
    genre &&
    !props.genres.some((g) => g.toLowerCase() === genre.toLowerCase())
  ) {
    emit('add', genre)
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault()
    add()
  } else if (event.key === 'Backspace' && !input.value && props.genres.length) {
    emit('remove', props.genres.length - 1)
  }
}
</script>

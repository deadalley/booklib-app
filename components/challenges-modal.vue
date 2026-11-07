<template>
  <bl-modal v-model="open" size="lg" icon="IconFlame">
    <template #title>Reading challenges</template>
    <template #subtitle>Bigger targets on a fixed clock</template>

    <div class="body" data-testid="challenges-modal">
      <bl-challenge-featured
        layout="stack"
        @pick="(picked) => $emit('pick', picked)"
      />
      <div class="flex justify-end">
        <bl-button color="secondary" @click="$emit('browse')">
          Browse all challenges
          <template #appendIcon="iconProps">
            <IconArrowRight v-bind="iconProps" />
          </template>
        </bl-button>
      </div>
    </div>
  </bl-modal>
</template>

<script setup lang="ts">
import { IconArrowRight } from '@tabler/icons-vue'
import type { ChallengePreset } from '~/utils/challenges'

defineEmits<{
  (e: 'browse'): void
  (e: 'pick', challenge: ChallengePreset): void
}>()

const open = defineModel<boolean>({ default: false })
</script>

<style scoped>
@reference '../assets/css/main.css';

.body {
  @apply -mx-1 flex max-h-[min(70vh,40rem)] flex-col gap-5 overflow-y-auto p-1;
  container-type: inline-size;
}
</style>

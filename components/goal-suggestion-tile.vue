<template>
  <!-- Home's goal summary uses the same v2 card as the statistics page -->
  <bl-stats-goal-card :goal="featuredGoal" class="flex-1" />
</template>

<script setup lang="ts">
import type { Book } from '~/types/book'
import type { Goal } from '~/types/goal'

const { getBooks, getGoals } = useBookLibrary()

const books = ref<Book[]>([])
const goals = ref<Goal[]>([])

onMounted(async () => {
  ;[books.value, goals.value] = await Promise.all([getBooks(), getGoals()])
})

const featuredGoal = computed(() =>
  getFeaturedGoal(goals.value.map((goal) => resolveGoal(goal, books.value))),
)
</script>

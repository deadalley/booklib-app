<template>
  <NuxtLayout name="dashboard" title="Styleguide">
    <div class="flex flex-col gap-6">
      <bl-warning-badge>
        <template #icon="iconProps">
          <IconPalette v-bind="iconProps" />
        </template>
        <template #content>
          Local design system preview for BookLib components, tokens, and common
          states.
        </template>
      </bl-warning-badge>

      <div class="grid grid-cols-12 gap-6">
        <div class="col-span-12 xl:col-span-7">
          <bl-tile>
            <template #title>Buttons</template>
            <div class="flex flex-wrap gap-4">
              <bl-button>Primary</bl-button>
              <bl-button variant="secondary">Secondary</bl-button>
              <bl-button disabled>Disabled</bl-button>
              <bl-button loading>Loading</bl-button>
              <bl-button>
                <template #prependIcon="iconProps">
                  <IconPlus v-bind="iconProps" />
                </template>
                Add book
              </bl-button>
            </div>
          </bl-tile>
        </div>

        <div class="col-span-12 xl:col-span-5">
          <bl-tile>
            <template #title>Tags And Pills</template>
            <div class="flex flex-wrap items-center gap-3">
              <bl-pill>Default</bl-pill>
              <bl-pill selected>Selected</bl-pill>
              <bl-total-tag>128 books</bl-total-tag>
              <bl-total-tag variant="primary">12 finished</bl-total-tag>
            </div>
          </bl-tile>
        </div>

        <div class="col-span-12">
          <bl-tile>
            <template #title>Inputs</template>
            <div class="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
              <bl-input v-model="title" label="Input" />
              <bl-input
                v-model="year"
                label="Number input"
                type="number"
                :min="1000"
                :max="9999"
              />
              <bl-select
                v-model="status"
                label="Select"
                :options="statusOptions"
              />
              <bl-input-autocomplete
                v-model:input="genre"
                label="Input autocomplete"
                :options="genreOptions"
                placeholder="Pick a genre…"
              />
              <bl-dropdown :items="sortItems" with-chevron @click="onSortClick">
                Dropdown: {{ sortLabel }}
              </bl-dropdown>
              <bl-search-bar v-model="search" placeholder="Search bar" />
              <div class="lg:col-span-2 xl:col-span-3">
                <bl-input
                  v-model="notes"
                  label="Textarea"
                  type="textarea"
                  rows="4"
                />
              </div>
              <div class="flex-start flex flex-col gap-3">
                <bl-checkbox v-model="owned">Checkbox align right</bl-checkbox>
                <bl-checkbox v-model="wishlist" align="left">
                  Checkbox align left
                </bl-checkbox>
              </div>
              <bl-slider
                v-model:values="pageRange"
                label="Slider"
                :min="0"
                :max="1000"
                :step="50"
              />
            </div>
          </bl-tile>
        </div>

        <div class="col-span-12 xl:col-span-4">
          <bl-tile>
            <template #title>Selection</template>
            <div class="flex flex-col gap-5">
              <bl-tabs default-value="grid" full>
                <template #options>
                  <bl-tab-option value="grid">Grid</bl-tab-option>
                  <bl-tab-option value="table">Table</bl-tab-option>
                </template>

                <bl-tab value="grid">
                  <p class="text-ink-secondary py-4 text-lg">
                    Card-based browsing with richer visuals.
                  </p>
                </bl-tab>
                <bl-tab value="table">
                  <p class="text-ink-secondary py-4 text-lg">
                    Dense tabular view for sorting and scanning.
                  </p>
                </bl-tab>
              </bl-tabs>
            </div>
          </bl-tile>
        </div>

        <div class="col-span-12 xl:col-span-6">
          <bl-tile>
            <template #title>Feedback</template>
            <div class="flex flex-col gap-5">
              <div class="flex items-center justify-between gap-4">
                <p class="text-lg">Interactive rating</p>
                <bl-rating
                  :rating="rating"
                  :on-commit="onCommitRating"
                  editing
                />
              </div>
              <bl-warning-badge>
                <template #title>Storage note</template>
                <template #icon="iconProps">
                  <IconAlertTriangle v-bind="iconProps" />
                </template>
                <template #content>
                  Sample warning badge with inline icon, title, and descriptive
                  content.
                </template>
              </bl-warning-badge>
            </div>
          </bl-tile>
        </div>

        <div class="col-span-12 xl:col-span-6">
          <bl-tile>
            <template #title>Nav Sidebar Buttons</template>
            <div class="flex flex-col gap-1">
              <bl-nav-sidebar-button to="/styleguide" active>
                <template #icon="iconProps">
                  <IconPalette v-bind="iconProps" />
                </template>
                <span class="nav-sidebar-label">Styleguide</span>
              </bl-nav-sidebar-button>
              <bl-nav-sidebar-button to="/home">
                <template #icon="iconProps">
                  <IconHome v-bind="iconProps" />
                </template>
                <span class="nav-sidebar-label">Home</span>
              </bl-nav-sidebar-button>
              <bl-nav-sidebar-button disabled>
                <template #icon="iconProps">
                  <IconBooks v-bind="iconProps" />
                </template>
                <span class="nav-sidebar-label">Library (disabled)</span>
              </bl-nav-sidebar-button>
            </div>
          </bl-tile>
        </div>

        <div class="col-span-12">
          <bl-tile>
            <template #title>Color Tokens</template>
            <div class="flex flex-col gap-6">
              <div v-for="group in swatchGroups" :key="group.label">
                <p
                  class="text-ink-secondary mb-3 text-sm font-semibold tracking-widest uppercase"
                >
                  {{ group.label }}
                </p>
                <div
                  class="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6"
                >
                  <div
                    v-for="swatch in group.swatches"
                    :key="swatch.label"
                    class="rounded-scholarly border-stroke border p-3"
                  >
                    <div
                      class="rounded-scholarly mb-3"
                      :style="{ background: swatch.color, height: '3rem' }"
                    />
                    <p class="text-sm font-semibold">{{ swatch.label }}</p>
                    <p class="text-ink-secondary font-mono text-xs">
                      {{ swatch.color }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </bl-tile>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  IconAlertTriangle,
  IconBooks,
  IconHome,
  IconPalette,
  IconPlus,
} from '@tabler/icons-vue'
import { activeTheme } from '~/utils/theme'

const title = ref('The Left Hand of Darkness')
const author = ref('Ursula K. Le Guin')
const year = ref('1969')
const notes = ref(
  'Elegant typography and component states should be easy to inspect.',
)
const search = ref('')
const status = ref<string | undefined>(undefined)
const genre = ref<string | undefined>(undefined)
const pageRange = ref<[number, number]>([100, 500])
const sortBy = ref('title')
const owned = ref(true)
const wishlist = ref(false)
const rating = ref(4)

const statusOptions = [
  { label: 'To read', value: 'to-read' },
  { label: 'Reading', value: 'reading' },
  { label: 'Finished', value: 'finished' },
  { label: 'Abandoned', value: 'abandoned' },
]

const genreOptions = [
  { label: 'Science Fiction', value: 'sci-fi' },
  { label: 'Fantasy', value: 'fantasy' },
  { label: 'Mystery', value: 'mystery' },
  { label: 'Non-fiction', value: 'non-fiction' },
  { label: 'Historical', value: 'historical' },
]

const sortItems = [
  { label: 'Title', value: 'title' },
  { label: 'Author', value: 'author' },
  { label: 'Rating', value: 'rating' },
  { label: 'Year', value: 'year' },
]

const sortLabel = computed(
  () => sortItems.find((i) => i.value === sortBy.value)?.label ?? 'Title',
)

function onSortClick(value: string) {
  sortBy.value = value
}

const colors = activeTheme.colors
const swatchGroups = [
  {
    label: 'Surface',
    swatches: [
      { label: 'Canvas', color: colors.surface.canvas },
      { label: 'Default', color: colors.surface.DEFAULT },
      { label: 'Elevated', color: colors.surface.elevated },
      { label: 'Subtle', color: colors.surface.subtle },
      { label: 'Container', color: colors.surface.container },
      { label: 'Dark', color: colors.surface.dark },
    ],
  },
  {
    label: 'Primary',
    swatches: [
      { label: '50', color: colors.primary[50] },
      { label: '100', color: colors.primary[100] },
      { label: '200', color: colors.primary[200] },
      { label: '300', color: colors.primary[300] },
      { label: '400', color: colors.primary[400] },
      { label: 'Default', color: colors.primary.DEFAULT },
      { label: '600', color: colors.primary[600] },
      { label: '700', color: colors.primary[700] },
      { label: '800', color: colors.primary[800] },
      { label: '900', color: colors.primary[900] },
    ],
  },
  {
    label: 'Stroke',
    swatches: [
      { label: 'Subtle', color: colors.stroke.subtle },
      { label: 'Default', color: colors.stroke.DEFAULT },
      { label: 'Strong', color: colors.stroke.strong },
      { label: 'Inverse', color: colors.stroke.inverse },
    ],
  },
  {
    label: 'Ink',
    swatches: [
      { label: 'Muted', color: colors.ink.muted },
      { label: 'Secondary', color: colors.ink.secondary },
      { label: 'Primary', color: colors.ink.primary },
      { label: 'Inverse', color: colors.ink.inverse },
    ],
  },
]

async function onCommitRating(value: number) {
  rating.value = value
}

useHead({
  title: 'BookLib | Styleguide',
})
</script>

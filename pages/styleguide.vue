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
            <div class="flex flex-col gap-6">
              <div class="flex flex-wrap gap-4">
                <bl-button size="sm">Primary</bl-button>
                <bl-button size="sm" variant="secondary">Secondary</bl-button>
                <bl-button size="sm" variant="tertiary">Tertiary</bl-button>
                <bl-button size="sm" disabled>Disabled</bl-button>
                <bl-button size="sm" loading>Loading</bl-button>
                <bl-button size="sm">
                  <template #prependIcon="iconProps">
                    <IconPlus v-bind="iconProps" />
                  </template>
                  Add book
                </bl-button>
              </div>
              <div class="flex flex-wrap gap-4">
                <bl-button>Primary</bl-button>
                <bl-button variant="secondary">Secondary</bl-button>
                <bl-button variant="tertiary">Tertiary</bl-button>
                <bl-button disabled>Disabled</bl-button>
                <bl-button loading>Loading</bl-button>
                <!-- <bl-button>
                  <template #prependIcon="iconProps">
                    <IconPlus v-bind="iconProps" />
                  </template>
                  Add book
                </bl-button> -->
              </div>
              <div class="flex flex-wrap gap-4">
                <bl-button color="primary">Primary</bl-button>
                <bl-button color="primary" variant="secondary">
                  Secondary
                </bl-button>
                <bl-button color="primary" variant="tertiary">
                  Tertiary
                </bl-button>
              </div>
              <div class="flex flex-wrap gap-4">
                <bl-button color="secondary">Primary</bl-button>
                <bl-button color="secondary" variant="secondary">
                  Secondary
                </bl-button>
                <bl-button color="secondary" variant="tertiary">
                  Tertiary
                </bl-button>
              </div>

              <div
                class="border-t-stroke flex flex-wrap items-center gap-4 border-t pt-4"
              >
                <div class="flex flex-col gap-2">
                  <p class="text-ink-secondary text-sm">Switch</p>
                  <bl-switch v-model="previewView">
                    <bl-switch-option
                      value="grid"
                      :selected-value="previewView"
                    >
                      <template #icon="iconProps">
                        <IconLayoutGrid v-bind="iconProps" />
                      </template>
                      <template #tooltip>Grid</template>
                    </bl-switch-option>
                    <bl-switch-option
                      value="list"
                      :selected-value="previewView"
                    >
                      <template #icon="iconProps">
                        <IconList v-bind="iconProps" />
                      </template>
                      <template #tooltip>List</template>
                    </bl-switch-option>
                  </bl-switch>
                </div>

                <div class="flex flex-col gap-2">
                  <p class="text-ink-secondary text-sm">Icon button</p>
                  <div class="flex items-center gap-3">
                    <bl-icon-button>
                      <template #default="iconProps">
                        <IconPlus v-bind="iconProps" />
                      </template>
                    </bl-icon-button>
                    <bl-icon-button variant="secondary">
                      <template #default="iconProps">
                        <IconPalette v-bind="iconProps" />
                      </template>
                    </bl-icon-button>
                    <bl-icon-button variant="tertiary">
                      <template #default="iconProps">
                        <IconPalette v-bind="iconProps" />
                      </template>
                    </bl-icon-button>
                    <bl-icon-button disabled>
                      <template #default="iconProps">
                        <IconPlus v-bind="iconProps" />
                      </template>
                    </bl-icon-button>
                  </div>
                </div>

                <div class="flex flex-col gap-2">
                  <p class="text-ink-secondary text-sm">
                    Icon button sizes (sm · md · lg = 44px)
                  </p>
                  <div class="flex items-center gap-3">
                    <bl-icon-button
                      v-for="size in ICON_BUTTON_SIZES"
                      :key="size"
                      variant="secondary"
                      :size="size"
                      :aria-label="`Next (${size})`"
                    >
                      <IconChevronRight :size="16" stroke="2" />
                    </bl-icon-button>
                  </div>
                </div>
              </div>

              <div class="border-t-stroke flex flex-col gap-3 border-t pt-4">
                <p class="text-ink-secondary text-sm">Links</p>
                <div class="flex flex-wrap items-center gap-6">
                  <a href="#" class="link" @click.prevent>
                    Browse all
                    <IconArrowRight :size="14" stroke="2" />
                  </a>
                  <button type="button" class="link link-quiet">Expand</button>
                  <button type="button" class="link-muted">
                    Clear selection
                  </button>
                  <a href="#" class="link-back" @click.prevent>
                    <IconArrowLeft :size="18" stroke="1.5" />
                    Back
                  </a>
                </div>
                <p class="text-ink-muted text-xs">
                  <code>.link</code>
                  ·
                  <code>.link.link-quiet</code>
                  ·
                  <code>.link-muted</code>
                  ·
                  <code>.link-back</code>
                </p>
              </div>
            </div>
          </bl-tile>
        </div>

        <div class="col-span-12 xl:col-span-5">
          <bl-tile>
            <template #title>Pills & Chips</template>
            <div class="flex flex-col gap-2">
              <p class="text-ink-secondary text-sm">Pills</p>
              <div class="flex flex-wrap items-center gap-3">
                <bl-pill>Default</bl-pill>
                <bl-pill selected>Selected</bl-pill>
                <bl-pill size="sm">Small</bl-pill>
                <bl-pill size="sm" selected>Small selected</bl-pill>
              </div>
              <div class="flex flex-wrap items-center gap-3">
                <bl-pill
                  v-for="genreOption in genreOptions.slice(0, 3)"
                  :key="genreOption.value"
                  as="button"
                  size="sm"
                  :selected="pickedGenres.includes(genreOption.value)"
                  @click="togglePickedGenre(genreOption.value)"
                >
                  {{ genreOption.label }}
                </bl-pill>
                <span class="text-ink-muted text-xs">
                  as="button" toggles (aria-pressed)
                </span>
              </div>

              <div class="border-t-stroke flex flex-col gap-2 border-t pt-4">
                <p class="text-ink-secondary text-sm">Tags</p>
                <div class="flex flex-wrap items-center gap-2">
                  <bl-chip>128 books</bl-chip>
                  <bl-chip variant="primary">12 finished</bl-chip>
                </div>
              </div>

              <div class="border-t-stroke flex flex-col gap-2 border-t pt-4">
                <p class="text-ink-secondary text-sm">Chips</p>
                <div class="flex flex-wrap items-center gap-2">
                  <bl-chip>Default</bl-chip>
                  <bl-chip bold>Bold</bl-chip>
                  <bl-chip rounded>Rounded</bl-chip>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <bl-chip size="sm" rounded bold>
                    <template #prependIcon>
                      <IconTrendingUp
                        :size="14"
                        stroke="2.2"
                        class="text-primary"
                      />
                    </template>
                    vs 2025: +5
                  </bl-chip>
                  <bl-chip size="sm" rounded bold variant="primary">
                    Completed Mar 11
                  </bl-chip>
                  <bl-chip
                    size="sm"
                    rounded
                    bold
                    variant="secondary"
                    color="secondary"
                  >
                    Running
                  </bl-chip>
                  <span class="text-ink-muted text-xs">size="sm"</span>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <bl-chip size="xs" rounded variant="primary">Active</bl-chip>
                  <bl-chip
                    size="xs"
                    rounded
                    variant="secondary"
                    color="secondary"
                  >
                    Paused
                  </bl-chip>
                  <bl-chip size="xs" rounded>Finished</bl-chip>
                  <bl-chip size="xs" rounded variant="secondary">p. 40</bl-chip>
                  <span class="text-ink-muted text-xs">
                    size="xs": status badges
                  </span>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <bl-chip variant="primary">Primary</bl-chip>
                  <bl-chip variant="primary" bold>Bold</bl-chip>
                  <bl-chip variant="primary" rounded>Rounded</bl-chip>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <bl-chip variant="secondary">Secondary</bl-chip>
                  <bl-chip variant="secondary" bold>Bold</bl-chip>
                  <bl-chip variant="secondary" rounded>Rounded</bl-chip>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <bl-chip variant="primary" color="secondary">Primary</bl-chip>
                  <bl-chip variant="primary" color="secondary" bold>
                    Bold
                  </bl-chip>
                  <bl-chip variant="primary" color="secondary" rounded>
                    Rounded
                  </bl-chip>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <bl-chip variant="secondary" color="secondary">
                    Secondary
                  </bl-chip>
                  <bl-chip variant="secondary" color="secondary" bold>
                    Bold
                  </bl-chip>
                  <bl-chip variant="secondary" color="secondary" rounded>
                    Rounded
                  </bl-chip>
                </div>
              </div>
            </div>
          </bl-tile>
        </div>

        <div class="col-span-12">
          <bl-tile>
            <template #title>Breadcrumbs</template>
            <div class="flex flex-col gap-2">
              <bl-breadcrumbs :items="breadcrumbsLibrary" />
            </div>
          </bl-tile>
        </div>

        <div class="col-span-12">
          <bl-tile>
            <template #title>Inputs</template>
            <div class="flex flex-col gap-8">
              <div class="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
                <bl-input v-model="title" label="Input" />
                <bl-input
                  v-model="year"
                  label="Number input"
                  type="number"
                  :min="1000"
                  :max="9999"
                />
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
                  <bl-checkbox v-model="owned">
                    Checkbox align right
                  </bl-checkbox>
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

              <div class="border-t-stroke flex flex-col gap-4 border-t pt-6">
                <div
                  class="flex flex-col justify-between gap-4 md:flex-row md:items-end"
                >
                  <h6>Select Menus</h6>
                  <div class="flex items-center gap-3">
                    <bl-switch v-model="menuSide">
                      <bl-switch-option
                        value="bottom"
                        :selected-value="menuSide"
                      >
                        <template #icon="iconProps">
                          <IconChevronDown v-bind="iconProps" />
                        </template>
                        <template #tooltip>Bottom</template>
                      </bl-switch-option>
                      <bl-switch-option value="top" :selected-value="menuSide">
                        <template #icon="iconProps">
                          <IconChevronUp v-bind="iconProps" />
                        </template>
                        <template #tooltip>Top</template>
                      </bl-switch-option>
                    </bl-switch>
                  </div>
                </div>

                <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
                  <div
                    class="rounded-scholarly border-stroke bg-surface border p-4"
                  >
                    <p
                      class="text-ink-secondary mb-3 text-xs tracking-widest uppercase"
                    >
                      Select
                    </p>
                    <div class="flex flex-col gap-4">
                      <div class="flex flex-col gap-2">
                        <p class="text-ink-secondary text-xs">Raw</p>
                        <bl-raw-select
                          v-model="statusRaw"
                          :options="statusOptions"
                          placeholder="Pick a status..."
                          :side="menuSide"
                        />
                      </div>
                      <bl-select
                        v-model="status"
                        label="Editing"
                        :options="statusOptions"
                        placeholder="Pick a status..."
                        :side="menuSide"
                      />
                      <bl-select
                        v-model="statusReadOnly"
                        label="Not editing"
                        :options="statusOptions"
                        :editing="false"
                        :side="menuSide"
                      />
                    </div>
                  </div>

                  <div
                    class="rounded-scholarly border-stroke bg-surface border p-4"
                  >
                    <p
                      class="text-ink-secondary mb-3 text-xs tracking-widest uppercase"
                    >
                      Input autocomplete
                    </p>
                    <div class="flex flex-col gap-4">
                      <div class="flex flex-col gap-2">
                        <p class="text-ink-secondary text-xs">Raw</p>
                        <bl-raw-autocomplete
                          v-model="genreRaw"
                          :options="genreOptions"
                          placeholder="Pick a genre…"
                          :side="menuSide"
                        />
                      </div>
                      <bl-input-autocomplete
                        v-model:input="genre"
                        label="Editing"
                        :options="genreOptions"
                        placeholder="Pick a genre…"
                        :side="menuSide"
                      />
                      <bl-input-autocomplete
                        v-model:input="genreReadOnly"
                        label="Not editing"
                        :options="genreOptions"
                        :editing="false"
                        :side="menuSide"
                      />
                    </div>
                  </div>

                  <div
                    class="rounded-scholarly border-stroke bg-surface border p-4"
                  >
                    <p
                      class="text-ink-secondary mb-3 text-xs tracking-widest uppercase"
                    >
                      Dropdown
                    </p>
                    <div class="flex flex-col gap-4">
                      <bl-dropdown
                        :items="sortItems"
                        with-chevron
                        :side="menuSide"
                        @click="onSortClick"
                      >
                        Editing: {{ sortLabel }}
                      </bl-dropdown>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </bl-tile>
        </div>

        <div class="col-span-12 xl:col-span-4">
          <bl-tile>
            <template #title>Tabs</template>
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
            <template #title>Badges & tags</template>
            <div class="flex flex-col gap-4">
              <div class="flex flex-wrap items-center gap-2">
                <bl-chip rounded>Science fiction</bl-chip>
                <bl-chip rounded size="sm">Fantasy</bl-chip>
                <bl-chip rounded removable remove-label="Remove genre">
                  Removable
                </bl-chip>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <bl-challenge-difficulty-badge
                  v-for="level in CHALLENGE_LEVELS"
                  :key="level"
                  :level="level"
                />
                <bl-challenge-badge :level="2" />
              </div>
            </div>
          </bl-tile>
        </div>

        <div class="col-span-12 xl:col-span-6">
          <bl-tile>
            <template #title>Progress & carousels</template>
            <div class="flex flex-col gap-4">
              <div
                v-for="size in PROGRESS_SIZES"
                :key="size"
                class="flex items-center gap-3"
              >
                <span class="text-ink-muted w-6 text-xs">{{ size }}</span>
                <bl-progress-bar :progress-value="62" :size="size" />
              </div>
              <div class="flex flex-wrap items-center gap-6">
                <bl-carousel-dots
                  v-model="dotIndex"
                  :count="5"
                  label="Highlight"
                />
                <bl-carousel-dots
                  v-model="dotIndex"
                  :count="5"
                  label="Insight"
                  size="sm"
                />
                <span class="text-ink-muted text-xs">
                  carousel-dots md (44px targets) · sm
                </span>
              </div>
            </div>
          </bl-tile>
        </div>

        <div class="col-span-12">
          <bl-tile>
            <template #title>Cards & tiles</template>
            <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <bl-stats-kpi icon="IconBooks" value="18" unit="books finished">
                <bl-chip size="sm" rounded bold class="mt-1">
                  vs 2025: +5
                </bl-chip>
              </bl-stats-kpi>
              <bl-stats-tile title="Stats tile" sub="Title, sub and actions">
                <bl-stats-empty label="No data" />
              </bl-stats-tile>
              <bl-section-tile href="/styleguide" icon="IconSparkles">
                <template #eyebrow>Eyebrow</template>
                <template #label>Section tile</template>
                <template #description>The whole card is the link.</template>
              </bl-section-tile>
            </div>
          </bl-tile>
        </div>

        <div class="col-span-12">
          <bl-tile>
            <template #title>Option cards</template>
            <div class="flex flex-col gap-5">
              <div class="grid grid-cols-2 gap-2 md:grid-cols-4">
                <bl-option-card
                  v-for="option in OPTION_CARDS"
                  :key="option.title"
                  size="sm"
                  :icon="option.icon"
                  :title="option.title"
                  :selected="pickedOption === option.title"
                  :aria-pressed="pickedOption === option.title"
                  @click="pickedOption = option.title"
                />
              </div>
              <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
                <bl-option-card
                  title="JSON"
                  description="Row layout (default), size md, selected"
                  selected
                >
                  <template #trailing>
                    <IconChevronRight :size="18" stroke="1.5" />
                  </template>
                </bl-option-card>
                <bl-option-card
                  layout="stack"
                  size="sm"
                  icon="IconBooks"
                  title="Stack, size sm"
                />
              </div>
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <bl-option-card
                  layout="stack"
                  size="lg"
                  icon="IconTarget"
                  title="Size lg"
                  description="Picks a path. Footer slot below."
                >
                  <template #footer>Primary tone</template>
                </bl-option-card>
                <bl-option-card
                  layout="stack"
                  size="lg"
                  tone="secondary"
                  icon="IconFlame"
                  title="Secondary tone"
                  description="The amber treatment, e.g. challenges."
                >
                  <template #footer>tone="secondary"</template>
                </bl-option-card>
              </div>
            </div>
          </bl-tile>
        </div>

        <div class="col-span-12 xl:col-span-6">
          <bl-tile>
            <template #title>Overlays</template>
            <div class="flex flex-wrap items-center gap-4">
              <bl-modal size="sm" icon="IconSparkles">
                <template #trigger>
                  <bl-button variant="secondary">Open modal</bl-button>
                </template>
                <template #title>Modal title</template>
                <template #subtitle>Optional subtitle</template>
                <p class="text-ink-secondary">Modal body content.</p>
                <template #cancel-label>Cancel</template>
                <template #action-label>Confirm</template>
              </bl-modal>
              <bl-tooltip>
                <bl-button variant="tertiary">Hover for tooltip</bl-button>
                <template #tooltip-content>Tooltip content</template>
              </bl-tooltip>
            </div>
          </bl-tile>
        </div>

        <div class="col-span-12 xl:col-span-6">
          <bl-tile>
            <template #title>Empty states</template>
            <bl-empty icon="IconBooks">
              <template #label>Nothing here yet</template>
              <template #action>
                <bl-button size="sm">Add a book</bl-button>
              </template>
            </bl-empty>
          </bl-tile>
        </div>

        <div class="col-span-12">
          <bl-tile>
            <template #title>Book Status Stepper</template>
            <div class="flex flex-col gap-3">
              <bl-book-status-stepper
                :current-status="stepperStatus"
                @status-select="onStepperStatusSelect"
              />
              <p class="text-ink-secondary text-sm">
                Selected status:
                <span class="text-ink-primary font-semibold">
                  {{ stepperStatus }}
                </span>
              </p>
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
            <template #title>Typography</template>
            <div class="flex flex-col gap-10">
              <!-- Headings -->
              <div>
                <p
                  class="text-ink-secondary mb-4 text-sm font-semibold tracking-widest uppercase"
                >
                  Headings
                </p>
                <div class="flex flex-col gap-3">
                  <div
                    v-for="heading in typographyHeadings"
                    :key="heading.tag"
                    class="border-stroke flex flex-wrap items-baseline gap-4 border-b pb-3 last:border-b-0"
                  >
                    <component :is="heading.tag" class="flex-1">
                      {{ heading.sample }}
                    </component>
                    <span
                      class="text-ink-muted font-mono text-xs whitespace-nowrap"
                    >
                      {{ heading.tag }} &mdash; {{ heading.size }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Body text -->
              <div>
                <p
                  class="text-ink-secondary mb-4 text-sm font-semibold tracking-widest uppercase"
                >
                  Body &amp; UI text
                </p>
                <div
                  class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
                >
                  <div
                    v-for="variant in typographyBody"
                    :key="variant.label"
                    class="rounded-scholarly border-stroke border p-4"
                  >
                    <p :class="variant.class">{{ variant.sample }}</p>
                    <p class="text-ink-muted mt-2 font-mono text-xs">
                      {{ variant.label }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Font families -->
              <div>
                <p
                  class="text-ink-secondary mb-4 text-sm font-semibold tracking-widest uppercase"
                >
                  Font Families
                </p>
                <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div
                    v-for="family in typographyFamilies"
                    :key="family.label"
                    class="rounded-scholarly border-stroke border p-4"
                  >
                    <p :class="[family.class, 'text-2xl leading-snug']">
                      {{ family.sample }}
                    </p>
                    <p class="text-ink-muted mt-2 font-mono text-xs">
                      {{ family.label }}
                    </p>
                    <p class="text-ink-muted font-mono text-xs">
                      {{ family.stack }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Ink scale -->
              <div>
                <p
                  class="text-ink-secondary mb-4 text-sm font-semibold tracking-widest uppercase"
                >
                  Ink colour scale
                </p>
                <div class="flex flex-col gap-3">
                  <div
                    v-for="ink in typographyInk"
                    :key="ink.label"
                    class="border-stroke flex items-baseline gap-4 border-b pb-3 last:border-b-0"
                  >
                    <p :class="[ink.class, 'flex-1 text-lg']">
                      The quick brown fox jumps over the lazy dog
                    </p>
                    <span
                      class="font-mono text-xs whitespace-nowrap"
                      :style="{ color: ink.hex }"
                    >
                      {{ ink.label }} — {{ ink.hex }}
                    </span>
                  </div>
                </div>
              </div>
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
  IconArrowLeft,
  IconArrowRight,
  IconBooks,
  IconChevronRight,
  IconTrendingUp,
  IconChevronDown,
  IconChevronUp,
  IconHome,
  IconLayoutGrid,
  IconList,
  IconPalette,
  IconPlus,
} from '@tabler/icons-vue'
import type { BookProgressStatus } from '~/types/book'
import { activeTheme } from '~/utils/theme'

const title = ref('The Left Hand of Darkness')
const year = ref('1969')
const notes = ref(
  'Elegant typography and component states should be easy to inspect.',
)
const search = ref('')
const status = ref<string | undefined>(undefined)
const genre = ref<string | undefined>(undefined)
const statusReadOnly = ref<string | undefined>('reading')
const genreReadOnly = ref<string | undefined>('fantasy')
const statusRaw = ref<string | undefined>('finished')
const genreRaw = ref<string | undefined>('sci-fi')
const menuSide = ref<'top' | 'bottom'>('bottom')
const previewView = ref<'grid' | 'list'>('grid')
const pageRange = ref<[number, number]>([100, 500])
const sortBy = ref('title')
const owned = ref(true)
const wishlist = ref(false)
const rating = ref(4)
const stepperStatus = ref<BookProgressStatus>('reading')
const dotIndex = ref(1)
const pickedOption = ref('Paperback')
const OPTION_CARDS = [
  { title: 'Hardcover', icon: 'IconBook' },
  { title: 'Paperback', icon: 'IconBook2' },
  { title: 'Ebook', icon: 'IconDeviceTablet' },
  { title: 'Audiobook', icon: 'IconHeadphones' },
] as const
const pickedGenres = ref<string[]>(['sci-fi'])

const ICON_BUTTON_SIZES = ['sm', 'md', 'lg'] as const
const PROGRESS_SIZES = ['xs', 'sm', 'md', 'lg'] as const
const CHALLENGE_LEVELS = [1, 2, 3] as const

function togglePickedGenre(value: string) {
  pickedGenres.value = pickedGenres.value.includes(value)
    ? pickedGenres.value.filter((genre) => genre !== value)
    : [...pickedGenres.value, value]
}

const breadcrumbsLibrary = [
  { label: 'Library', to: '/library/books' },
  { label: 'Books', to: '/library/books' },
  { label: 'The Left Hand of Darkness' },
]

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

function onStepperStatusSelect(status: BookProgressStatus) {
  stepperStatus.value = status
}

const colors = activeTheme.colors

const typographyHeadings = [
  {
    tag: 'h1',
    sample: 'Heading 1 — The Left Hand of Darkness',
    size: 'text-5xl / 3rem',
  },
  {
    tag: 'h2',
    sample: 'Heading 2 — Ursula K. Le Guin',
    size: 'text-4xl / 2.25rem',
  },
  {
    tag: 'h3',
    sample: 'Heading 3 — Hainish Cycle, 1969',
    size: 'text-3xl / 1.875rem',
  },
  {
    tag: 'h4',
    sample: 'Heading 4 — Science Fiction',
    size: 'text-2xl / 1.5rem',
  },
  { tag: 'h5', sample: 'Heading 5 — 286 pages', size: 'text-xl / 1.25rem' },
  {
    tag: 'h6',
    sample: 'Heading 6 — Finished reading',
    size: 'text-lg / 1.125rem',
  },
]

const typographyBody = [
  {
    label: 'text-base (body)',
    class: 'text-base',
    sample: 'Body text — used for most UI copy and descriptions.',
  },
  {
    label: 'text-sm (small)',
    class: 'text-sm',
    sample: 'Small text — labels, captions, and secondary details.',
  },
  {
    label: 'text-xs (extra small)',
    class: 'text-xs',
    sample: 'Extra small — badges, metadata, monospace values.',
  },
  {
    label: 'text-lg (large)',
    class: 'text-lg',
    sample: 'Large body — section intros and prominent descriptions.',
  },
  {
    label: 'font-semibold',
    class: 'text-base font-semibold',
    sample: 'Semibold — button labels, list headers, emphasis.',
  },
  {
    label: 'font-mono text-sm',
    class: 'font-mono text-sm',
    sample: 'Monospace — hex values, IDs, code snippets.',
  },
]

const typographyFamilies = [
  {
    label: 'font-display',
    class: 'font-display',
    sample: 'The Left Hand of Darkness',
    stack: activeTheme.fontFamily.display.join(', '),
  },
  {
    label: 'font-body (sans)',
    class: 'font-body',
    sample: 'Ursula K. Le Guin • 1969',
    stack: activeTheme.fontFamily.body.join(', '),
  },
  {
    label: 'font-mono',
    class: 'font-mono',
    sample: 'ISBN 978-0-441-47812-5',
    stack: activeTheme.fontFamily.mono.join(', '),
  },
]

const typographyInk = [
  { label: 'ink-primary', class: 'text-ink-primary', hex: colors.ink.primary },
  {
    label: 'ink-secondary',
    class: 'text-ink-secondary',
    hex: colors.ink.secondary,
  },
  { label: 'ink-subtle', class: 'text-ink-subtle', hex: colors.ink.subtle },
  { label: 'ink-muted', class: 'text-ink-muted', hex: colors.ink.muted },
  {
    label: 'ink-inverse (on dark)',
    class: 'text-ink-inverse bg-surface-dark rounded px-2 py-0.5',
    hex: colors.ink.inverse,
  },
]
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
    label: 'Secondary',
    swatches: [
      { label: '50', color: colors.secondary[50] },
      { label: '100', color: colors.secondary[100] },
      { label: '200', color: colors.secondary[200] },
      { label: '300', color: colors.secondary[300] },
      { label: '400', color: colors.secondary[400] },
      { label: 'Default', color: colors.secondary.DEFAULT },
      { label: '600', color: colors.secondary[600] },
      { label: '700', color: colors.secondary[700] },
      { label: '800', color: colors.secondary[800] },
      { label: '900', color: colors.secondary[900] },
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
      { label: 'Subtle', color: colors.ink.subtle },
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
